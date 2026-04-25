"use client";

import { motion } from "framer-motion";
import { Children, isValidElement, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

type ZoneTone = "neutral" | "danger" | "success";

interface Zone {
  label: string;
  tone: ZoneTone;
  description: string;
}

interface UCurveChartProps {
  chapter?: string;
  title?: string;
  subtitle?: string;
  xLabel?: string;
  yLabel?: string;
  background?: string;
  accent?: string;
  overlay?: number;
  /**
   * Markdown-lista med zonbeskrivningar.
   * Format: `- Label · tone · Description`
   * Tones: neutral | danger | success
   * Zonerna fördelas evenly längs kurvan från vänster till höger.
   */
  children?: ReactNode;
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

function parseZones(children: ReactNode): Zone[] {
  const out: Zone[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    if (!raw) return;
    const parts = raw.split(/\s*·\s*/);
    if (parts.length < 2) return;
    const label = parts[0].trim();
    const toneRaw = (parts[1] ?? "neutral").trim().toLowerCase() as ZoneTone;
    const tone =
      toneRaw === "danger" || toneRaw === "success" || toneRaw === "neutral"
        ? toneRaw
        : "neutral";
    const description = parts.slice(2).join(" · ").trim();
    out.push({ label, tone, description });
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
    const a = overlay;
    return `linear-gradient(rgba(10,9,8,${a}), rgba(10,9,8,${Math.min(1, a + 0.1)})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

function toneColor(tone: ZoneTone, accent: string): string {
  switch (tone) {
    case "danger":
      return "#E84D4D";
    case "success":
      return accent;
    default:
      return "#B6B0A5";
  }
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

/**
 * Beräkna Y-position för en given X på en generisk U-kurva.
 * X i [0, 1] (0 = längst vänster, 1 = längst höger).
 * Returnerar Y i [0, 1] där 0 = botten, 1 = toppen.
 *
 * Kurvan följer mönstret: hög vänster (zon 1), låg mitten (zon 2 = sämst),
 * hög höger (zon 3), och sen nedåt igen (danger zone) — dvs. en U + droop.
 */
function uCurveY(x: number): number {
  // x ∈ [0, 1]
  // Komposition: en U (kvadratisk) + en peak före danger zone
  // Vi använder en smooth polynom som:
  //   - Startar vid y≈0.55 (x=0)  — Ingen AI
  //   - Dipp till y≈0.25 vid x=0.3 — Halvhjärtat
  //   - Topp vid y≈0.85 vid x=0.7 — Committed
  //   - Rasar till y≈0.2 vid x=1.0 — Total delegation
  //
  // Fit: Polynom som interpolerar dessa punkter.
  // Enklast: piecewise cubic.
  if (x <= 0.3) {
    // 0.55 → 0.25, kvadratisk ner
    const t = x / 0.3;
    return 0.55 - 0.3 * (t * t);
  } else if (x <= 0.7) {
    // 0.25 → 0.85, smooth S-kurva upp
    const t = (x - 0.3) / 0.4;
    const eased = t * t * (3 - 2 * t); // smoothstep
    return 0.25 + 0.6 * eased;
  } else {
    // 0.85 → 0.2, rasar nedåt
    const t = (x - 0.7) / 0.3;
    const eased = t * t; // accelererar nedåt
    return 0.85 - 0.65 * eased;
  }
}

/**
 * UCurveChart — animerad SVG-visualisering av en U-kurva med zonindikatorer.
 *
 * Kurvan ritas fram från vänster till höger (stroke-dasharray).
 * Zoner tänds upp i sekvens med labels + beskrivningar.
 * "Danger"-zoner pulsar subtilt.
 *
 * Use case: forsknings-slides om kognitiv avlastning, skärmtid,
 * AI-användning — överallt där en U-kurva förklarar optimal punkt.
 */
export function UCurveChart({
  chapter,
  title,
  subtitle,
  xLabel = "AI-beroende →",
  yLabel = "Lärande →",
  background,
  accent = "#EC7E26",
  overlay = 0.55,
  children,
}: UCurveChartProps) {
  const zones = parseZones(children);

  // Visningsbox — vi använder fast viewBox
  const vbW = 1200;
  const vbH = 560;
  const padL = 100;
  const padR = 80;
  const padT = 80;
  const padB = 120;
  const plotW = vbW - padL - padR;
  const plotH = vbH - padT - padB;

  // Generera path-punkter för kurvan
  const pathData = useMemo(() => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = padL + t * plotW;
      const y = padT + (1 - uCurveY(t)) * plotH;
      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return points.join(" ");
  }, [padL, plotW, padT, plotH]);

  // Positioner för zoner längs kurvan (evenly fördelade)
  const zonePositions = useMemo(() => {
    const N = zones.length;
    return zones.map((zone, i) => {
      // Placera markören i mitten av respektive segment
      const t = N === 1 ? 0.5 : (i + 0.5) / N;
      const curveT = t;
      const x = padL + curveT * plotW;
      const y = padT + (1 - uCurveY(curveT)) * plotH;
      return { x, y, zone, curveT };
    });
  }, [zones, padL, plotW, padT, plotH]);

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
            color: "var(--text-muted)",
            zIndex: 3,
          }}
        >
          <EditableText path="chapter" value={chapter}>
            {chapter}
          </EditableText>
        </motion.div>
      ) : null}

      {/* Innehåll */}
      <div
        className="relative flex h-full w-full flex-col"
        style={{
          padding: "clamp(2rem, 4vw, 4rem)",
          gap: "clamp(1rem, 2vh, 1.8rem)",
          zIndex: 2,
        }}
      >
        {/* Rubrik-sektion */}
        <div style={{ flexShrink: 0 }}>
          {title ? (
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(2.4rem, 4.5vw, 4.2rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "var(--text)",
                margin: 0,
              }}
            >
              <EditableText path="title" value={title}>
                {title}
              </EditableText>
            </motion.h2>
          ) : null}
          {subtitle ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "clamp(1.1rem, 1.4vw, 1.5rem)",
                color: "color-mix(in srgb, var(--text) 70%, transparent)",
                marginTop: "0.4rem",
              }}
            >
              <EditableText path="subtitle" value={subtitle}>
                {subtitle}
              </EditableText>
            </motion.div>
          ) : null}
        </div>

        {/* SVG-diagram */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            style={{ width: "100%", height: "100%", maxHeight: "100%" }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Axel-linjer */}
            <motion.line
              x1={padL}
              y1={padT + plotH}
              x2={padL + plotW}
              y2={padT + plotH}
              stroke="color-mix(in srgb, var(--text) 30%, transparent)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            />
            <motion.line
              x1={padL}
              y1={padT}
              x2={padL}
              y2={padT + plotH}
              stroke="color-mix(in srgb, var(--text) 30%, transparent)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            />

            {/* Axel-etiketter */}
            <motion.text
              x={padL + plotW / 2}
              y={vbH - 40}
              textAnchor="middle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "16px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fill: "color-mix(in srgb, var(--text) 60%, transparent)",
              }}
            >
              {xLabel}
            </motion.text>
            <motion.text
              x={-(padT + plotH / 2)}
              y={40}
              textAnchor="middle"
              transform={`rotate(-90)`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "16px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fill: "color-mix(in srgb, var(--text) 60%, transparent)",
              }}
            >
              {yLabel}
            </motion.text>

            {/* U-kurvan (glow bakom) */}
            <motion.path
              d={pathData}
              fill="none"
              stroke={accent}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 20px ${accent}88)` }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
            />
            {/* U-kurvan (skarp linje) */}
            <motion.path
              d={pathData}
              fill="none"
              stroke="var(--text)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
            />

            {/* Zon-markörer + labels */}
            {zonePositions.map(({ x, y, zone }, i) => {
              const color = toneColor(zone.tone, accent);
              const baseDelay = 3.8 + i * 0.6;
              const isDanger = zone.tone === "danger";
              // Placera label över eller under markören beroende på Y
              const labelAbove = y > padT + plotH * 0.5;
              const labelY = labelAbove ? y - 45 : y + 60;
              return (
                <g key={i}>
                  {/* Vertikal stödlinje (subtil) */}
                  <motion.line
                    x1={x}
                    y1={padT + plotH}
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    opacity={0.3}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 0.6, delay: baseDelay }}
                  />
                  {/* Markör (cirkel) */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="14"
                    fill={color}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{
                      r: isDanger ? [14, 18, 14] : 14,
                      opacity: 1,
                    }}
                    transition={{
                      r: isDanger
                        ? { duration: 2, delay: baseDelay + 0.2, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.5, delay: baseDelay },
                      opacity: { duration: 0.5, delay: baseDelay },
                    }}
                    style={{ filter: `drop-shadow(0 0 16px ${color})` }}
                  />
                  {/* Label */}
                  <motion.text
                    x={x}
                    y={labelY}
                    textAnchor="middle"
                    initial={{ opacity: 0, y: labelAbove ? labelY + 10 : labelY - 10 }}
                    animate={{ opacity: 1, y: labelY }}
                    transition={{ duration: 0.6, delay: baseDelay + 0.1 }}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "28px",
                      fill: color,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {zone.label}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Zon-beskrivningar — under diagrammet */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(zones.length, 1)}, 1fr)`,
            gap: "clamp(0.8rem, 1.5vw, 1.5rem)",
            flexShrink: 0,
          }}
        >
          {zones.map((zone, i) => {
            const color = toneColor(zone.tone, accent);
            const baseDelay = 3.8 + i * 0.6 + 0.4;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: baseDelay }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  padding: "clamp(0.6rem, 1vw, 1rem)",
                  borderLeft: `2px solid ${color}`,
                  background: "rgba(20, 18, 15, 0.35)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  borderRadius: "0 0.3rem 0.3rem 0",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(0.65rem, 0.8vw, 0.8rem)",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color,
                    fontWeight: 700,
                  }}
                >
                  {zone.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(0.78rem, 0.95vw, 0.95rem)",
                    color: "var(--text)",
                    lineHeight: 1.4,
                  }}
                >
                  {renderInline(zone.description, accent)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
