"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText, GhostHandle } from "@/lib/inline-edit";

interface GrowingStatementProps {
  chapter?: string;
  background?: string;
  accent?: string;
  /** Textens position — center (default) eller left. */
  align?: "center" | "left";
  /** Liten italic-text som fade:r in ovanför huvudtexten. */
  whisper?: string;
  /**
   * Texten. Använd **bold** för accent-färgade ord (med pulsande glow).
   * Raderna separeras av blankrad. Varje bokstav växer in från osynligt.
   */
  children?: ReactNode;
}

function resolveBackground(bg: string | undefined): string {
  const fallback = "radial-gradient(ellipse at 30% 20%, #1a1612 0%, #0a0908 70%)";
  if (!bg) return fallback;
  if (bg.startsWith("/") || bg.startsWith("http")) {
    return `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

function extractTextWithMarkup(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextWithMarkup).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    const t = el.type;
    const inner = extractTextWithMarkup(el.props.children);
    if (t === "strong") return `**${inner}**`;
    if (t === "em") return `*${inner}*`;
    if (t === "p") return inner + "\n";
    if (t === "br") return "\n";
    return inner;
  }
  return "";
}

interface Chunk {
  text: string;
  emphasis: "none" | "em" | "strong";
}

function parseChunks(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("**") && part.endsWith("**")) {
      chunks.push({ text: part.slice(2, -2), emphasis: "strong" });
    } else if (part.startsWith("*") && part.endsWith("*")) {
      chunks.push({ text: part.slice(1, -1), emphasis: "em" });
    } else {
      chunks.push({ text: part, emphasis: "none" });
    }
  }
  return chunks;
}

export function GrowingStatement({
  chapter,
  background,
  accent = "#EC7E26",
  align = "center",
  whisper,
  children,
}: GrowingStatementProps) {
  const raw = extractTextWithMarkup(children).trim();
  const chunks = parseChunks(raw.replace(/\n+/g, " "));

  // Beräkna letter-index globalt för kontinuerlig stagger
  let charIndex = 0;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background) }}
    >
      {/* Ambient glow bakom texten */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 0.3 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 50%, ${accent}1A 0%, transparent 70%)`,
        }}
      />

      {/* Chapter */}
      {chapter ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3.5rem)",
            right: "clamp(2rem, 4vw, 3.5rem)",
            fontFamily: "var(--font-mono)",
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
      ) : (
        <div
          style={{
            position: "absolute",
            top: "clamp(2rem, 4vh, 3.5rem)",
            right: "clamp(2rem, 4vw, 3.5rem)",
            zIndex: 3,
          }}
        >
          <GhostHandle path="chapter" label="+ kapitel" />
        </div>
      )}

      {/* Dekorativ linje */}
      <motion.div
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.1 }}
        style={{
          position: "absolute",
          top: "clamp(3rem, 5vh, 4rem)",
          left: align === "center" ? "50%" : "clamp(3rem, 6vw, 7rem)",
          transform: align === "center" ? "translateX(-50%)" : undefined,
          width: "3rem",
          height: "1px",
          background: accent,
          transformOrigin: "left",
          zIndex: 3,
        }}
      />

      {/* Textinnehåll */}
      <div
        className="relative flex h-full w-full flex-col items-center justify-center"
        style={{
          padding: "clamp(3rem, 6vw, 7rem)",
          zIndex: 2,
          gap: "clamp(1rem, 2vh, 2rem)",
          alignItems: align === "center" ? "center" : "flex-start",
        }}
      >
        {whisper ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.25rem, 2.2vw, 2.2rem)",
              color: "color-mix(in srgb, var(--text) 75%, transparent)",
              textAlign: align,
              lineHeight: 1.25,
              letterSpacing: "-0.015em",
              maxWidth: "22em",
            }}
          >
            <EditableText path="whisper" value={whisper}>
              {whisper}
            </EditableText>
          </motion.div>
        ) : (
          <GhostHandle path="whisper" label="+ whisper" placeholder="Liten italic-text ovanför" />
        )}
        <EditableText
          path="content"
          value={raw}
          block
          label="Huvudtext (kort! max ~6 ord, font växer till 8.5vw)"
        >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(3.5rem, 8.5vw, 10rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: "var(--text)",
            textAlign: align,
            maxWidth: "16em",
            textShadow: "none",
          }}
        >
          {chunks.map((chunk, ci) => {
            const chars = Array.from(chunk.text);
            const isEmph = chunk.emphasis === "strong" || chunk.emphasis === "em";
            return (
              <span
                key={ci}
                style={{
                  display: "inline-block",
                  position: "relative",
                  color: isEmph ? accent : undefined,
                  fontStyle: chunk.emphasis === "em" ? "italic" : undefined,
                }}
              >
                {chars.map((ch, i) => {
                  const globalIndex = charIndex++;
                  return (
                    <motion.span
                      key={i}
                      initial={{
                        opacity: 0,
                        scale: 0.3,
                        filter: "blur(16px)",
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      transition={{
                        duration: 1.1,
                        delay: 0.5 + globalIndex * 0.045,
                        ease: [0.22, 1.3, 0.36, 1],
                      }}
                      style={{
                        display: "inline-block",
                        whiteSpace: ch === " " ? "pre" : undefined,
                        transformOrigin: "center center",
                      }}
                    >
                      {ch}
                    </motion.span>
                  );
                })}
                {/* Pulsande glow bakom emphasized word */}
                {isEmph ? (
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.6, 0.3, 0.6, 0.3] }}
                    transition={{
                      duration: 3,
                      delay: 0.5 + (charIndex - chars.length) * 0.045 + chars.length * 0.045 + 0.2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    style={{
                      position: "absolute",
                      inset: "-0.2em -0.15em",
                      background: `radial-gradient(ellipse, ${accent}40 0%, transparent 70%)`,
                      filter: "blur(18px)",
                      zIndex: -1,
                      pointerEvents: "none",
                    }}
                  />
                ) : null}
              </span>
            );
          })}
        </div>
        </EditableText>
      </div>

      {/* Understroke under hela statementet */}
      <motion.div
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          duration: 1.4,
          delay: 0.5 + charIndex * 0.045 + 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: "absolute",
          bottom: "clamp(4rem, 8vh, 7rem)",
          left: align === "center" ? "50%" : "clamp(3rem, 6vw, 7rem)",
          transform: align === "center" ? "translateX(-50%)" : undefined,
          width: "6rem",
          height: "3px",
          background: accent,
          transformOrigin: "left",
          boxShadow: `0 0 14px ${accent}80`,
          zIndex: 3,
        }}
      />
    </div>
  );
}
