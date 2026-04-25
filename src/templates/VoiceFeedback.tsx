"use client";

import { motion } from "framer-motion";
import { Children, isValidElement, useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

interface FeedbackSection {
  heading: string;
  body: string;
  exercises: string[];
}

interface VoiceFeedbackProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  /** Transkriberad talad prompt (det läraren säger in). */
  transcript?: string;
  background?: string;
  accent?: string;
  /** ms per tecken i typewriter. Default 14. */
  typeSpeed?: number;
  /**
   * Markdown-lista — varje rad är en feedback-sektion:
   *   - **Rubrik** · Kort beskrivning · Övning 1 | Övning 2 | Övning 3
   */
  children?: ReactNode;
}

function resolveBackground(bg: string | undefined): string {
  const fallback = "radial-gradient(ellipse at 50% 0%, #141018 0%, #0a0908 70%)";
  if (!bg) return fallback;
  if (bg.startsWith("/") || bg.startsWith("http")) {
    return `linear-gradient(rgba(10,9,8,0.62), rgba(10,9,8,0.78)), url('${bg}') center/cover no-repeat`;
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

function parseSections(children: ReactNode): FeedbackSection[] {
  const out: FeedbackSection[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    const parts = raw.split(/\s*·\s*/);
    if (parts.length < 2) return;
    const headingRaw = parts[0].trim();
    const m = headingRaw.match(/^\*\*(.+?)\*\*$/);
    out.push({
      heading: m ? m[1] : headingRaw,
      body: parts[1]?.trim() ?? "",
      exercises: (parts[2] ?? "")
        .split("|")
        .map((e) => e.trim())
        .filter(Boolean),
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

const DEFAULT_TRANSCRIPT =
  "eeh så… texten har ingen riktig röd tråd, det är svårt att följa. han hoppar mellan argument, det är oklart vad som är huvudtes. och så är det bland stycken där han bara… låter orden rulla typ. han har svårt att ta kritik… men jag behöver ändå säga vad som behöver förbättras. alltså röd tråd, kärnmeningar, inre länkning, slutsatsen, och hur han hanterar referaten. gör det uppmuntrande men rakt.";

const DEFAULT_SECTIONS: FeedbackSection[] = [
  {
    heading: "Röd tråd",
    body: "Din text rör sig tryggt mellan olika tankar — nu handlar det om att binda ihop dem så läsaren ser din väg.",
    exercises: [
      "Skriv en tesmening (1 mening) överst i varje stycke.",
      "Stryk en bisats i varje stycke och läs om — tydligare?",
    ],
  },
  {
    heading: "Kärnmeningar",
    body: "Några stycken bär sin egen sak men säger det först i mitten. Flytta upp.",
    exercises: [
      "Markera den meningen som säger mest i stycket. Börja stycket med den.",
    ],
  },
  {
    heading: "Inre länkning",
    body: "Dina tankar följer på varandra — men sambandsorden saknas. Läsaren får gissa.",
    exercises: [
      "Lägg in 'därför', 'trots att', 'till exempel' på minst tre ställen.",
      "Läs texten högt — hör du kopplingarna?",
    ],
  },
  {
    heading: "Slutsats och referat",
    body: "Slutsatsen finns men gömmer sig. Dessutom flyter referat och egen analys ihop.",
    exercises: [
      "Skriv om slutsatsen så den knyter tillbaka till din tes.",
      "Markera referat med 'Enligt X…' och egen analys separat.",
    ],
  },
];

function Waveform({ accent }: { accent: string }) {
  const bars = 42;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        height: "3rem",
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const base = 0.3 + Math.sin(i * 0.3) * 0.25 + Math.random() * 0.3;
        return (
          <motion.div
            key={i}
            animate={{
              scaleY: [
                base,
                0.5 + Math.sin(i * 0.5) * 0.4,
                base,
                0.7 + Math.cos(i * 0.4) * 0.3,
                base,
              ],
            }}
            transition={{
              duration: 1.8 + Math.random() * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.03,
            }}
            style={{
              width: "3px",
              height: "100%",
              borderRadius: "2px",
              background: `linear-gradient(to top, ${accent}, ${accent}aa)`,
              transformOrigin: "center",
            }}
          />
        );
      })}
    </div>
  );
}

function TypewriterText({ text, speed, delay }: { text: string; speed: number; delay: number }) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    setTyped("");
    const start = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        if (i > text.length) {
          clearInterval(iv);
          return;
        }
        setTyped(text.slice(0, i));
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(start);
  }, [text, speed, delay]);
  return <>{typed}</>;
}

