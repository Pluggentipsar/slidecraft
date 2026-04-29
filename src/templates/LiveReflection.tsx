"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { EditableText } from "@/lib/inline-edit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useInlineEdit } from "@/lib/inline-edit";
import type { Interaction, InteractionResponse } from "@/lib/interactions";

/**
 * LiveReflection — open-ended textinmatning från publiken via Supabase.
 *
 * Bygger på samma pattern som LivePoll men för fri-textsvar:
 *   1. Skapar/hittar en `reflection`-interaktion baserad på pollKey
 *   2. Lyssnar på `interaction_responses` via realtime
 *   3. Visar svaren som ett växande "wall of cards" där nya svar dimper in
 *
 * Använd för:
 * - "Vad vill du att jag inte missar idag?"
 * - "Vilken elev tänkte du på i bikupan?"
 * - Vilken som helst öppen reflektion där publikens röster ska synas live
 *
 * MDX-format:
 *
 *   <LiveReflection
 *     chapter="§ I · Inledning"
 *     title="Vad vill du att jag inte missar idag?"
 *     subtitle="Skanna QR-koden, skriv ditt svar — jag bockar av allt jag tar upp."
 *     pollKey="missa-inte"
 *     placeholder="Något du verkligen hoppas vi pratar om…"
 *   />
 */

