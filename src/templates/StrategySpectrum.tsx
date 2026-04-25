"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

/**
 * StrategySpectrum — visa tre strategiska val sida vid sida med tone.
 *
 * Varje strategi får ett kort med rubrik + konsekvens + tone-färg. En av
 * strategierna är markerad som "rätt" (`recommended`) — den glödar starkare
 * och får en pil/markör.
 *
 * MDX-format — varje paragraf eller rubrik blir en strategi:
 *
 * ```mdx
 * <StrategySpectrum chapter="§ Tre strategier">
 * - Förbjuda · danger · Eleverna gör det ändå. I smyg.
 * - Ignorera · warning · Vi abdikerar ansvaret.
 * - Designa · positive · recommended · Den enda hållbara positionen.
 * </StrategySpectrum>
 * ```
 *
 * Format per listpunkt: `Titel · tone · [recommended ·] Beskrivning`
 *
 * Tones: positive | warning | danger | neutral.
 * Sätt `recommended` mellan tone och beskrivning för att markera den
 * rekommenderade strategin.
 */

type Tone = "positive" | "warning" | "danger" | "neutral";

interface StrategySpectrumProps {
  chapter?: string;
  intro?: string;
  background?: string;
  overlay?: number;
  accent?: string;
  children?: ReactNode;
}

interface Strategy {
  title: string;
  tone: Tone;
  description: string;
  recommended: boolean;
}

// ============================================================================
// Tone → färg
// ============================================================================

function toneColor(tone: Tone, accent: string) {
  switch (tone) {
    case "positive":
      return { primary: "#7BC474", glow: "rgba(123, 196, 116, 0.4)", marker: "✓" };
    case "warning":
      return { primary: "#E8A845", glow: "rgba(232, 168, 69, 0.3)", marker: "~" };
    case "danger":
      return { primary: "#E84D4D", glow: "rgba(232, 77, 77, 0.3)", marker: "✕" };
    default:
      return { primary: accent, glow: `${accent}55`, marker: "·" };
  }
}

// ============================================================================
// Parsing
// ============================================================================

function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    const t = el.type;
    const inner = extractText(el.props.children);
    if (t === "strong") return `**${inner}**`;
    if (t === "em") return `*${inner}*`;
    if (t === "br") return "\n";
    return inner;
  }
  return "";
}

function parseStrategies(children: ReactNode): Strategy[] {
  const strategies: Strategy[] = [];

  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    if (!raw) return;
    const parts = raw.split(/\s*·\s*/);
    if (parts.length < 1) return;
    const title = parts[0].trim();
    const toneRaw = (parts[1] ?? "neutral").trim().toLowerCase();
    const tone: Tone =
      toneRaw === "positive" || toneRaw === "warning" || toneRaw === "danger" || toneRaw === "neutral"
        ? (toneRaw as Tone)
        : "neutral";
    const remaining = parts.slice(2);
    const recommended =
      remaining.length > 0 && remaining[0].trim().toLowerCase() === "recommended";
    const descriptionParts = recommended ? remaining.slice(1) : remaining;
    const description = descriptionParts.join(" · ").trim();
    strategies.push({ title, tone, description, recommended });
  };

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ children?: ReactNode }>;
    const t = el.type;
    if (t === "ul" || t === "ol") {
      Children.forEach(el.props.children, (li) => {
        if (isValidElement(li) && (li as ReactElement).type === "li") {
          walkLi(li as ReactElement<{ children?: ReactNode }>);
        }
      });
    } else if (t === "li") {
      walkLi(el);
    }
  });

  return strategies;
}

