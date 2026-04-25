"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

type Size = "sm" | "md" | "lg" | "xl";

interface SectionDividerProps {
  /** Avsnittsnummer, tex "01" eller "Del 2" */
  number?: string;
  /** Titel */
  title: string;
  /** Undertitel */
  subtitle?: string;
  /** Förväntad tid för avsnittet */
  duration?: string;
  /** Variant - påverkar layout */
  variant?: "centered" | "left" | "hero";
  /** Storlek på titeln. Default md. */
  titleSize?: Size;
  /** Storlek på undertiteln. Default md. */
  subtitleSize?: Size;
  children?: ReactNode;
}

const TITLE_SIZES: Record<Size, string> = {
  sm: "clamp(1.75rem, 4vw, 3rem)",
  md: "clamp(2.5rem, 6vw, 5rem)",
  lg: "clamp(3.5rem, 8vw, 6.5rem)",
  xl: "clamp(4.5rem, 10vw, 8rem)",
};

const SUBTITLE_SIZES: Record<Size, string> = {
  sm: "clamp(0.95rem, 1.8vw, 1.375rem)",
  md: "clamp(1.25rem, 2.5vw, 1.875rem)",
  lg: "clamp(1.75rem, 3.5vw, 2.5rem)",
  xl: "clamp(2.25rem, 4.5vw, 3.25rem)",
};

/**
 * Avsnittsövergång i en lång presentation. Kommer mellan huvuddelar.
 *
 * <SectionDivider
 *   number="02"
 *   title="Möjligheterna"
 *   subtitle="Vad kan AI faktiskt göra i klassrummet?"
 *   duration="30 min"
 * />
 */
export function SectionDivider({
  number,
  title,
  subtitle,
  duration,
  variant = "centered",
  titleSize = "md",
  subtitleSize = "md",
  children,
}: SectionDividerProps) {
  const titleFontSize = TITLE_SIZES[titleSize];
  const subtitleFontSize = SUBTITLE_SIZES[subtitleSize];
  if (variant === "hero") {
    return (
      <div className="slide-container">
        <div
          className="flex w-full flex-col gap-10 text-center"
          style={{ maxWidth: "var(--slide-max-width)" }}
        >
          {number && (
            <motion.div
              className="text-[clamp(4rem,10vw,8rem)] font-black leading-none tracking-tight text-accent"
              style={{
                fontFamily: "var(--font-display)",
                textShadow: "0 0 40px var(--accent-glow)",
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {number}
            </motion.div>
          )}
          <motion.h1
            className="leading-tight"
            style={{
              fontSize: titleFontSize,
              fontFamily: "var(--font-display)",
              fontWeight: "var(--heading-weight)",
              letterSpacing: "var(--heading-tracking)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <EditableText path="title" value={title ?? ""}>{title}</EditableText>
          </motion.h1>
          {subtitle && (
            <motion.p
              className="mx-auto max-w-3xl leading-snug text-text-muted"
              style={{ fontSize: subtitleFontSize }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <EditableText path="subtitle" value={subtitle ?? ""}>{subtitle}</EditableText>
            </motion.p>
          )}
          {duration && (
            <motion.div
              className="mx-auto text-xs uppercase tracking-[0.3em] text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              {duration}
            </motion.div>
          )}
          {children}
        </div>
      </div>
    );
  }

  if (variant === "left") {
    return (
      <div className="slide-container">
        <div
          className="flex w-full flex-col items-start gap-6"
          style={{ maxWidth: "var(--slide-max-width)" }}
        >
          <motion.div
            className="h-1 w-24 bg-accent"
            style={{ boxShadow: "0 0 12px var(--accent-glow)" }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6 }}
          />
          {number && (
            <motion.div
              className="text-xs uppercase tracking-[0.3em] text-accent"
              style={{ fontWeight: 600 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {number}
            </motion.div>
          )}
          <motion.h1
            className="leading-[1.02]"
            style={{
              fontSize: titleFontSize,
              fontFamily: "var(--font-display)",
              fontWeight: "var(--heading-weight)",
              letterSpacing: "var(--heading-tracking)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <EditableText path="title" value={title ?? ""}>{title}</EditableText>
          </motion.h1>
          {subtitle && (
            <motion.p
              className="max-w-3xl leading-snug text-text-muted"
              style={{ fontSize: subtitleFontSize }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <EditableText path="subtitle" value={subtitle ?? ""}>{subtitle}</EditableText>
            </motion.p>
          )}
          {duration && (
            <motion.div
              className="mt-4 text-xs uppercase tracking-[0.3em] text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {duration}
            </motion.div>
          )}
          {children}
        </div>
      </div>
    );
  }

  // Default: centered
  return (
    <div className="slide-container">
      <div className="flex w-full flex-col items-center gap-8 text-center">
        {number && (
          <motion.div
            className="flex items-center gap-4 text-sm uppercase tracking-[0.35em] text-accent"
            style={{ fontWeight: 600 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="h-px w-8 bg-accent" />
            <span>{number}</span>
            <span className="h-px w-8 bg-accent" />
          </motion.div>
        )}
        <motion.h1
          className="leading-tight"
          style={{
            fontSize: titleFontSize,
            fontFamily: "var(--font-display)",
            fontWeight: "var(--heading-weight)",
            letterSpacing: "var(--heading-tracking)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="max-w-2xl leading-snug text-text-muted"
            style={{ fontSize: subtitleFontSize }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}
        {duration && (
          <motion.div
            className="text-xs uppercase tracking-[0.3em] text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {duration}
          </motion.div>
        )}
        {children}
      </div>
    </div>
  );
}
