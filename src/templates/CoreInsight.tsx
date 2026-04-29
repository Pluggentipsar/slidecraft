"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import type { ReactElement } from "react";

/**
 * CoreInsight — filosofisk slide med build-up + punchline.
 *
 * Setup-texten tonas in i mindre format (dimmad, italic), tar en
 * dramaturgisk paus, sen LANDAR punchlinen i stor skala med accent-glow
 * och en svag breathing-pulse. Tänkt för aforismer och kärnpoänger som
 * "Agens > intelligens" där två meningar bygger upp och en tredje
 * cementerar.
 *
 * MDX-format:
 * ```mdx
 * <CoreInsight
 *   chapter="§ Akt 3 · Filosofisk kärna"
 *   setup="AI gör intelligens till en råvara vi får i överflöd. Frågan är vad vi vill göra med den."
 *   punchline="Agens > intelligens."
 *   accent="#EC7E26"
 *   background="..."
 * />
 * ```
 *
 * **bold** i punchline = accent-färg.
 * Symbolen `>` i punchline renderas som accent-färgad om den står ensam mellan
 * ord (fungerar för "X > Y"-mönster).
 */

interface CoreInsightProps {
  chapter?: string;
  /** Build-up-text (kan vara 1-3 meningar). */
  setup?: string;
  /** Stora punchlinen. **bold** ger accent-färg. */
  punchline: string;
  background?: string;
  accent?: string;
  /** Mörk overlay (0-1). Default 0.78. */
  overlay?: number | string;
  /** Litet eyebrow ovanför setupen. */
  kicker?: string;
  /** Om children skickas, används de istället för setup-prop. */
  children?: ReactNode;
}

function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    const t = el.type;
    const inner = extractText(el.props.children);
    if (t === "strong") return `**${inner}**`;
    if (t === "em") return `*${inner}*`;
    return inner;
  }
  return "";
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  if (!bg) return "radial-gradient(ellipse at 50% 30%, #1a1410 0%, #0a0908 70%)";
  if (bg.startsWith("/") || bg.startsWith("http")) {
    return `linear-gradient(rgba(10,9,8,${overlay}), rgba(10,9,8,${Math.min(1, overlay + 0.05)})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

/**
 * Renderar punchlinen med smart formattering:
 * - **bold** → accent-färg
 * - " > " (mellanrum runt) → accent-färgad större symbol
 */
function renderPunchline(text: string, accent: string): ReactNode {
  // Splitta på **bold** först
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} style={{ color: accent, fontWeight: 800 }}>
          {part.slice(2, -2)}
        </span>
      );
    }
    // För icke-bold-delar, hantera ` > ` specially
    const greaterSplit = part.split(/(\s+>\s+)/g);
    return (
      <span key={i}>
        {greaterSplit.map((seg, j) => {
          if (/\s+>\s+/.test(seg)) {
            return (
              <span
                key={j}
                style={{
                  color: accent,
                  fontWeight: 800,
                  margin: "0 0.15em",
                  display: "inline-block",
                  textShadow: `0 0 24px ${accent}AA`,
                }}
              >
                {">"}
              </span>
            );
          }
          return <span key={j}>{seg}</span>;
        })}
      </span>
    );
  });
}

function renderSetup(text: string, accent: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <span key={i} style={{ color: accent, fontWeight: 700 }}>
          {p.slice(2, -2)}
        </span>
      );
    }
    if (p.startsWith("*") && p.endsWith("*")) {
      return (
        <em key={i} style={{ fontStyle: "italic" }}>
          {p.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export function CoreInsight({
  chapter,
  setup,
  punchline,
  background,
  accent = "#EC7E26",
  overlay = 0.78,
  kicker,
  children,
}: CoreInsightProps) {
  const overlayNum = typeof overlay === "string" ? parseFloat(overlay) : overlay;
  const setupText = setup ?? extractText(children).trim();

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background, overlayNum) }}
    >
      {chapter ? (
        <div
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3.5rem)",
            right: "clamp(2rem, 4vw, 3.5rem)",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.7rem, 0.9vw, 0.95rem)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            zIndex: 4,
          }}
        >
          {chapter}
        </div>
      ) : null}

      {/* Subtil cirkulär ljus-puls bakom punchline */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.45, scale: [0.95, 1.05, 0.95] }}
        transition={{
          opacity: { duration: 1.2, delay: 2.0 },
          scale: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3.0,
          },
        }}
        style={{
          position: "absolute",
          top: "62%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "75vmin",
          height: "55vmin",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accent}28 0%, transparent 65%)`,
          filter: "blur(40px)",
          zIndex: 1,
        }}
      />

      {/* Layout: setup centrerat upptill, punchline större centrerat undertill */}
      <div
        className="relative h-full w-full flex flex-col"
        style={{
          padding: "clamp(3rem, 6vw, 6rem)",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(2rem, 5vh, 4rem)",
          zIndex: 2,
        }}
      >
        {/* Kicker */}
        {kicker ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.7rem, 0.9vw, 0.95rem)",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: accent,
              textAlign: "center",
            }}
          >
            {kicker}
          </motion.div>
        ) : null}

        {/* Setup — build-up */}
        {setupText ? (
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 0.85, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.0, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.2rem, 2vw, 1.95rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              color: "var(--text)",
              textAlign: "center",
              maxWidth: "30em",
              margin: 0,
            }}
          >
            {renderSetup(setupText, accent)}
          </motion.div>
        ) : null}

        {/* Punchline — landar med impact */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            duration: 1.2,
            delay: 1.8,
            ease: [0.22, 1.05, 0.36, 1],
          }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(2.6rem, 5.5vw, 5.6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "var(--text)",
            textAlign: "center",
            maxWidth: "18em",
            textShadow: `0 0 60px rgba(0,0,0,0.6), 0 0 90px ${accent}33`,
            margin: 0,
          }}
        >
          {renderPunchline(punchline, accent)}
        </motion.div>

        {/* Tunn underrad — accent-streck */}
        <motion.div
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 2.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "min(40%, 480px)",
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            boxShadow: `0 0 20px ${accent}88`,
            transformOrigin: "center",
          }}
        />
      </div>
    </div>
  );
}
