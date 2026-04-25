"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

/**
 * BloomPyramid — visualiserar Bloom som en pyramid med två möjliga riktningar.
 *
 * Linsen är att SE pyramidens dubbla läsning: klassisk byggriktning (komma-
 * ihåg → skapa) och omvänd designriktning (skapa → komma-ihåg). Båda är
 * giltiga val. Inte hierarki, utan TANKESÄTT.
 *
 * Pyramidens BREDDER reflekterar abstraktionsnivå (mer abstrakt = smalare på
 * topp, mer konkret = bredare på botten) — inte värdering. Alla nivåer får
 * samma accent.
 *
 * MDX-format — varje listpunkt blir en nivå (toppen först, botten sist):
 *
 * ```mdx
 * <BloomPyramid chapter="§ Bloom · taxonomi">
 * - **Skapa** · producera nytt
 * - **Värdera** · bedöma & kritisera
 * - **Analysera** · bryta ner & koppla
 * - **Tillämpa** · använda i kontext
 * - **Förstå** · tolka & exemplifiera
 * - **Komma ihåg** · återge fakta
 * </BloomPyramid>
 * ```
 *
 * Format per listpunkt: `**Nivå** · kort beskrivning`
 *
 * Använd `arrows="both"` (default) för att visa båda design-riktningarna,
 * `arrows="up"` för bara klassisk byggriktning, `arrows="down"` för bara
 * omvänd designriktning, `arrows="none"` för en ren pyramid.
 */

type ArrowMode = "both" | "up" | "down" | "none";

interface BloomPyramidProps {
  chapter?: string;
  intro?: string;
  background?: string;
  overlay?: number;
  accent?: string;
  arrows?: ArrowMode;
  /** Etikett för uppåt-pilen (klassisk byggriktning). */
  upLabel?: string;
  /** Etikett för nedåt-pilen (omvänd designriktning). */
  downLabel?: string;
  children?: ReactNode;
}

interface Level {
  name: string;
  description: string;
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

function parseLevels(children: ReactNode): Level[] {
  const levels: Level[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    if (!raw) return;
    const parts = raw.split(/\s*·\s*/);
    if (parts.length < 1) return;
    const nameMatch = parts[0].match(/^\*\*(.+?)\*\*$/);
    const name = nameMatch ? nameMatch[1].trim() : parts[0].trim();
    const description = parts.slice(1).join(" · ").trim();
    levels.push({ name, description });
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
  return levels;
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

export function BloomPyramid({
  chapter,
  intro,
  background,
  overlay = 0.7,
  accent = "#EC7E26",
  arrows = "both",
  upLabel = "Klassisk byggriktning",
  downLabel = "Omvänd designriktning",
  children,
}: BloomPyramidProps) {
  const levels = parseLevels(children);
  // Pyramidens bredder: smalast på topp (index 0), bredast på botten (sista index)
  const minWidth = 38;
  const maxWidth = 100;
  const widthFor = (i: number, total: number) => {
    if (total <= 1) return maxWidth;
    return minWidth + (maxWidth - minWidth) * (i / (total - 1));
  };

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
          gap: "clamp(1.2rem, 2.5vh, 2rem)",
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
              fontSize: "clamp(1.1rem, 1.6vw, 1.6rem)",
              color: "color-mix(in srgb, var(--text) 78%, transparent)",
              maxWidth: "32em",
              lineHeight: 1.3,
            }}
          >
            <EditableText path="intro" value={intro}>
              {intro}
            </EditableText>
          </motion.div>
        ) : null}

        {/* Pyramid + arrows */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: "clamp(1rem, 2vw, 2.5rem)",
            alignItems: "center",
            minHeight: 0,
          }}
        >
          {/* Vänster pil — klassisk byggriktning (uppåt) */}
          <ArrowColumn
            direction="up"
            label={upLabel}
            accent={accent}
            visible={arrows === "both" || arrows === "up"}
            delay={1.6}
          />

          {/* Pyramiden */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "clamp(0.4rem, 0.8vh, 0.7rem)",
              justifyContent: "center",
              height: "100%",
            }}
          >
            {levels.map((level, i) => (
              <BloomBand
                key={i}
                level={level}
                widthPercent={widthFor(i, levels.length)}
                accent={accent}
                delay={0.6 + i * 0.18}
              />
            ))}
          </div>

          {/* Höger pil — omvänd designriktning (nedåt) */}
          <ArrowColumn
            direction="down"
            label={downLabel}
            accent={accent}
            visible={arrows === "both" || arrows === "down"}
            delay={1.8}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Pyramidband
// ============================================================================

function BloomBand({
  level,
  widthPercent,
  accent,
  delay,
}: {
  level: Level;
  widthPercent: number;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: `${widthPercent}%`,
        minWidth: "16rem",
        background: `linear-gradient(135deg, ${accent}28 0%, ${accent}14 100%)`,
        border: `1px solid ${accent}66`,
        borderRadius: "0.4rem",
        padding: "clamp(0.65rem, 1.2vh, 1rem) clamp(1rem, 2vw, 1.8rem)",
        display: "flex",
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "center",
        gap: "clamp(0.6rem, 1.4vw, 1.2rem)",
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 0 18px ${accent}11`,
        transformOrigin: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(1.1rem, 1.7vw, 1.7rem)",
          color: "var(--text)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {level.name}
      </span>
      {level.description ? (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(0.85rem, 1.1vw, 1.1rem)",
            color: "color-mix(in srgb, var(--text) 62%, transparent)",
            lineHeight: 1.25,
          }}
        >
          — {level.description}
        </span>
      ) : null}
    </motion.div>
  );
}

// ============================================================================
// Pil-kolumn
// ============================================================================

function ArrowColumn({
  direction,
  label,
  accent,
  visible,
  delay,
}: {
  direction: "up" | "down";
  label: string;
  accent: string;
  visible: boolean;
  delay: number;
}) {
  if (!visible) return <div />;

  // Pilen är en vertikal SVG som ritas i takt med animationen
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, delay }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(0.6rem, 1.2vh, 1rem)",
        minWidth: "clamp(6rem, 9vw, 8rem)",
      }}
    >
      <svg
        width="36"
        height="100%"
        viewBox="0 0 36 320"
        preserveAspectRatio="xMidYMid meet"
        style={{ flex: 1, maxHeight: "60%" }}
      >
        {/* Pil-linje */}
        <motion.line
          x1="18"
          y1={direction === "up" ? 310 : 10}
          x2="18"
          y2={direction === "up" ? 30 : 290}
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: delay + 0.2, ease: "easeOut" }}
        />
        {/* Pilspets */}
        <motion.path
          d={
            direction === "up"
              ? "M 8 28 L 18 8 L 28 28"
              : "M 8 292 L 18 312 L 28 292"
          }
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 1.5 }}
        />
      </svg>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.65rem, 0.85vw, 0.85rem)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: accent,
          textAlign: "center",
          lineHeight: 1.4,
          maxWidth: "10em",
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}
