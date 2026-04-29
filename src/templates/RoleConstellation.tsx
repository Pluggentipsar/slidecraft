"use client";

import { motion } from "framer-motion";
import { Children, isValidElement, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";
import { useSlideSteps } from "@/lib/slide-steps";

/**
 * RoleConstellation — visualiserar AI som mångdimensionell deltagare.
 *
 * Steg 1: Stort "VERKTYG" centrerat — den platta synen vi vill lämna.
 * Steg 2: VERKTYG fader bort, "AI" tar dess plats i mitten.
 * Steg 3+: Roll-etiketter exploderar fram i orbital cirkel runt AI.
 *         Varje klick lägger till fler roller. Roterar långsamt som
 *         planeter runt en sol.
 * Slut:  Hela konstellationen syns + landningsmening under.
 *
 * Pedagogisk poäng: när AI bara ses som "verktyg" tappar vi alla de
 * andra dimensioner det kan vara — samtalspartner, kritiker, muse,
 * elev, expert, novis. Animationen gör transformationen visuell.
 *
 * MDX-format — varje listpunkt är en roll AI kan vara:
 *
 * ```mdx
 * <RoleConstellation chapter="§ Bortom verktyget" landing="...">
 * - samtalspartner
 * - djävulens advokat
 * - elev
 * - expert
 * - kritiker
 * - muse
 * - kollega
 * - bollplank
 * </RoleConstellation>
 * ```
 */

interface RoleConstellationProps {
  chapter?: string;
  /** Centrum-ord vi vill lämna. Default "VERKTYG". */
  oldNoun?: string;
  /** Centrum-ord vi vill till. Default "AI". */
  newNoun?: string;
  /** Stor avslutande mening under konstellationen. */
  landing?: string;
  background?: string;
  overlay?: number;
  accent?: string;
  children?: ReactNode;
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

function parseRoles(children: ReactNode): string[] {
  const roles: string[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children).trim();
    if (raw) roles.push(raw);
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
  return roles;
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  const fallback = "radial-gradient(ellipse at 50% 40%, #0c0a14 0%, #050308 80%)";
  if (!bg) return fallback;
  if (bg.startsWith("/") || bg.startsWith("http")) {
    const a = overlay;
    return `linear-gradient(rgba(5,3,8,${a}), rgba(5,3,8,${Math.min(1, a + 0.05)})), url('${bg}') center/cover no-repeat, ${fallback}`;
  }
  return bg;
}

// ============================================================================
// Huvud-template
// ============================================================================

export function RoleConstellation({
  chapter,
  oldNoun = "VERKTYG",
  newNoun = "AI",
  landing,
  background,
  overlay = 0.85,
  accent = "#EC7E26",
  children,
}: RoleConstellationProps) {
  const roles = useMemo(() => parseRoles(children), [children]);

  // Stegsystem:
  //  step 0: bara oldNoun (VERKTYG) syns
  //  step 1: transformation — newNoun (AI) tar plats i mitten
  //  step 2: alla roller exploderar fram + landing
  const totalSteps = 3;
  const activeStep = useSlideSteps(totalSteps);

  const showOldNoun = activeStep === 0;
  const showNewNoun = activeStep >= 1;
  const showRoles = activeStep >= 2;
  const showLanding = activeStep >= 2;

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

      {/* Roterande orbital — innehåller roll-etiketter när visible */}
      <motion.div
        animate={showRoles ? { rotate: 360 } : { rotate: 0 }}
        transition={{
          duration: 60,
          repeat: showRoles ? Infinity : 0,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 0,
          height: 0,
          zIndex: 2,
        }}
      >
        {showRoles
          ? roles.map((role, i) => (
              <RoleLabel
                key={i}
                role={role}
                index={i}
                total={roles.length}
                accent={accent}
              />
            ))
          : null}
      </motion.div>

      {/* Centrumord (gamla → nya) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        {/* OLD: VERKTYG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: showOldNoun ? 1 : 0,
            scale: showOldNoun ? 1 : 0.6,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(5rem, 12vw, 14rem)",
            color: "var(--text)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            textShadow: "0 8px 50px rgba(0,0,0,0.7)",
          }}
        >
          {oldNoun}
        </motion.div>

        {/* NEW: AI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: showNewNoun ? 1 : 0,
            scale: showNewNoun ? 1 : 0.7,
          }}
          transition={{ duration: 1, delay: showOldNoun ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(6rem, 15vw, 18rem)",
            color: accent,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            textShadow: `0 0 80px ${accent}66, 0 8px 50px rgba(0,0,0,0.6)`,
          }}
        >
          {newNoun}
        </motion.div>

        {/* Pulserande halo runt AI */}
        {showNewNoun ? (
          <motion.div
            aria-hidden
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              width: "clamp(20rem, 40vw, 36rem)",
              height: "clamp(20rem, 40vw, 36rem)",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>

      {/* Landing-mening + progress i botten */}
      <div
        style={{
          position: "absolute",
          bottom: "clamp(3rem, 6vh, 5rem)",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(0.8rem, 1.6vh, 1.4rem)",
          padding: "0 clamp(3rem, 6vw, 7rem)",
          zIndex: 4,
        }}
      >
        {landing && showLanding ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(1.1rem, 1.8vw, 1.8rem)",
              color: "var(--text)",
              textAlign: "center",
              maxWidth: "44em",
              lineHeight: 1.3,
              textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            <EditableText path="landing" value={landing}>
              {landing}
            </EditableText>
          </motion.div>
        ) : null}

        {/* Progress-indikator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.65rem, 0.75vw, 0.78rem)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  height: "2px",
                  width: i === activeStep ? "1.6rem" : "0.4rem",
                  background: i <= activeStep ? accent : "color-mix(in srgb, var(--text) 25%, transparent)",
                  transition: "all 300ms ease",
                  borderRadius: "1px",
                }}
              />
            ))}
          </div>
          <span style={{ marginLeft: "0.6rem" }}>{activeStep + 1} / 3</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Roll-etikett — orbital position runt center
// ============================================================================

function RoleLabel({
  role,
  index,
  total,
  accent,
}: {
  role: string;
  index: number;
  total: number;
  accent: string;
}) {
  // Position runt cirkeln (i grader)
  const angle = (index / total) * 360 - 90; // start uppe
  const angleRad = (angle * Math.PI) / 180;
  // Radie: lite varierande för att inte se för mekanisk ut.
  // Större bas-radie så rollerna sprider ut sig ordentligt på en
  // 1920x1080 slide (center = 960, 540).
  const baseRadius = 440; // px
  const radiusJitter = ((index * 73) % 80) - 40;
  const radius = baseRadius + radiusJitter;
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;

  // Variation i font-storlek + delay
  const fontSize = 1.15 + ((index * 13) % 7) * 0.15; // 1.15 - 2.05 rem
  const delay = 0.1 + (index % 4) * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 0.92, scale: 1 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "absolute",
        // Säker positionering: top/left för position, transform för centering.
        // (Tidigare calc()-syntax i transform fungerade inte konsekvent
        // i alla browsers — labels hamnade i mitten istället.)
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 3 + (index % 3),
          delay: index * 0.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: `clamp(0.9rem, ${fontSize}vw, ${fontSize * 1.4}rem)`,
          color: "var(--text)",
          letterSpacing: "-0.01em",
          textShadow: `0 2px 12px rgba(0,0,0,0.7), 0 0 20px ${accent}33`,
        }}
      >
        {role}
      </motion.div>
    </motion.div>
  );
}
