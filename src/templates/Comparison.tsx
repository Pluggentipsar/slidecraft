"use client";

import { motion } from "framer-motion";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

interface ComparisonProps {
  title?: string;
  accentSide?: "left" | "right" | "none";
  children?: ReactNode;
}

interface ComparisonColumnProps {
  title: string;
  children?: ReactNode;
}

/**
 * Två kolumner sida vid sida. Användbar för:
 * - Före/efter
 * - Utan AI / Med AI
 * - Vad skolan var / Vad skolan kan bli
 *
 * Användning:
 * <Comparison title="Före / Efter" accentSide="right">
 *   <ComparisonColumn title="Utan AI">
 *     - Samma material till alla
 *   </ComparisonColumn>
 *   <ComparisonColumn title="Med AI">
 *     - Individanpassat på 30 sek
 *   </ComparisonColumn>
 * </Comparison>
 */
export function Comparison({ title, accentSide = "right", children }: ComparisonProps) {
  // Filter out only ComparisonColumn children
  const columns = Children.toArray(children).filter(
    (child) => isValidElement(child)
  ) as ReactElement<ComparisonColumnProps>[];

  return (
    <div className="slide-container">
      <div
        className="flex w-full flex-col gap-10"
        style={{ maxWidth: "var(--slide-max-width)" }}
      >
        {title && (
          <motion.h2
            className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--heading-weight)",
              letterSpacing: "var(--heading-tracking)",
              textTransform: "var(--heading-case)" as "normal" | "uppercase",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EditableText path="title" value={title ?? ""}>{title}</EditableText>
          </motion.h2>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {columns.map((col, i) => {
            const isAccent =
              (accentSide === "left" && i === 0) ||
              (accentSide === "right" && i === columns.length - 1);
            return (
              <motion.div
                key={i}
                className={`flex flex-col gap-5 border p-8 ${
                  isAccent
                    ? "border-accent-dim bg-accent-dim/30"
                    : "border-white/10 bg-bg-surface/40"
                }`}
                style={{
                  borderRadius: "var(--radius)",
                  boxShadow: isAccent ? "0 0 24px var(--accent-dim)" : undefined,
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.15, ease: "easeOut" }}
              >
                <h3
                  className={`text-[clamp(1.5rem,3vw,2.25rem)] leading-tight ${
                    isAccent ? "text-accent" : "text-text"
                  }`}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: "var(--heading-weight)",
                    letterSpacing: "var(--heading-tracking)",
                    textTransform: "var(--heading-case)" as "normal" | "uppercase",
                  }}
                >
                  {col.props.title}
                </h3>
                <div className="slide-prose text-[clamp(1rem,1.75vw,1.25rem)]">
                  {col.props.children}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ComparisonColumn(_props: ComparisonColumnProps) {
  // Denna komponent används bara som "data holder" inuti Comparison.
  // Children och title läses av Comparison via Children.map.
  return null;
}
