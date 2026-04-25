"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

/**
 * AcronymList — visa en akronym/modell genom att expandera bokstav för bokstav.
 *
 * Designad för introduktion av modeller som SAMR, Bloom-nivåer, ECPA, etc.
 * Per rad: stor accent-bokstav till vänster, fullt ord och kort beskrivning
 * till höger. Vertikalt staplat så det funkar för 3-6 ord.
 *
 * MDX-format:
 * ```mdx
 * <AcronymList chapter="§ Puentedura · 2006" tagline="Fyra sätt teknik kan förändra en uppgift.">
 * - **S** · Substitution · ersätter ett verktyg
 * - **A** · Augmentation · förbättrar funktionellt
 * - **M** · Modification · omdesignar uppgiften
 * - **R** · Redefinition · möjliggör något nytt
 * </AcronymList>
 * ```
 *
 * Format per listpunkt: `**Bokstav** · Ord · Beskrivning`
 */

interface AcronymListProps {
  chapter?: string;
  /** Liten rubrik ovanför listan. */
  title?: string;
  /** Liten avslutande text under listan. */
  tagline?: string;
  background?: string;
  overlay?: number;
  accent?: string;
  children?: ReactNode;
}

interface Item {
  letter: string;
  word: string;
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

function parseItems(children: ReactNode): Item[] {
  const items: Item[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    if (!raw) return;
    const parts = raw.split(/\s*·\s*/);
    if (parts.length < 1) return;
    // Två format stöds:
    //   "**S** · Skapa · producera nytt"  (akronym med bokstav)
    //   "Skapa · producera nytt"          (lista utan bokstav)
    const firstPart = parts[0].trim();
    const letterMatch = firstPart.match(/^\*\*(.+?)\*\*$/);
    if (letterMatch) {
      items.push({
        letter: letterMatch[1].trim(),
        word: parts[1]?.trim() ?? "",
        description: parts.slice(2).join(" · ").trim(),
      });
    } else {
      items.push({
        letter: "",
        word: firstPart,
        description: parts.slice(1).join(" · ").trim(),
      });
    }
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
  return items;
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

export function AcronymList({
  chapter,
  title,
  tagline,
  background,
  overlay = 0.7,
  accent = "#EC7E26",
  children,
}: AcronymListProps) {
  const items = parseItems(children);
  const hasLetters = items.some((item) => item.letter.length > 0);

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
          gap: "clamp(1.4rem, 3vh, 2.5rem)",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        {/* Title */}
        {title ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 2.5vw, 2.6rem)",
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            <EditableText path="title" value={title}>
              {title}
            </EditableText>
          </motion.div>
        ) : null}

        {/* Lista */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(0.8rem, 1.8vh, 1.6rem)",
          }}
        >
          {items.map((item, i) => (
            <AcronymRow
              key={i}
              item={item}
              accent={accent}
              delay={0.5 + i * 0.25}
              hasLetters={hasLetters}
            />
          ))}
        </div>

        {/* Tagline */}
        {tagline ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 + items.length * 0.25 + 0.3 }}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(1rem, 1.4vw, 1.4rem)",
              color: "color-mix(in srgb, var(--text) 70%, transparent)",
              maxWidth: "32em",
              lineHeight: 1.35,
              borderLeft: `2px solid ${accent}66`,
              paddingLeft: "1rem",
            }}
          >
            <EditableText path="tagline" value={tagline}>
              {tagline}
            </EditableText>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

// ============================================================================
// En enskild rad
// ============================================================================

function AcronymRow({
  item,
  accent,
  delay,
  hasLetters,
}: {
  item: Item;
  accent: string;
  delay: number;
  hasLetters: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "grid",
        gridTemplateColumns: hasLetters
          ? "clamp(3.5rem, 6vw, 5.5rem) 1fr"
          : "1fr",
        gap: "clamp(1rem, 2vw, 2rem)",
        alignItems: "baseline",
        paddingBlock: "clamp(0.4rem, 0.8vh, 0.7rem)",
        borderBottom: `1px solid rgba(247,241,230,0.08)`,
      }}
    >
      {/* Bokstav (bara om några rader har en) */}
      {hasLetters ? (
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)",
            color: accent,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textAlign: "center",
            textShadow: `0 0 30px ${accent}55`,
          }}
        >
          {item.letter}
        </div>
      ) : null}

      {/* Ord + beskrivning */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(0.15rem, 0.3vh, 0.3rem)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.4rem, 2.4vw, 2.4rem)",
            color: "var(--text)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {item.word}
        </div>
        {item.description ? (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(0.95rem, 1.3vw, 1.3rem)",
              color: "color-mix(in srgb, var(--text) 62%, transparent)",
              lineHeight: 1.3,
            }}
          >
            {item.description}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