interface LiveReflectionProps {
  chapter?: string;
  title?: string;
  subtitle?: string;
  /** Unik nyckel — kort och beskrivande, t.ex. "missa-inte". */
  pollKey: string;
  /** Placeholder som visas i editor-läget för redigerbarhet. */
  placeholder?: string;
  /** Visa max antal kort (de senaste). Default 24. */
  maxCards?: number | string;
  background?: string;
  accent?: string;
  overlay?: number | string;
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  if (!bg) return "radial-gradient(ellipse at 50% 30%, #1a1410 0%, #0a0908 70%)";
  if (bg.startsWith("/") || bg.startsWith("http")) {
    const a = overlay;
    return `linear-gradient(rgba(10,9,8,${a}), rgba(10,9,8,${Math.min(
      1,
      a + 0.1
    )})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

const CARD_TINTS = [
  "rgba(180,118,58,0.10)",
  "rgba(103,212,205,0.08)",
  "rgba(233,179,107,0.10)",
  "rgba(156,143,255,0.08)",
  "rgba(244,166,205,0.10)",
];

export function LiveReflection({
  chapter,
  title,
  subtitle,
  pollKey,
  placeholder = "Skriv din reflektion…",
  maxCards = 24,
  background,
  accent = "#EC7E26",
  overlay = 0.55,
}: LiveReflectionProps) {
  const overlayNum = typeof overlay === "string" ? parseFloat(overlay) : overlay;
  const maxCardsNum = typeof maxCards === "string" ? parseInt(maxCards, 10) : maxCards;
  const { editMode } = useInlineEdit();

  const [responses, setResponses] = useState<InteractionResponse[]>([]);
  const [state, setState] = useState<
    "idle" | "searching" | "no-session" | "active" | "error"
  >(() => {
    if (editMode) return "idle";
    return isSupabaseConfigured() ? "searching" : "no-session";
  });
  const [sessionCode, setSessionCode] = useState<string | null>(null);

  // Hitta session + skapa/hitta interaction
  useEffect(() => {
    if (editMode) return;
    const sb = getSupabase();
    if (!sb) return;

    let cancelled = false;
    // Håll kanal-ref:en tillgänglig för cleanup. Behövs eftersom Supabase
    // returnerar SAMMA kanal vid återanvänt namn — och det tillåter inte
    // nya .on()-callbacks efter .subscribe().
    let activeChannel: ReturnType<typeof sb.channel> | null = null;

    (async () => {
      // Hämta session från localStorage (samma logik som LivePoll)
      let sessionId: string | null = null;
      try {
        const LS_PREFIX = "presenter-session:";
        let best: { id: string; code?: string; expires_at: string } | null = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith(LS_PREFIX)) continue;
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw) as {
              id?: string;
              code?: string;
              expires_at?: string;
            };
            if (!parsed?.id || !parsed?.expires_at) continue;
            if (new Date(parsed.expires_at).getTime() < Date.now()) continue;
            if (
              !best ||
              new Date(parsed.expires_at).getTime() >
                new Date(best.expires_at).getTime()
            ) {
              best = {
                id: parsed.id,
                code: parsed.code,
                expires_at: parsed.expires_at,
              };
            }
          } catch {
            // skip
          }
        }
        if (best) {
          sessionId = best.id;
          if (best.code) setSessionCode(best.code);
        }
      } catch {
        // ignore
      }

      if (!sessionId) {
        if (!cancelled) setState("no-session");
        return;
      }

      // Hitta befintlig interaction med matchande prompt-prefix
      const promptKey = `[${pollKey}]`;
      const { data: existing } = await sb
        .from("interactions")
        .select("*")
        .eq("session_id", sessionId)
        .ilike("prompt", `${promptKey}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      let current: Interaction | null = existing as Interaction | null;

      if (!current) {
        const fullPrompt = `${promptKey} ${title ?? "Reflektion"}`;
        const { data: created, error } = await sb
          .from("interactions")
          .insert({
            session_id: sessionId,
            type: "reflection",
            prompt: fullPrompt,
            options: null,
            slide_index: null,
          })
          .select("*")
          .single();
        if (error || !created) {
          if (!cancelled) setState("error");
          return;
        }
        current = created as Interaction;
      }

      if (cancelled) return;
      setState("active");

      // Hämta befintliga svar
      const { data: existingResponses } = await sb
        .from("interaction_responses")
        .select("*")
        .eq("interaction_id", current.id)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (existingResponses) {
        setResponses(existingResponses as InteractionResponse[]);
      }

      if (cancelled) return;

      // Skapa en unik kanal per mount. Två .on() innan .subscribe() för
      // INSERT + UPDATE (audience kan uppdatera sitt svar). Använd nonce
      // i kanal-namnet så vi aldrig återanvänder en redan-subscribad kanal.
      const nonce =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10);
      const channel = sb.channel(`reflection:${current.id}:${nonce}`);
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interaction_responses",
          filter: `interaction_id=eq.${current.id}`,
        },
        (payload) => {
          setResponses((prev) => {
            const existing = prev.find(
              (r) => r.id === (payload.new as InteractionResponse).id
            );
            if (existing) return prev;
            return [...prev, payload.new as InteractionResponse];
          });
        }
      );
      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "interaction_responses",
          filter: `interaction_id=eq.${current.id}`,
        },
        (payload) => {
          setResponses((prev) =>
            prev.map((r) =>
              r.id === (payload.new as InteractionResponse).id
                ? (payload.new as InteractionResponse)
                : r
            )
          );
        }
      );
      channel.subscribe();
      activeChannel = channel;
    })();

    return () => {
      cancelled = true;
      // Städa upp kanalen så nästa mount kan registrera fresh callbacks
      if (activeChannel) {
        const sb2 = getSupabase();
        if (sb2) sb2.removeChannel(activeChannel);
      }
    };
  }, [pollKey, editMode, title]);

  // Filtrera bort tomma svar och behåll de senaste
  const visibleResponses = useMemo(() => {
    const withText = responses.filter(
      (r) => typeof r.text === "string" && r.text.trim().length > 0
    );
    // Sortera nyast först
    withText.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return withText.slice(0, maxCardsNum);
  }, [responses, maxCardsNum]);

  const totalCount = responses.filter(
    (r) => typeof r.text === "string" && r.text.trim().length > 0
  ).length;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background, overlayNum) }}
    >
      {/* Atmosfär */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${accent}1a 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Chapter */}
      {chapter ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3.5rem)",
            right: "clamp(2rem, 4vw, 3.5rem)",
            fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
            fontSize: "clamp(0.7rem, 0.9vw, 0.95rem)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            zIndex: 3,
          }}
        >
          <EditableText path="chapter" value={chapter}>
            {chapter}
          </EditableText>
        </motion.div>
      ) : null}

      {/* Live-indikator + count */}
      {state === "active" ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3.5rem)",
            left: "clamp(2rem, 4vw, 3.5rem)",
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
              fontSize: "clamp(0.7rem, 0.85vw, 0.9rem)",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: accent,
              fontWeight: 600,
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginRight: "0.3em" }}
            >
              ●
            </motion.span>
            Live · {totalCount} svar
          </div>
          {sessionCode ? (
            <div
              style={{
                fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                fontSize: "clamp(0.65rem, 0.8vw, 0.8rem)",
                color: "color-mix(in srgb, var(--text) 60%, transparent)",
                letterSpacing: "0.18em",
              }}
            >
              session {sessionCode}
            </div>
          ) : null}
        </motion.div>
      ) : null}

      {/* Innehåll */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "clamp(2rem, 4vw, 4rem)",
          paddingTop: "clamp(5rem, 9vh, 7rem)",
          gap: "clamp(1rem, 2vh, 1.8rem)",
          zIndex: 2,
        }}
      >
        {/* Rubrik + subtitle */}
        <div style={{ flexShrink: 0 }}>
          {title ? (
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontFamily: "var(--font-display, Fraunces, serif)",
                fontWeight: 600,
                fontSize: "clamp(1.7rem, 3vw, 2.8rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--text)",
                margin: 0,
                maxWidth: "55rem",
              }}
            >
              <EditableText path="title" value={title}>
                {title}
              </EditableText>
            </motion.h2>
          ) : null}
          {subtitle ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{
                fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
                fontSize: "clamp(0.95rem, 1.3vw, 1.25rem)",
                color: "color-mix(in srgb, var(--text) 70%, transparent)",
                marginTop: "0.55rem",
                maxWidth: "48rem",
                lineHeight: 1.45,
              }}
            >
              <EditableText path="subtitle" value={subtitle}>
                {subtitle}
              </EditableText>
            </motion.p>
          ) : null}
        </div>

        {/* Wall of responses */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            position: "relative",
          }}
        >
          {state === "no-session" ? (
            <EmptyState
              title="Ingen aktiv session"
              body="Starta presenter-session via menyn (M) för att samla in svar live."
            />
          ) : state === "active" && visibleResponses.length === 0 ? (
            <EmptyState
              title="Väntar på första svaret…"
              body="Audience scannar QR-koden och skriver fritt."
              accent={accent}
            />
          ) : state === "idle" ? (
            <EditorPreview placeholder={placeholder} />
          ) : (
            <ResponseWall
              responses={visibleResponses}
              accent={accent}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function ResponseWall({
  responses,
  accent,
}: {
  responses: InteractionResponse[];
  accent: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
        gap: "clamp(0.5rem, 1vw, 0.85rem)",
        alignContent: "start",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <AnimatePresence initial={false}>
        {responses.map((r, i) => (
          <ResponseCard
            key={r.id}
            text={r.text ?? ""}
            featured={r.featured}
            tintIndex={i}
            accent={accent}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ResponseCard({
  text,
  featured,
  tintIndex,
  accent,
}: {
  text: string;
  featured: boolean;
  tintIndex: number;
  accent: string;
}) {
  const tint = CARD_TINTS[tintIndex % CARD_TINTS.length];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.22, 1.2, 0.36, 1] }}
      style={{
        background: featured
          ? `linear-gradient(180deg, ${accent}22, ${accent}0c)`
          : tint,
        border: featured
          ? `1.5px solid ${accent}88`
          : "1px solid rgba(255,255,255,0.10)",
        borderRadius: "0.75rem",
        padding: "clamp(0.7rem, 1.1vw, 1rem) clamp(0.85rem, 1.3vw, 1.1rem)",
        boxShadow: featured
          ? `0 0 28px ${accent}44`
          : "0 2px 14px rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display, Fraunces, serif)",
          fontWeight: featured ? 600 : 500,
          fontSize: "clamp(0.85rem, 1.05vw, 1.05rem)",
          lineHeight: 1.4,
          color: "var(--text)",
          letterSpacing: "-0.005em",
          // Begränsa höjd så väldigt långa svar inte tar över
          display: "-webkit-box",
          WebkitLineClamp: 5,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

function EmptyState({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display, Fraunces, serif)",
          fontWeight: 500,
          fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)",
          color: accent ?? "var(--text)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body, Inter, system-ui, sans-serif)",
          fontSize: "clamp(0.85rem, 1.05vw, 1rem)",
          color: "var(--text-muted)",
          maxWidth: "32rem",
          lineHeight: 1.4,
        }}
      >
        {body}
      </div>
    </div>
  );
}

function EditorPreview({ placeholder }: { placeholder: string }) {
  // Visar 3 dummy-kort med placeholder så det ser ut som det kommer göra live
  const samples = [
    placeholder,
    "Exempel: AI och bedömning",
    "Exempel: Tillgänglighet",
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
        gap: "clamp(0.5rem, 1vw, 0.85rem)",
        alignContent: "start",
        height: "100%",
        overflow: "hidden",
        opacity: 0.45,
      }}
    >
      {samples.map((s, i) => (
        <div
          key={i}
          style={{
            background: CARD_TINTS[i % CARD_TINTS.length],
            border: "1px dashed rgba(255,255,255,0.18)",
            borderRadius: "0.75rem",
            padding: "1rem",
            fontFamily: "var(--font-display, Fraunces, serif)",
            fontStyle: "italic",
            fontSize: "clamp(0.85rem, 1.05vw, 1.05rem)",
            color: "color-mix(in srgb, var(--text) 70%, transparent)",
            lineHeight: 1.4,
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
}
