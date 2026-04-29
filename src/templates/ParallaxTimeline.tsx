"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode, CSSProperties } from "react";
import { useSlideSteps } from "@/lib/slide-steps";

/**
 * ParallaxTimeline — staged-reveal timeline med kort som byter plats med parallax.
 *
 * Aktivt kort står centrerat och fullt synligt. Tidigare och kommande kort
 * ligger på sidorna med minskad scale, opacity och blur (djupkänsla). När
 * publiken stegar fram så glider alla kort åt vänster — parallax-effekten
 * uppstår av att kort på olika "djup" rör sig olika långt visuellt.
 *
 * Användning:
 * ```mdx
 * <ParallaxTimeline
 *   chapter="§ Berättelsen om AI"
 *   background="https://cdn.midjourney.com/151fcf68-f588-4142-b106-a2388d9d6ce0/0_0.png"
 *   accent="#EC7E26"
 * >
 * - 2019 · Modeller som knappt kan räkna till 10
 * - 2022 · GPT-3.5 — smart mellanstadieelev
 * - 2023 · GPT-4 — klarar juristexamen och högskoleprovet
 * - 2024 · Doktorandnivå
 * - 2025 · IMO-guld · Bättre poesi · Deep research · Diagnoser
 * - 2026 · ?
 * </ParallaxTimeline>
 * ```
 *
 * Format på varje rad: `år · text` — separatorn är " · " (mellanslag-bullet-mellanslag).
 * Allt efter första " · " blir beskrivningstext.
 */

interface ParallaxTimelineProps {
  /** Chapter-tagg uppe till höger. */
  chapter?: string;
  /** Bakgrundsbild eller färg. URL ger bild med dark overlay. */
  background?: string;
  /** Accentfärg för aktivt år och prick-indikator. */
  accent?: string;
  /** Mörk overlay (0-1) på bakgrunden. Default 0.55. */
  overlay?: number;
  /** Markdown-lista. Format per rad: "år · text". */
  children?: ReactNode;
}

interface YearItem {
  year: string;
  text: string;
}

function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}

function parseItems(children: ReactNode): YearItem[] {
  const items: YearItem[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ children?: ReactNode }>;
    const tag = el.type;
    if (tag === "ul" || tag === "ol") {
      Children.forEach(el.props.children, (li) => {
        if (!isValidElement(li)) return;
        if ((li as ReactElement).type !== "li") return;
        const raw = extractText(
          (li as ReactElement<{ children?: ReactNode }>).props.children,
        ).trim();
        if (!raw) return;
        const idx = raw.indexOf(" · ");
        if (idx > -1) {
          items.push({
            year: raw.slice(0, idx).trim(),
            text: raw.slice(idx + 3).trim(),
          });
        } else {
          items.push({ year: raw, text: "" });
        }
      });
    }
  });
  return items;
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  if (!bg) {
    return "radial-gradient(ellipse at 50% 50%, #1a1612 0%, #0a0908 80%)";
  }
  if (bg.startsWith("/") || bg.startsWith("http")) {
    const a = overlay;
    return `linear-gradient(rgba(10,9,8,${a}), rgba(10,9,8,${Math.min(1, a + 0.1)})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

// Visuell ramp baserat på avstånd från aktivt kort.
// abs: 0 (aktiv), 1 (granne), 2 (utkant), 3+ (off-stage).
function styleForOffset(abs: number) {
  switch (abs) {
    case 0:
      return { scale: 1, opacity: 1, blur: 0 };
    case 1:
      return { scale: 0.6, opacity: 0.4, blur: 2 };
    case 2:
      return { scale: 0.42, opacity: 0.18, blur: 4 };
    default:
      return { scale: 0.32, opacity: 0, blur: 6 };
  }
}

export function ParallaxTimeline({
  chapter,
  background,
  accent = "#EC7E26",
  overlay = 0.55,
  children,
}: ParallaxTimelineProps) {
  const items = parseItems(children);
  const activeStep = useSlideSteps(items.length);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background, overlay) }}
    >
      {/* Chapter — uppe till höger */}
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
            color: "var(--text-muted)",
            zIndex: 5,
          }}
        >
          {chapter}
        </motion.div>
      ) : null}

      {/* Stage med korten */}
      <div style={{ position: "absolute", inset: 0 }}>
        {items.map((item, i) => {
          const offset = i - activeStep;
          const abs = Math.abs(offset);
          const { scale, opacity, blur } = styleForOffset(abs);
          // Horisontellt avstånd per steg, i % av slide-canvas. Ger
          // parallax-känslan eftersom djupare kort skalar ner snabbare.
          const xPct = offset * 24;
          const cardStyle: CSSProperties = {
            position: "absolute",
            left: `calc(50% + ${xPct}%)`,
            top: "50%",
            translate: "-50% -50%",
            width: "min(640px, 36%)",
            textAlign: "left",
            pointerEvents: "none",
            // CSS-transition för left (parent-relativ), framer-motion för
            // transform (scale/opacity/filter). Båda matchar 700 ms.
            transition:
              "left 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          };
          const isActive = abs === 0;

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale,
                opacity,
                filter: `blur(${blur}px)`,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={cardStyle}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(5.5rem, 11vw, 11rem)",
                  fontWeight: 700,
                  lineHeight: 0.9,
                  letterSpacing: "-0.04em",
                  color: isActive ? accent : "var(--text)",
                  textShadow: isActive ? `0 0 60px ${accent}33` : "none",
                  marginBottom: item.text ? "1.4rem" : 0,
                }}
              >
                {item.year}
              </div>
              {item.text ? (
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.1rem, 1.6vw, 1.7rem)",
                    lineHeight: 1.35,
                    color: "rgba(247,241,230,0.86)",
                    maxWidth: "32ch",
                    fontWeight: 400,
                  }}
                >
                  {item.text}
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* Steg-indikator nederst */}
      {items.length > 1 ? (
        <div
          style={{
            position: "absolute",
            bottom: "clamp(2.4rem, 5vh, 4rem)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.7rem",
            alignItems: "center",
            zIndex: 5,
          }}
        >
          {items.map((item, i) => {
            const isActive = i === activeStep;
            return (
              <div
                key={i}
                style={{
                  width: isActive ? "2.6rem" : "0.5rem",
                  height: "0.5rem",
                  borderRadius: "0.3rem",
                  background: isActive ? accent : "color-mix(in srgb, var(--text) 22%, transparent)",
                  transition:
                    "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                aria-label={item.year}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
