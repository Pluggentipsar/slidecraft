"use client";

import { motion } from "framer-motion";
import { isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

interface HookStatementProps {
  /** Bakgrund — bildsökväg eller CSS-värde. */
  background?: string;
  /** Accentfärg för emfaserade ord (**fet**). Default orange. */
  accent?: string;
  /** Mörk overlay på bakgrunden (0-1). Default 0.7 för dramatik. */
  overlay?: number;
  /** Paus efter sista ord innan publik kan gå vidare. Default 2400ms. */
  pauseAfter?: number;
  /** Chapter-markör uppe till höger. */
  chapter?: string;
  /**
   * Texten som ska renderas ord-för-ord.
   * `**ord**` → accent-färg + större scale + längre delay efter.
   * `*ord*` → italic.
   */
  children?: ReactNode;
}

interface HookWord {
  text: string;
  emphasis: "none" | "em" | "strong";
  /** Extra delay efter detta ord — längre för emphasis och punctuation. */
  postDelay: number;
}

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
    if (t === "p") return inner;
    return inner;
  }
  return "";
}

function parseHookWords(text: string): HookWord[] {
  const out: HookWord[] = [];
  // Split på space men behåll ** och * markeringar
  const chunks = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\s+)/g).filter((s) => s.length > 0);
  for (const chunk of chunks) {
    if (/^\s+$/.test(chunk)) continue; // hoppa mellanrum

    let emphasis: HookWord["emphasis"] = "none";
    let clean = chunk;
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      emphasis = "strong";
      clean = chunk.slice(2, -2);
    } else if (chunk.startsWith("*") && chunk.endsWith("*")) {
      emphasis = "em";
      clean = chunk.slice(1, -1);
    }

    // Om clean innehåller flera ord (efter ** stripping) — splitta
    const words = clean.split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const isLast = i === words.length - 1;
      // Punktuation i slutet → längre paus
      const endsWithPunct = /[.!?—]$/.test(word);
      let postDelay = 0.08; // default space-delay
      if (endsWithPunct) postDelay += 0.35;
      if (emphasis === "strong" && isLast) postDelay += 0.4; // extra andning efter betonat slutord
      out.push({ text: word, emphasis, postDelay });
    }
  }
  return out;
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  if (!bg) return "radial-gradient(ellipse at 50% 30%, #1a1410 0%, #0a0908 70%)";
  if (bg.startsWith("/") || bg.startsWith("http")) {
    const a = overlay;
    return `linear-gradient(rgba(10,9,8,${a}), rgba(10,9,8,${Math.min(1, a + 0.1)})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

/**
 * HookStatement — en provokativ öppnings-mening som reveals ord-för-ord
 * med programmerad pacing. Betonade ord (`**ord**`) får längre paus efter
 * och orange glow. Efter sista ordet fryser slidan en paus-tid (pauseAfter)
 * innan nästa navigation känns naturlig.
 *
 * Use case: dramatiska öppningar som "Det finns ingen uppgift på gymnasienivå
 * som en chattbot inte löser med gott resultat."
 */
export function HookStatement({
  background,
  accent = "#EC7E26",
  overlay = 0.7,
  // pauseAfter används mest som metadata — animation-delay räcker
  chapter,
  children,
}: HookStatementProps) {
  const raw = extractText(children).trim();
  const words = parseHookWords(raw);

  // Räkna kumulativ delay per ord (avancerar med varje words postDelay + wordDuration)
  const timings = words.reduce<Array<{ word: typeof words[number]; delay: number }>>(
    (acc, w) => {
      const prev = acc[acc.length - 1];
      const prevDelay = prev?.delay ?? 0.5;
      const prevWord = prev?.word;
      const prevDuration = prevWord
        ? 0.35 + (prevWord.emphasis !== "none" ? 0.15 : 0)
        : 0;
      const prevPostDelay = prevWord ? prevWord.postDelay : 0;
      const delay = prev ? prevDelay + prevPostDelay + prevDuration * 0.4 : 0.5;
      return [...acc, { word: w, delay }];
    },
    []
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background, overlay) }}
    >
      {/* Subtil accent-glow uppe */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 40% at 50% 20%, ${accent}15 0%, transparent 70%)`,
        }}
      />

      {/* Chapter-markör */}
      {chapter ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3.5rem)",
            right: "clamp(2rem, 4vw, 3.5rem)",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.7rem, 0.9vw, 0.95rem)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(247,241,230,0.45)",
            zIndex: 3,
          }}
        >
          <EditableText path="chapter" value={chapter}>
            {chapter}
          </EditableText>
        </motion.div>
      ) : null}

      {/* Centrerat textblock */}
      <div
        className="relative flex h-full w-full items-center justify-center"
        style={{
          padding: "clamp(3rem, 7vw, 8rem)",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "clamp(2rem, 3.8vw, 3.6rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "#F7F1E6",
            textAlign: "center",
            maxWidth: "22em",
            textShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {timings.map((t, i) => {
            const { word, delay } = t;
            const isStrong = word.emphasis === "strong";
            const isEm = word.emphasis === "em";
            return (
              <motion.span
                key={i}
                initial={{
                  opacity: 0,
                  y: 18,
                  filter: "blur(14px)",
                  scale: isStrong ? 0.85 : 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  scale: 1,
                }}
                transition={{
                  duration: isStrong ? 0.9 : 0.6,
                  delay,
                  ease: isStrong ? [0.22, 1.3, 0.36, 1] : [0.22, 1, 0.36, 1],
                }}
                style={{
                  display: "inline-block",
                  marginRight: "0.3em",
                  color: isStrong ? accent : undefined,
                  fontStyle: isEm ? "italic" : undefined,
                  fontWeight: isStrong ? 800 : undefined,
                  textShadow: isStrong
                    ? `0 8px 40px ${accent}66, 0 0 80px ${accent}33`
                    : undefined,
                }}
              >
                {word.text}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
