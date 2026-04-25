"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

interface StudentVoiceItem {
  attribution: string;
  quote: string;
}

interface StudentVoicesProps {
  kicker?: string;
  title?: string;
  body?: string;
  background?: string;
  /** Accentfärg för avsändaretiketten. Default konjak. */
  accent?: string;
  /** Markdown-lista: `- **Avsändare:** Citat` */
  children?: ReactNode;
}

function resolveBackground(bg: string | undefined): string {
  const fallback = "radial-gradient(ellipse at 30% 20%, #1a1612 0%, #0a0908 70%)";
  if (!bg) return fallback;
  if (bg.startsWith("/") || bg.startsWith("http")) {
    // Dimma bakgrunden så glas-korten står ut
    return `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
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

function parseVoices(children: ReactNode): StudentVoiceItem[] {
  const out: StudentVoiceItem[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children);
    const m = raw.match(/^\*\*([^*]+):\*\*\s*(.*)$/s);
    const attribution = m ? m[1].trim() : "";
    const quote = m ? m[2].trim() : raw.trim();
    if (quote) out.push({ attribution, quote });
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

// Pre-bestämda variationer för organisk känsla — span i 3-kolumns grid
const VARIATIONS = [
  { span: 1, rotate: -1.2, scale: 1.0 },
  { span: 2, rotate: 0.8, scale: 0.98 },
  { span: 1, rotate: -0.6, scale: 1.02 },
  { span: 1, rotate: 1.4, scale: 0.96 },
  { span: 1, rotate: -0.8, scale: 1.0 },
  { span: 1, rotate: 0.5, scale: 1.01 },
  { span: 2, rotate: -0.3, scale: 0.97 },
  { span: 1, rotate: 1.1, scale: 0.99 },
  { span: 1, rotate: -1.0, scale: 1.0 },
] as const;

/**
 * Elevröster i frostat-glas-kort ovanpå en bakgrundsbild. Varje citat
 * animeras in med staggered delay och får subtil rotation för organisk
 * känsla. Läs som en "tidskapslat anslagstavla".
 */
export function StudentVoices({
  kicker,
  title,
  body,
  background,
  accent = "#B4763A",
  children,
}: StudentVoicesProps) {
  const voices = parseVoices(children);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background) }}
    >
      <div
        className="relative flex h-full w-full flex-col"
        style={{
          padding: "clamp(2.5rem, 4.5vw, 5rem)",
          gap: "clamp(1.2rem, 2vh, 2rem)",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-3" style={{ maxWidth: "42em" }}>
          {kicker ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.7rem, 0.9vw, 0.9rem)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(247,241,230,0.7)",
              }}
            >
              <EditableText path="kicker" value={kicker ?? ""}>{kicker}</EditableText>
            </motion.div>
          ) : null}
          {title ? (
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(2.2rem, 4.8vw, 4.5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
                color: "#F7F1E6",
                margin: 0,
              }}
            >
              <EditableText path="title" value={title ?? ""}>{title}</EditableText>
            </motion.h2>
          ) : null}
          {body ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.95rem, 1.1vw, 1.15rem)",
                color: "rgba(247,241,230,0.75)",
                margin: 0,
                maxWidth: "30em",
                lineHeight: 1.5,
              }}
            >
              {body}
            </motion.p>
          ) : null}
        </div>

        {/* Glas-kort grid */}
        <div
          className="flex-1"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "min-content",
            gap: "clamp(1rem, 1.5vw, 1.5rem)",
            alignContent: "center",
          }}
        >
          {voices.map((voice, i) => {
            const v = VARIATIONS[i % VARIATIONS.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, scale: 0.92, rotate: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: v.scale,
                  rotate: v.rotate,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.45 + i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  gridColumn: `span ${v.span}`,
                  padding: "clamp(0.9rem, 1.2vw, 1.3rem) clamp(1rem, 1.4vw, 1.5rem)",
                  borderRadius: "0.85rem",
                  background: "rgba(247, 241, 230, 0.09)",
                  backdropFilter: "blur(24px) saturate(140%)",
                  WebkitBackdropFilter: "blur(24px) saturate(140%)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  boxShadow:
                    "0 12px 40px -10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem",
                }}
              >
                {voice.attribution ? (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "clamp(0.65rem, 0.78vw, 0.8rem)",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: accent,
                      fontWeight: 600,
                    }}
                  >
                    {voice.attribution}
                  </div>
                ) : null}
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: "clamp(0.95rem, 1.15vw, 1.25rem)",
                    color: "#F7F1E6",
                    lineHeight: 1.35,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "-0.5rem",
                      top: "-0.3rem",
                      color: accent,
                      opacity: 0.5,
                      fontSize: "1.2em",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    “
                  </span>
                  {voice.quote}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
