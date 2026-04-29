"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EditableText } from "@/lib/inline-edit";

interface BigStatProps {
  /** Siffran att räkna upp till */
  value: number | string;
  /** Suffix, t.ex. "%", " miljoner" */
  suffix?: string;
  /** Prefix, t.ex. "$", "+" */
  prefix?: string;
  /** Label/beskrivning ovanför siffran (UPPERCASE eyebrow) */
  eyebrow?: string;
  /** Längre kontext OVANFÖR siffran (t.ex. "I Sverige idag...") */
  contextAbove?: string;
  /** Längre kontext UNDER siffran (huvudbudskapet) */
  contextBelow?: string;
  /** Källa (visas litet längst ned, UPPERCASE) */
  source?: string;
  /** Animationstid i sekunder (default 2) */
  duration?: number | string;
  /** Decimaler */
  decimals?: number | string;
  /**
   * Layout-stil:
   * - "editorial" (default): vänsterjusterat, eyebrow → siffra → kontext → källa
   * - "centered": symmetrisk, allt centrerat
   * - "frame": siffran sitter i en accent-färgad ram med kontext bredvid
   */
  layout?: "editorial" | "centered" | "frame";
  /** Färg på själva siffran (default = accent) */
  color?: string;
}

/**
 * BigStat — editorial-typografi för en chock-siffra med rik kontext.
 * Mer berättande än StatCounter, mer flexibel än Callout.
 *
 * <BigStat
 *   eyebrow="Siffran ingen vill prata om"
 *   contextAbove="Just nu, i Sverige,"
 *   value={240000}
 *   contextBelow="barn och unga lever under hedersrelaterat förtryck."
 *   source="Stiftelsen Allmänna Barnhuset, 2018"
 * />
 */
export function BigStat({
  value,
  suffix = "",
  prefix = "",
  eyebrow,
  contextAbove,
  contextBelow,
  source,
  duration = 2,
  decimals = 0,
  layout = "editorial",
  color,
}: BigStatProps) {
  const targetValue = Number(value);
  const decimalsNum =
    typeof decimals === "string" ? parseInt(decimals, 10) : decimals;
  const durationNum =
    typeof duration === "string" ? parseFloat(duration) : duration;

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(targetValue)) return;
    // Manuell ramp via rAF — robust över alla render-paths.
    const startMs = performance.now();
    const delayMs = 450;
    const totalMs = durationNum * 1000;
    let raf = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
    const tick = (now: number) => {
      const elapsed = now - startMs - delayMs;
      if (elapsed < 0) {
        setDisplayValue(0);
      } else if (elapsed >= totalMs) {
        setDisplayValue(targetValue);
        return;
      } else {
        const progress = elapsed / totalMs;
        setDisplayValue(targetValue * easeOut(progress));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetValue, durationNum]);

  const formatted = displayValue.toLocaleString("sv-SE", {
    minimumFractionDigits: decimalsNum,
    maximumFractionDigits: decimalsNum,
  });

  const numColor = color ?? "var(--accent)";

  const numberBlock = (
    <div
      className="flex items-baseline leading-[0.85]"
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: "var(--heading-weight)",
        letterSpacing: "-0.04em",
      }}
    >
      {prefix && (
        <span
          className="mr-2"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            color: "var(--text-muted)",
          }}
        >
          {prefix}
        </span>
      )}
      <span
        style={{
          fontSize: "clamp(7rem, 22vw, 18rem)",
          color: numColor,
          textShadow: "0 0 60px var(--accent-glow)",
        }}
      >
        {formatted}
      </span>
      {suffix && (
        <span
          className="ml-2 font-semibold"
          style={{
            fontSize: "clamp(3rem, 9vw, 7rem)",
            color: "var(--text)",
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );

  if (layout === "frame") {
    return (
      <div className="slide-container">
        <div
          className="grid w-full items-center gap-10"
          style={{
            maxWidth: "var(--slide-max-width)",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          }}
        >
          <motion.div
            className="flex flex-col items-start gap-4 border p-10"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "color-mix(in srgb, var(--accent) 50%, transparent)",
              borderWidth: "2px",
              background: "color-mix(in srgb, var(--accent) 8%, transparent)",
              boxShadow: "0 0 60px color-mix(in srgb, var(--accent) 18%, transparent)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {eyebrow && (
              <span className="text-xs uppercase tracking-[0.35em] text-text-muted">
                <EditableText path="eyebrow" value={eyebrow ?? ""}>{eyebrow}</EditableText>
              </span>
            )}
            {numberBlock}
            {source && (
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-text-muted">
                {source}
              </span>
            )}
          </motion.div>
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {contextAbove && (
              <p
                className="leading-snug text-text-muted"
                style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)" }}
              >
                {contextAbove}
              </p>
            )}
            {contextBelow && (
              <p
                className="leading-snug text-text"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--heading-weight)",
                  letterSpacing: "var(--heading-tracking)",
                }}
              >
                {contextBelow}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const isCentered = layout === "centered";
  return (
    <div className="slide-container">
      <div
        className={`flex w-full flex-col gap-6 ${isCentered ? "items-center text-center" : "items-start text-left"}`}
        style={{ maxWidth: "var(--slide-max-width)" }}
      >
        {eyebrow && (
          <motion.span
            className="text-xs uppercase tracking-[0.35em]"
            style={{ color: "var(--accent)" }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EditableText path="eyebrow" value={eyebrow ?? ""}>{eyebrow}</EditableText>
          </motion.span>
        )}
        {contextAbove && (
          <motion.p
            className="leading-snug text-text-muted"
            style={{ fontSize: "clamp(1.125rem, 2vw, 1.625rem)", maxWidth: "44rem" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {contextAbove}
          </motion.p>
        )}
        {numberBlock}
        {contextBelow && (
          <motion.p
            className="leading-snug"
            style={{
              fontSize: "clamp(1.5rem, 3.2vw, 2.75rem)",
              maxWidth: "48rem",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--heading-weight)",
              letterSpacing: "var(--heading-tracking)",
              color: "var(--text)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: durationNum * 0.6 }}
          >
            {contextBelow}
          </motion.p>
        )}
        {source && (
          <motion.span
            className="text-[0.7rem] uppercase tracking-[0.3em] text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: durationNum * 0.8 }}
          >
            {source}
          </motion.span>
        )}
      </div>
    </div>
  );
}
