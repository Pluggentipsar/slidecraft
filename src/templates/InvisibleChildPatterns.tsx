"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";
import { useSlideSteps } from "@/lib/slide-steps";

type Size = "sm" | "md" | "lg" | "xl";

interface InvisibleChildPatternsProps {
  /** Rubrik ovanför rutnätet */
  title?: string;
  /** Liten tag ovanför titeln (UPPERCASE) */
  tag?: string;
  /** Titel-storlek */
  titleSize?: Size;
  /** Antal kolumner i gridden. Default 3. */
  columns?: number | string;
  /**
   * Mönster i markdown-lista, format:
   * - **Mönster-namn** · En-rads sammanfattning · Källa(n)
   */
  children?: ReactNode;
}

const TITLE_SIZES: Record<Size, string> = {
  sm: "clamp(1.5rem, 3vw, 2.25rem)",
  md: "clamp(2rem, 4vw, 3rem)",
  lg: "clamp(2.75rem, 5vw, 4.25rem)",
  xl: "clamp(3.5rem, 6.5vw, 5.5rem)",
};

interface Pattern {
  name: string;
  summary: string;
  source?: string;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isValidElement(node)) {
    return extractText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return "";
}

function parseLi(li: ReactElement<{ children?: ReactNode }>): Pattern {
  const raw = extractText(li.props.children).trim();
  const parts = raw.split("·").map((p) => p.trim());
  const name = parts[0]?.replace(/^\*\*(.*)\*\*$/, "$1") ?? "";
  const summary = parts[1] ?? "";
  const source = parts.slice(2).join(" · ") || undefined;
  return { name, summary, source };
}

function parseChildren(children: ReactNode): Pattern[] {
  const items: Pattern[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ children?: ReactNode }>;
    if (el.type === "ul" || el.type === "ol") {
      Children.forEach(el.props.children, (li) => {
        if (isValidElement(li) && (li as ReactElement).type === "li") {
          items.push(parseLi(li as ReactElement<{ children?: ReactNode }>));
        }
      });
    } else if (el.type === "li") {
      items.push(parseLi(el));
    }
  });
  return items;
}

/**
 * InvisibleChildPatterns — numrerat rutnät av mönster för "det osynliga
 * barnet". Stegad reveal: ett kort i taget tonas fram. Varje kort visar
 * stort numrerat märke, mönsternamn, en-radig sammanfattning och källa.
 *
 * Designad för pedagogiska/kliniska mönster-modeller där varje mönster
 * behöver namn + en-radig sammanfattning + forskningskälla. Lämpar sig
 * för "det osynliga barnet"-typ-modeller, Bloom-varianter, ACE-symtom,
 * trauma-symtomkategorier — situationer där föreläsaren går igenom flera
 * mönster en i taget och vill att källattributionen sitter direkt på kortet.
 *
 * Format i children:
 *   - **"Duktig flicka"** · Hypervigilans bakom toppbetygen. · Almqvist 2019
 */
export function InvisibleChildPatterns({
  title,
  tag,
  titleSize = "md",
  columns = 3,
  children,
}: InvisibleChildPatternsProps) {
  const items = parseChildren(children);
  const colCount =
    typeof columns === "string" ? parseInt(columns, 10) : columns;
  const activeStep = useSlideSteps(items.length);

  return (
    <div className="slide-container">
      <div
        className="flex w-full flex-col gap-8"
        style={{ maxWidth: "var(--slide-max-width)" }}
      >
        {(tag || title) && (
          <div className="flex flex-col gap-2">
            {tag && (
              <motion.span
                className="text-xs uppercase tracking-[0.35em]"
                style={{ color: "var(--accent)" }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <EditableText path="tag" value={tag ?? ""}>{tag}</EditableText>
              </motion.span>
            )}
            {title && (
              <motion.h2
                className="leading-[1.05]"
                style={{
                  fontSize: TITLE_SIZES[titleSize],
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--heading-weight)",
                  letterSpacing: "var(--heading-tracking)",
                  color: "var(--text)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <EditableText
                  path="title"
                  value={title ?? ""}
                  sizeControls={[
                    { prop: "titleSize", current: titleSize, options: ["sm", "md", "lg", "xl"], label: "Titel" },
                  ]}
                >{title}</EditableText>
              </motion.h2>
            )}
          </div>
        )}

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
        >
          {items.map((item, i) => {
            const isActive = i <= activeStep;
            return (
              <motion.div
                key={i}
                className="flex flex-col gap-3 p-6"
                style={{
                  borderRadius: "var(--radius)",
                  border: isActive
                    ? "1px solid color-mix(in srgb, var(--accent) 35%, transparent)"
                    : "1px solid color-mix(in srgb, var(--text) 8%, transparent)",
                  background: isActive
                    ? "color-mix(in srgb, var(--bg-surface) 65%, transparent)"
                    : "color-mix(in srgb, var(--bg-surface) 25%, transparent)",
                  backdropFilter: "blur(4px)",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: isActive ? 1 : 0.18,
                  y: 0,
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="leading-none tabular-nums"
                    style={{
                      fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      color: isActive ? "var(--accent)" : "var(--text-muted)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div
                  className="leading-tight"
                  style={{
                    fontSize: "clamp(1.125rem, 1.55vw, 1.4rem)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    color: "var(--text)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {item.name}
                </div>
                <div
                  className="leading-snug"
                  style={{
                    fontSize: "clamp(0.92rem, 1.15vw, 1.05rem)",
                    color: "var(--text)",
                    opacity: 0.78,
                  }}
                >
                  {item.summary}
                </div>
                {item.source && (
                  <div
                    className="mt-auto pt-2 text-[0.65rem] uppercase tracking-[0.22em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.source}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
