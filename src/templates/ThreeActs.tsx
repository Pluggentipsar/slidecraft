"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { useSlideSteps } from "@/lib/slide-steps";
import { EditableText } from "@/lib/inline-edit";

interface Act {
  word: string;
  color: string;
  tagline: string;
  bullets: string[];
  conclusion: string;
}

interface ThreeActsProps {
  chapter?: string;
  title?: string;
  /** Sammanfattande rad längst ner. Visas som sista reveal. */
  bottomLine?: string;
  background?: string;
  /**
   * Markdown-lista — varje rad är en kolumn:
   *   - **Ord** · #färg · Tagline · bullet1 | bullet2 | bullet3 · Avslutningsrad
   */
  children?: ReactNode;
}

function resolveBackground(bg: string | undefined): string {
  const fallback = "radial-gradient(ellipse at 50% 0%, #0f0d12 0%, #08080b 70%)";
  if (!bg) return fallback;
  if (bg.startsWith("/") || bg.startsWith("http")) {
    return `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('${bg}') center/cover no-repeat`;
  }
  return bg;
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

function parseActs(children: ReactNode): Act[] {
  const out: Act[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    const parts = raw.split(/\s*·\s*/);
    if (parts.length < 4) return;
    const wordRaw = parts[0].trim();
    const wordMatch = wordRaw.match(/^\*\*(.+?)\*\*$/);
    const word = wordMatch ? wordMatch[1] : wordRaw;
    out.push({
      word,
      color: parts[1]?.trim() ?? "#EC7E26",
      tagline: parts[2]?.trim() ?? "",
      bullets: (parts[3] ?? "")
        .split("|")
        .map((b) => b.trim())
        .filter(Boolean),
      conclusion: parts[4]?.trim() ?? "",
    });
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

export function ThreeActs({
  chapter,
  title,
  bottomLine,
  background,
  children,
}: ThreeActsProps) {
  const acts = parseActs(children);
  // Steg 0: ord
  // Steg 1..N: innehåll under ord 1..N revealed
  // Steg N+1: bottom-line (om satt)
  const totalSteps = acts.length + (bottomLine ? 1 : 0);
  const activeStep = useSlideSteps(Math.max(totalSteps, 1));
  const bottomRevealed = bottomLine ? activeStep >= acts.length : false;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background) }}
    >
      {/* Chapter */}
      {chapter ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3rem)",
            right: "clamp(2rem, 4vw, 3.5rem)",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.7rem, 0.85vw, 0.9rem)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            zIndex: 3,
          }}
        >
          <EditableText path="chapter" value={chapter ?? ""}>{chapter}</EditableText>
        </motion.div>
      ) : null}

      {title ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3rem)",
            left: "clamp(2rem, 4vw, 3.5rem)",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.7rem, 0.85vw, 0.9rem)",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            zIndex: 3,
          }}
        >
          <EditableText path="title" value={title ?? ""}>{title}</EditableText>
        </motion.div>
      ) : null}

      <div
        className="relative flex h-full w-full flex-col"
        style={{
          padding: "clamp(3rem, 5vw, 5rem)",
          paddingTop: "clamp(4rem, 7vh, 6rem)",
          zIndex: 2,
          justifyContent: "center",
          gap: "clamp(1rem, 2vh, 2rem)",
        }}
      >
        {/* Rad med orden */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${acts.length}, 1fr)`,
            gap: "clamp(1.5rem, 3vw, 3rem)",
            alignItems: "start",
          }}
        >
          {acts.map((act, i) => {
            const revealed = i < activeStep;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(1rem, 2vh, 1.5rem)",
                  position: "relative",
                }}
              >
                {/* Ambient glow bakom ordet när revealed */}
                <motion.div
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: revealed ? 0.35 : 0 }}
                  transition={{ duration: 1 }}
                  style={{
                    position: "absolute",
                    top: "-10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "80%",
                    height: "8rem",
                    background: `radial-gradient(ellipse, ${act.color}40 0%, transparent 70%)`,
                    filter: "blur(30px)",
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                />

                {/* Själva ORDET */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.2 + i * 0.18,
                    ease: [0.22, 1.3, 0.36, 1],
                  }}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(4rem, 9vw, 10rem)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.045em",
                    color: "var(--text)",
                    textAlign: "center",
                    textShadow: "0 8px 40px rgba(0,0,0,0.5)",
                    position: "relative",
                    zIndex: 1,
                    cursor: "default",
                  }}
                >
                  {act.word}
                </motion.div>

                {/* Liten animerad accent-linje under ordet */}
                <motion.div
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: revealed ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    alignSelf: "center",
                    width: "3.5rem",
                    height: "3px",
                    background: act.color,
                    borderRadius: "1.5px",
                    boxShadow: `0 0 12px ${act.color}80`,
                    transformOrigin: "center",
                    marginTop: "-0.3rem",
                  }}
                />

                {/* Innehållet under ordet */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.9rem",
                  }}
                >
                  {/* Tagline */}
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "clamp(1rem, 1.3vw, 1.35rem)",
                      lineHeight: 1.2,
                      color: act.color,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {act.tagline}
                  </div>

                  {/* Bullets */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    {act.bullets.map((bullet, bi) => (
                      <motion.div
                        key={bi}
                        initial={{ opacity: 0, x: -8 }}
                        animate={
                          revealed
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -8 }
                        }
                        transition={{
                          duration: 0.45,
                          delay: revealed ? 0.2 + bi * 0.06 : 0,
                          ease: "easeOut",
                        }}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "clamp(0.85rem, 1vw, 1rem)",
                          lineHeight: 1.45,
                          color: "var(--text)",
                        }}
                      >
                        {bullet}
                      </motion.div>
                    ))}
                  </div>

                  {/* Conclusion — bold vit */}
                  {act.conclusion ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: revealed ? 0.3 + act.bullets.length * 0.06 : 0,
                      }}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "clamp(0.9rem, 1.05vw, 1.1rem)",
                        lineHeight: 1.4,
                        color: "var(--text)",
                        marginTop: "0.4rem",
                        paddingTop: "0.8rem",
                        borderTop: `1px solid ${act.color}40`,
                      }}
                    >
                      {act.conclusion}
                    </motion.div>
                  ) : null}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Bottom line */}
        {bottomLine ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={
              bottomRevealed
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: "auto",
              paddingTop: "clamp(1rem, 2vh, 1.5rem)",
              borderTop: "1px solid rgba(247,241,230,0.15)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "clamp(1rem, 1.4vw, 1.55rem)",
              lineHeight: 1.4,
              color: "var(--text)",
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}
          >
            {bottomLine}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
