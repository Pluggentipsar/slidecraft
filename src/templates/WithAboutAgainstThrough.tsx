"use client";

import { motion } from "framer-motion";
import { Children, isValidElement, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { useSlideSteps } from "@/lib/slide-steps";

/**
 * WithAboutAgainstThrough — 4-fält-grid för pedagogiska förhållningssätt
 * till AI: Med, Om, Mot, Genom. En egen ramverk för AI-perspektiv.
 *
 * Varje fält har en preposition (MED, OM, MOT, GENOM AI), en kort förklaring,
 * och ett konkret klassrumsexempel. Stega framåt för att tända ett fält i taget.
 *
 * MDX-format:
 * ```mdx
 * <WithAboutAgainstThrough
 *   chapter="§ Akt 4 · Fyra rörelser"
 *   title="Med, om, mot, genom AI."
 *   subtitle="Fyra parallella rörelser i undervisningen — inte alternativ."
 *   accent="#EC7E26"
 * >
 * - MED · Använd AI som tankepartner och skrivhjälp · "Bolla idén med en chatbot innan vi delar i klassrummet."
 * - OM · Studera AI:n själv — vad den är, hur den funkar, vem äger den · "Jämför ChatGPT, Claude och Gemini på samma fråga om historia."
 * - MOT · Kritisk granskning av drivkrafter, bias, dark patterns · "Vad tjänar Snapchat på att deras AI är så bekräftande?"
 * - GENOM · AI som personlig tutor och anpassningsverktyg · "Eleven får uppgiften förklarad på sin nivå, sitt språk."
 * </WithAboutAgainstThrough>
 * ```
 *
 * Per rad: `Preposition · Förklaring · Exempel`.
 */

interface WithAboutAgainstThroughProps {
  chapter?: string;
  title?: string;
  subtitle?: string;
  background?: string;
  accent?: string;
  overlay?: number | string;
  children?: ReactNode;
}

interface Quadrant {
  preposition: string;
  description: string;
  example: string;
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
    return inner;
  }
  return "";
}