export function VoiceFeedback({
  kicker,
  title,
  subtitle,
  transcript = DEFAULT_TRANSCRIPT,
  background,
  accent = "#EC7E26",
  typeSpeed = 14,
  children,
}: VoiceFeedbackProps) {
  const sections = parseSections(children);
  const actualSections = sections.length > 0 ? sections : DEFAULT_SECTIONS;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background) }}
    >
      <div
        className="relative flex h-full w-full flex-col"
        style={{
          padding: "clamp(2rem, 3.5vw, 3.5rem)",
          zIndex: 2,
          gap: "clamp(1rem, 2vh, 1.4rem)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1" style={{ flexShrink: 0 }}>
          {kicker ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.7rem, 0.85vw, 0.9rem)",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: accent,
                fontWeight: 600,
              }}
            >
              <EditableText path="kicker" value={kicker ?? ""}>{kicker}</EditableText>
            </motion.div>
          ) : null}
          {title ? (
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "#F7F1E6",
                margin: 0,
              }}
            >
              <EditableText path="title" value={title ?? ""}>{title}</EditableText>
            </motion.h2>
          ) : null}
          {subtitle ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "clamp(0.9rem, 1.05vw, 1.1rem)",
                color: "rgba(247,241,230,0.72)",
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              <EditableText path="subtitle" value={subtitle ?? ""}>{subtitle}</EditableText>
            </motion.p>
          ) : null}
        </div>

        {/* Voice-transcript-bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "1.2rem",
            padding: "clamp(1rem, 1.4vw, 1.5rem) clamp(1.2rem, 1.7vw, 1.8rem)",
            borderRadius: "1rem",
            background: "rgba(20, 18, 15, 0.75)",
            backdropFilter: "blur(18px) saturate(140%)",
            WebkitBackdropFilter: "blur(18px) saturate(140%)",
            border: `1px solid ${accent}35`,
            boxShadow: `0 18px 40px -12px rgba(0,0,0,0.5), 0 0 30px -15px ${accent}40`,
            alignItems: "center",
          }}
        >
          {/* Mic + waveform */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: "12rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <motion.div
                animate={{ boxShadow: [`0 0 0 0 ${accent}80`, `0 0 0 12px ${accent}00`] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                style={{
                  width: "2.3rem",
                  height: "2.3rem",
                  borderRadius: "50%",
                  background: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                    fill="#0a0908"
                  />
                  <path
                    d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v3M9 21h6"
                    stroke="#0a0908"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: accent,
                  fontWeight: 700,
                }}
              >
                Läraren talar
              </div>
            </div>
            <Waveform accent={accent} />
          </div>

          {/* Transkribering */}
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "clamp(0.82rem, 0.95vw, 0.98rem)",
              lineHeight: 1.5,
              color: "rgba(247,241,230,0.82)",
              paddingLeft: "1rem",
              borderLeft: `2px solid ${accent}50`,
            }}
          >
            <EditableText path="transcript" value={transcript} label="Transkriberad röst-prompt">
              <TypewriterText text={transcript} speed={typeSpeed} delay={800} />
            </EditableText>
          </div>
        </motion.div>

        {/* AI strukturerat svar — 4 feedback-sektioner */}
        <div
          className="flex-1"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${actualSections.length}, 1fr)`,
            gap: "clamp(0.7rem, 1.1vw, 1.1rem)",
            minHeight: 0,
            alignItems: "stretch",
          }}
        >
          {actualSections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 4 + i * 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
                padding: "clamp(0.9rem, 1.2vw, 1.2rem) clamp(1rem, 1.3vw, 1.3rem)",
                borderRadius: "0.65rem",
                background: "rgba(247,241,230,0.06)",
                backdropFilter: "blur(14px) saturate(140%)",
                WebkitBackdropFilter: "blur(14px) saturate(140%)",
                border: `1px solid ${accent}35`,
                boxShadow:
                  "0 10px 24px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: accent,
                  fontWeight: 700,
                }}
              >
                0{i + 1}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
                  color: "#F7F1E6",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                {section.heading}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  fontSize: "clamp(0.77rem, 0.88vw, 0.9rem)",
                  color: "rgba(247,241,230,0.78)",
                  lineHeight: 1.4,
                }}
              >
                {section.body}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  marginTop: "0.3rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {section.exercises.map((ex, ei) => (
                  <div
                    key={ei}
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      alignItems: "flex-start",
                      fontFamily: "var(--font-body)",
                      fontSize: "clamp(0.75rem, 0.85vw, 0.87rem)",
                      color: "rgba(247,241,230,0.88)",
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: accent, flexShrink: 0 }}>→</span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