function renderInline(text: string, accentColor: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const chunk = match[0];
    if (chunk.startsWith("**")) {
      parts.push(
        <strong key={key++} style={{ color: accentColor, fontWeight: 700 }}>
          {chunk.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <em key={key++} style={{ fontStyle: "italic" }}>
          {chunk.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  const fallback = "radial-gradient(ellipse at 30% 20%, #1a1612 0%, #0a0908 70%)";
  if (!bg) return fallback;
  if (bg.startsWith("/") || bg.startsWith("http")) {
    const a = overlay;
    return `linear-gradient(rgba(10,9,8,${a}), rgba(10,9,8,${Math.min(1, a + 0.06)})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

// ============================================================================
// Huvud-template
// ============================================================================

export function StrategySpectrum({
  chapter,
  intro,
  background,
  overlay = 0.62,
  accent = "#EC7E26",
  children,
}: StrategySpectrumProps) {
  const strategies = parseStrategies(children);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background, overlay) }}
    >
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
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.7rem, 0.9vw, 0.95rem)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(247,241,230,0.55)",
            zIndex: 5,
          }}
        >
          <EditableText path="chapter" value={chapter}>
            {chapter}
          </EditableText>
        </motion.div>
      ) : null}

      {/* Hårkorsmarkör */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          top: "clamp(3rem, 5vh, 4rem)",
          left: "clamp(3rem, 6vw, 6rem)",
          width: "3rem",
          height: "1px",
          background: accent,
          transformOrigin: "left",
          zIndex: 5,
        }}
      />

      {/* Innehåll */}
      <div
        className="relative flex h-full flex-col"
        style={{
          padding: "clamp(3rem, 6vw, 7rem)",
          paddingTop: "clamp(5rem, 9vh, 7rem)",
          gap: "clamp(2rem, 4vh, 3rem)",
          zIndex: 2,
        }}
      >
        {/* Intro */}
        {intro ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(1.2rem, 1.8vw, 1.8rem)",
              color: "rgba(247,241,230,0.82)",
              maxWidth: "32em",
              lineHeight: 1.25,
            }}
          >
            <EditableText path="intro" value={intro}>
              {intro}
            </EditableText>
          </motion.div>
        ) : null}

        {/* Strategierna som horisontella kort */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${strategies.length}, 1fr)`,
            gap: "clamp(1rem, 2vw, 2rem)",
            alignItems: "stretch",
            minHeight: 0,
          }}
        >
          {strategies.map((s, i) => (
            <StrategyCard
              key={i}
              strategy={s}
              accent={accent}
              delay={0.6 + i * 0.4}
              index={i}
              total={strategies.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Enskilt strategi-kort
// ============================================================================

function StrategyCard({
  strategy,
  accent,
  delay,
  index,
  total,
}: {
  strategy: Strategy;
  accent: string;
  delay: number;
  index: number;
  total: number;
}) {
  const colors = toneColor(strategy.tone, accent);
  const recommendedDelay = delay + 0.6 + (total - index) * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(0.8rem, 2vh, 1.4rem)",
        padding: "clamp(1.5rem, 3vh, 2.5rem)",
        background: strategy.recommended
          ? `linear-gradient(140deg, ${colors.glow} 0%, rgba(20,18,15,0.45) 100%)`
          : "rgba(20,18,15,0.4)",
        border: `1px solid ${strategy.recommended ? colors.primary + "aa" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "0.5rem",
        boxShadow: strategy.recommended
          ? `0 12px 50px ${colors.glow}, inset 0 0 0 1px ${colors.primary}33`
          : "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Recommended-badge */}
      {strategy.recommended ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: recommendedDelay, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: "-0.7rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: colors.primary,
            color: "#0a0908",
            padding: "0.3rem 0.8rem",
            borderRadius: "999px",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.65rem, 0.8vw, 0.8rem)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            fontWeight: 700,
            boxShadow: `0 4px 16px ${colors.glow}`,
          }}
        >
          Den enda vägen
        </motion.div>
      ) : null}

      {/* Marker */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(1.5rem, 2.5vw, 2.4rem)",
          fontWeight: 700,
          color: colors.primary,
          lineHeight: 1,
        }}
      >
        {colors.marker}
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: strategy.recommended ? 800 : 700,
          fontSize: "clamp(1.5rem, 2.6vw, 2.6rem)",
          color: strategy.recommended ? "#F7F1E6" : "rgba(247,241,230,0.85)",
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
        }}
      >
        {strategy.title}
      </div>

      {/* Description */}
      {strategy.description ? (
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(0.95rem, 1.25vw, 1.25rem)",
            color: strategy.recommended
              ? "rgba(247,241,230,0.85)"
              : "rgba(247,241,230,0.55)",
            lineHeight: 1.35,
            marginTop: "auto",
          }}
        >
          {renderInline(strategy.description, colors.primary)}
        </div>
      ) : null}

      {/* Glow-puls för recommended */}
      {strategy.recommended ? (
        <motion.div
          aria-hidden
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: recommendedDelay,
          }}
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: "0.5rem",
            border: `1px solid ${colors.primary}`,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </motion.div>
  );
}