function parseQuadrants(children: ReactNode): Quadrant[] {
  const out: Quadrant[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    if (!raw) return;
    const parts = raw.split(/\s*·\s*/);
    const preposition = (parts[0] ?? "").trim();
    const description = (parts[1] ?? "").trim();
    const example = parts.slice(2).join(" · ").trim();
    if (!preposition) return;
    out.push({ preposition, description, example });
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
  return out;
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  if (!bg) return "radial-gradient(ellipse at 50% 30%, #1a1410 0%, #0a0908 70%)";
  if (bg.startsWith("/") || bg.startsWith("http")) {
    return `linear-gradient(rgba(10,9,8,${overlay}), rgba(10,9,8,${Math.min(1, overlay + 0.05)})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

function renderInline(text: string, accent: string): ReactNode {
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

export function WithAboutAgainstThrough({
  chapter,
  title,
  subtitle,
  background,
  accent = "#EC7E26",
  overlay = 0.78,
  children,
}: WithAboutAgainstThroughProps) {
  const quadrants = useMemo(() => parseQuadrants(children), [children]);
  const overlayNum = typeof overlay === "string" ? parseFloat(overlay) : overlay;
  const step = useSlideSteps(quadrants.length);

  // Auto-grid: 2x2 om 4 items, 1xN annars
  const cols = quadrants.length === 4 ? 2 : Math.min(quadrants.length, 4);
  const rows = quadrants.length === 4 ? 2 : 1;

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

      <div
        className="relative h-full w-full flex flex-col"
        style={{
          padding: "clamp(2.5rem, 5vw, 5rem)",
          gap: "clamp(1.4rem, 2.5vh, 2rem)",
          zIndex: 2,
        }}
      >
        {/* Topp */}
        <div style={{ flexShrink: 0, maxWidth: "min(1300px, 92%)" }}>
          {title ? (
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(2rem, 3.5vw, 3.2rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "var(--text)",
                margin: 0,
              }}
            >
              {renderInline(title, accent)}
            </motion.h2>
          ) : null}
          {subtitle ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "clamp(1rem, 1.3vw, 1.3rem)",
                color: "var(--text)",
                marginTop: "0.5rem",
                maxWidth: "70ch",
                lineHeight: 1.4,
              }}
            >
              {renderInline(subtitle, accent)}
            </motion.div>
          ) : null}
        </div>

        {/* Quadrants */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: "clamp(0.8rem, 1.4vw, 1.4rem)",
            minHeight: 0,
            position: "relative",
          }}
        >
          {/* Diagonal kors-gradient i mitten för 4-grid */}
          {quadrants.length === 4 ? (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at center, ${accent}22 0%, transparent 50%)`,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          ) : null}

          {quadrants.map((q, i) => {
            const lit = i <= step;
            const isLatest = i === step;
            const baseDelay = 0.7 + i * 0.18;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: baseDelay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: lit
                    ? "linear-gradient(180deg, rgba(28, 24, 18, 0.78) 0%, rgba(15, 13, 10, 0.85) 100%)"
                    : "rgba(20, 18, 15, 0.45)",
                  border: `1px solid ${lit ? `${accent}44` : "color-mix(in srgb, var(--text) 6%, transparent)"}`,
                  borderRadius: "0.6rem",
                  padding: "clamp(1rem, 1.6vw, 1.6rem)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: isLatest
                    ? `0 24px 50px -16px ${accent}55, inset 0 1px 0 ${accent}55`
                    : lit
                    ? `0 16px 36px -16px rgba(0,0,0,0.55)`
                    : "0 6px 16px -10px rgba(0,0,0,0.35)",
                  filter: lit ? "none" : "saturate(0.55)",
                  transition: "all 0.6s",
                  zIndex: 1,
                }}
              >
                {/* Glow ovanifrån */}
                {lit ? (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "55%",
                      background: `radial-gradient(ellipse at top, ${accent}1F 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />
                ) : null}

                {/* Preposition stort */}
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(2rem, 3.4vw, 3rem)",
                    letterSpacing: "-0.03em",
                    color: lit ? accent : `${accent}55`,
                    lineHeight: 0.95,
                    marginBottom: "0.2rem",
                    position: "relative",
                    textShadow: isLatest ? `0 0 26px ${accent}66` : "none",
                    transition: "color 0.5s, text-shadow 0.5s",
                  }}
                >
                  {q.preposition}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(0.65rem, 0.8vw, 0.8rem)",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: lit ? "var(--text-muted)" : "color-mix(in srgb, var(--text) 30%, transparent)",
                    marginBottom: "clamp(0.7rem, 1.2vh, 1rem)",
                    position: "relative",
                  }}
                >
                  AI
                </div>

                {/* Divider */}
                <div
                  aria-hidden
                  style={{
                    height: 1,
                    background: lit ? `${accent}33` : "color-mix(in srgb, var(--text) 6%, transparent)",
                    marginBottom: "clamp(0.7rem, 1.1vh, 0.95rem)",
                    transition: "background 0.5s",
                  }}
                />

                {/* Beskrivning */}
                {q.description ? (
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(0.95rem, 1.25vw, 1.25rem)",
                      lineHeight: 1.3,
                      color: lit ? "var(--text)" : "color-mix(in srgb, var(--text-muted) 80%, transparent)",
                      marginBottom: "clamp(0.6rem, 1vh, 0.9rem)",
                      position: "relative",
                      transition: "color 0.5s",
                    }}
                  >
                    {q.description}
                  </div>
                ) : null}

                {/* Exempel */}
                {q.example ? (
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: "clamp(0.82rem, 1vw, 1rem)",
                      lineHeight: 1.4,
                      color: lit ? "color-mix(in srgb, var(--text) 70%, transparent)" : "color-mix(in srgb, var(--text) 30%, transparent)",
                      marginTop: "auto",
                      paddingLeft: "0.6rem",
                      borderLeft: `2px solid ${lit ? `${accent}66` : `${accent}22`}`,
                      position: "relative",
                      transition: "color 0.5s, border-color 0.5s",
                    }}
                  >
                    {renderInline(q.example, accent)}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
