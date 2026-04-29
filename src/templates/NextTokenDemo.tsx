"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { EditableText } from "@/lib/inline-edit";
import { useSlideSteps } from "@/lib/slide-steps";

/**
 * NextTokenDemo — visualiserar hur en språkmodell väljer nästa token.
 *
 * Pedagogiskt: AI är inte magi. Den läser föregående text och beräknar
 * sannolikheter för nästa ord. Den mest sannolika "vinner". Sedan
 * upprepas processen.
 *
 * Form följer innehåll: meningen byggs upp token för token. Kandidat-
 * tokens svävar i ett "halo" över markören — den mest sannolika i
 * mitten/överst, mindre sannolika lägre och i kanterna. Storlek + glow
 * + opacitet + höjd = sannolikhet. Vinnaren pulsar, skickar en stråle
 * ner till meningen, och materialiserar som nästa token.
 *
 * Stegsystem (advance med space/pil):
 * - Steg 0: Brygga visas stort + meningens prefix + cursor
 * - Steg 1..N: Kandidat-fan för decision i appears, vinnaren droppar
 * - Steg N+1: Closing-text fade:r in
 *
 * MDX-format:
 *
 *   <NextTokenDemo
 *     chapter="§ I · Under huven"
 *     bridge="Men hur **gör** den det?"
 *     prefix="Solen går upp i"
 *     decisions={[
 *       [['öster', 0.87], ['väster', 0.04], ['molnen', 0.02], ['varje', 0.012], ['ankan', 0.0001]],
 *       [['och', 0.62], ['över', 0.18], ['varje', 0.09], [',', 0.04]],
 *       [['ner.', 0.41], ['går.', 0.28], ['försvinner.', 0.12], ['skiner.', 0.07]]
 *     ]}
 *     closing="Den vet inte vad solen är. Den känner mönstret."
 *   />
 *
 * Första elementet i varje decision = vald token (chosen).
 * Sannolikhet uttrycks som decimal mellan 0 och 1.
 */

type CandidateTuple = [string, number];

interface NextTokenDemoProps {
  chapter?: string;
  /** Stor bryggtext över sliden vid steg 0. **fet** ger accent-glow. */
  bridge?: string;
  prefix: string;
  /**
   * Decisions kan anges på två sätt:
   * 1) Direkt som array (fungerar i editor-läget): `decisions={[[['öster', 0.87], ...], ...]}`
   * 2) Som textsträng (pålitligt i MDX-runtime). Format:
   *    "tok1:p1,tok2:p2,tok3:p3 / tok4:p4,tok5:p5 / tok6:p6,tok7:p7"
   *    – decisions separeras av " / " (slash med mellanslag)
   *    – kandidater inom decision separeras av ","
   *    – token och sannolikhet separeras av ":"
   *    – för kommatecken som token, skriv "komma" – vi byter ut den
   */
  decisions?: CandidateTuple[][];
  decisionsText?: string;
  closing?: string;
  background?: string;
  overlay?: number;
  accent?: string;
}

interface Candidate {
  token: string;
  probability: number;
}

interface Decision {
  candidates: Candidate[];
  chosen: Candidate;
}

// Position-tabell för fan-layout (rank 0 = mest sannolik, i centrum/överst)
// [xPct, yPct, scaleMul, opacityMul]
const FAN_POSITIONS: ReadonlyArray<readonly [number, number, number, number]> = [
  [50, 18, 1.0, 1.0], // rank 0: chosen — center, top
  [70, 38, 0.7, 0.85], // rank 1: right
  [30, 38, 0.7, 0.85], // rank 2: left
  [85, 62, 0.5, 0.6], // rank 3: far right
  [15, 62, 0.5, 0.6], // rank 4: far left
  [50, 78, 0.36, 0.4], // rank 5: bottom center
  [78, 80, 0.32, 0.35], // rank 6+
  [22, 80, 0.32, 0.35],
];

function resolveBackground(bg: string | undefined, overlay: number): string {
  if (!bg) {
    return "radial-gradient(ellipse at 50% 28%, #1a1410 0%, #0a0908 78%)";
  }
  if (bg.startsWith("/") || bg.startsWith("http")) {
    const a = overlay;
    return `linear-gradient(rgba(10,9,8,${a}), rgba(10,9,8,${Math.min(
      1,
      a + 0.18
    )})), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

function formatProbability(p: number): string {
  if (p < 0.001) return `${(p * 100).toFixed(4)}%`;
  if (p < 0.01) return `${(p * 100).toFixed(2)}%`;
  if (p < 0.1) return `${(p * 100).toFixed(1)}%`;
  return `${Math.round(p * 100)}%`;
}

/** Inline-mini-markdown: **bold** → accent. */
function renderInline(text: string, accent: string, accentGlow: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span
          key={i}
          style={{
            color: accent,
            fontWeight: 700,
            textShadow: `0 0 28px ${accentGlow}, 0 0 60px ${accentGlow}`,
          }}
        >
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function NextTokenDemo({
  chapter,
  bridge,
  prefix,
  decisions: rawDecisions,
  decisionsText,
  closing,
  background,
  overlay = 0.55,
  accent = "var(--accent, #B4763A)",
}: NextTokenDemoProps) {
  const decisions: Decision[] = useMemo(() => {
    let source: CandidateTuple[][] = [];
    if (Array.isArray(rawDecisions) && rawDecisions.length > 0) {
      source = rawDecisions;
    } else if (typeof decisionsText === "string" && decisionsText.trim()) {
      // Format: "tok1:p1,tok2:p2 / tok3:p3,tok4:p4 / ..."
      source = decisionsText
        .split(/\s*\/\s*/)
        .map((decisionStr) =>
          decisionStr
            .split(",")
            .map((pair) => pair.trim())
            .filter(Boolean)
            .map((pair) => {
              const ix = pair.lastIndexOf(":");
              if (ix < 0) return null;
              let token = pair.slice(0, ix).trim();
              const prob = parseFloat(pair.slice(ix + 1).trim());
              if (token === "komma") token = ",";
              if (Number.isNaN(prob)) return null;
              return [token, prob] as CandidateTuple;
            })
            .filter((c): c is CandidateTuple => c !== null)
        )
        .filter((d) => d.length > 0);
    }
    return source
      .filter((d) => Array.isArray(d) && d.length > 0)
      .map((d) => {
        const candidates = d.map(([token, probability]) => ({
          token,
          probability,
        }));
        return { candidates, chosen: candidates[0] };
      });
  }, [rawDecisions, decisionsText]);

  const totalSteps = decisions.length + 2;
  const step = useSlideSteps(totalSteps);

  const isInitial = step === 0;
  const isFinal = step >= decisions.length + 1;
  const decisionIdx = step - 1;
  const activeDecision: Decision | null =
    !isInitial && !isFinal ? decisions[decisionIdx] : null;

  const placedCount = isInitial ? 0 : isFinal ? decisions.length : decisionIdx;
  const placedTokens = useMemo(
    () => decisions.slice(0, placedCount).map((d) => d.chosen.token),
    [decisions, placedCount]
  );

  const accentResolved = accent ?? "var(--accent, #B4763A)";
  const accentGlow =
    accent && accent.startsWith("#")
      ? `${accent}77`
      : "var(--accent-glow, rgba(180,118,58,0.5))";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background, overlay) }}
    >
      {/* Atmosfär */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 55% at 50% 30%, ${accentResolved}26 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 50% 80%, rgba(103,212,205,0.10) 0%, transparent 70%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Subtilt rutmönster för "neuralt nät"-känsla */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(247,241,230,0.04) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Chapter-markör */}
      {chapter ? (
        <div
          style={{
            position: "absolute",
            top: "clamp(1.75rem, 3.5vh, 3rem)",
            left: "clamp(1.75rem, 3.5vw, 3rem)",
            fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
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
        </div>
      ) : null}

      {/* Bridge — stor på steg 0, liten/topp på steg 1+ */}
      {bridge ? (
        <BridgeText
          text={bridge}
          isFull={isInitial}
          accent={accentResolved}
          accentGlow={accentGlow}
        />
      ) : null}

      {/* Cloud area — kandidat-fan */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bridge ? "20%" : "12%",
          bottom: "42%",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="wait">
          {activeDecision ? (
            <CandidateFan
              key={`decision-${decisionIdx}`}
              decision={activeDecision}
              accent={accentResolved}
              accentGlow={accentGlow}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Sentence row */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "23%",
          display: "flex",
          justifyContent: "center",
          padding: "0 clamp(2rem, 4vw, 4rem)",
          zIndex: 3,
        }}
      >
        <SentenceRow
          prefix={prefix}
          placedTokens={placedTokens}
          showCursor={!isFinal}
          accent={accentResolved}
          accentGlow={accentGlow}
        />
      </div>

      {/* Closing */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "8%",
          display: "flex",
          justifyContent: "center",
          padding: "0 clamp(2rem, 4vw, 4rem)",
          zIndex: 3,
        }}
      >
        <AnimatePresence>
          {isFinal && closing ? (
            <motion.div
              key="closing"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                fontFamily: "var(--font-display, Fraunces, serif)",
                fontStyle: "italic",
                fontSize: "clamp(1.1rem, 1.7vw, 1.6rem)",
                textAlign: "center",
                maxWidth: "52rem",
                color: "var(--text)",
                lineHeight: 1.4,
              }}
            >
              <EditableText path="closing" value={closing}>
                {closing}
              </EditableText>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Bridge ----------

function BridgeText({
  text,
  isFull,
  accent,
  accentGlow,
}: {
  text: string;
  isFull: boolean;
  accent: string;
  accentGlow: string;
}) {
  return (
    <motion.div
      initial={false}
      animate={
        isFull
          ? {
              top: "32%",
              fontSize: "clamp(2.5rem, 5vw, 4.8rem)",
              opacity: 1,
            }
          : {
              top: "8%",
              fontSize: "clamp(0.85rem, 1.1vw, 1.1rem)",
              opacity: 0.55,
            }
      }
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(94%, 60rem)",
        textAlign: "center",
        fontFamily: "var(--font-display, Fraunces, serif)",
        fontWeight: 500,
        letterSpacing: isFull ? "-0.025em" : "0.04em",
        color: "var(--text)",
        zIndex: 4,
        textShadow: isFull ? "0 8px 40px rgba(0,0,0,0.6)" : "none",
        pointerEvents: "none",
        textTransform: isFull ? "none" : "uppercase",
      }}
    >
      {renderInline(text, accent, accentGlow)}
    </motion.div>
  );
}

// ---------- Sentence row ----------

function SentenceRow({
  prefix,
  placedTokens,
  showCursor,
  accent,
  accentGlow,
}: {
  prefix: string;
  placedTokens: string[];
  showCursor: boolean;
  accent: string;
  accentGlow: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0.55rem 0.65rem",
        fontFamily: "var(--font-display, Fraunces, serif)",
        fontWeight: 500,
        fontSize: "clamp(2.1rem, 4.8vw, 4.2rem)",
        letterSpacing: "-0.02em",
        color: "var(--text)",
        lineHeight: 1.15,
        textShadow: "0 6px 30px rgba(0,0,0,0.6)",
      }}
    >
      <span style={{ opacity: 0.94 }}>
        <EditableText path="prefix" value={prefix}>
          {prefix}
        </EditableText>
      </span>
      {placedTokens.map((token, i) => (
        <motion.span
          key={`token-${i}-${token}`}
          initial={{ opacity: 0, y: -36, scale: 0.55, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 24,
            delay: 0.18,
          }}
          style={{
            display: "inline-block",
            color: accent,
            fontWeight: 600,
            textShadow: `0 0 28px ${accentGlow}`,
          }}
        >
          {token}
        </motion.span>
      ))}
      {showCursor ? (
        <motion.span
          aria-hidden
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          style={{
            display: "inline-block",
            width: "0.13em",
            height: "0.95em",
            background: accent,
            transform: "translateY(0.08em)",
            marginLeft: "0.05em",
            boxShadow: `0 0 14px ${accentGlow}`,
          }}
        />
      ) : null}
    </div>
  );
}

// ---------- Candidate fan ----------

type Phase = "appearing" | "considering" | "selecting";

function CandidateFan({
  decision,
  accent,
  accentGlow,
}: {
  decision: Decision;
  accent: string;
  accentGlow: string;
}) {
  // Sortera fallande efter sannolikhet — index 0 = chosen
  const sorted = useMemo(() => {
    return [...decision.candidates].sort(
      (a, b) => b.probability - a.probability
    );
  }, [decision]);

  // Phase-machine: appearing → considering → selecting → dropping
  const [phase, setPhase] = useState<Phase>("appearing");

  useEffect(() => {
    setPhase("appearing");
    const t1 = setTimeout(() => setPhase("considering"), 350);
    const t2 = setTimeout(() => setPhase("selecting"), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [decision]);

  // Beam visas under selecting-fasen
  const showBeam = phase === "selecting";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.25 }}
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      {/* Chosen-beam: stråle från chosen-kortet ner till meningen */}
      <AnimatePresence>
        {showBeam ? <ChosenBeam accent={accent} accentGlow={accentGlow} /> : null}
      </AnimatePresence>

      {sorted.map((cand, i) => {
        const isChosen = i === 0;
        const pos = FAN_POSITIONS[Math.min(i, FAN_POSITIONS.length - 1)];
        return (
          <CandidateCard
            key={`${cand.token}-${i}`}
            token={cand.token}
            probability={cand.probability}
            isChosen={isChosen}
            rank={i}
            xPct={pos[0]}
            yPct={pos[1]}
            scaleMul={pos[2]}
            opacityMul={pos[3]}
            phase={phase}
            accent={accent}
            accentGlow={accentGlow}
          />
        );
      })}
    </motion.div>
  );
}

function ChosenBeam({ accent, accentGlow }: { accent: string; accentGlow: string }) {
  return (
    <motion.div
      key="beam"
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: [0, 0.85, 0], scaleY: [0, 1, 1] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut", times: [0, 0.4, 1] }}
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        top: "20%",
        bottom: "-30%",
        width: "3px",
        marginLeft: "-1.5px",
        transformOrigin: "top",
        background: `linear-gradient(to bottom, ${accent} 0%, ${accent}cc 35%, transparent 100%)`,
        boxShadow: `0 0 24px ${accentGlow}, 0 0 60px ${accentGlow}`,
        filter: "blur(0.5px)",
        pointerEvents: "none",
      }}
    />
  );
}

function CandidateCard({
  token,
  probability,
  isChosen,
  rank,
  xPct,
  yPct,
  scaleMul,
  opacityMul,
  phase,
  accent,
  accentGlow,
}: {
  token: string;
  probability: number;
  isChosen: boolean;
  rank: number;
  xPct: number;
  yPct: number;
  scaleMul: number;
  opacityMul: number;
  phase: Phase;
  accent: string;
  accentGlow: string;
}) {
  // Enter-stagger
  const enterDelay = 0.05 + rank * 0.09;

  // Phase-baserad opacity/scale/y
  const phaseValues = (() => {
    if (phase === "appearing") {
      return {
        opacity: 0,
        scale: scaleMul * 0.7,
        y: -20,
      };
    }
    if (phase === "considering") {
      return {
        opacity: opacityMul,
        scale: scaleMul,
        y: 0,
      };
    }
    // selecting — chosen pulserar och glöder, andra dim:as
    if (isChosen) {
      return {
        opacity: 1,
        scale: scaleMul * 1.18,
        y: -8,
      };
    }
    return {
      opacity: opacityMul * 0.4,
      scale: scaleMul * 0.92,
      y: 0,
    };
  })();

  const fontSize = `clamp(0.7rem, ${1.6 * scaleMul + 0.4}vw, ${
    1.6 * scaleMul + 0.6
  }rem)`;
  const tokenFontSize = `clamp(${0.95 * scaleMul}rem, ${
    1.6 * scaleMul + 0.6
  }vw, ${1.5 * scaleMul + 1.2}rem)`;
  const pctFontSize = `clamp(${0.6 * scaleMul}rem, ${
    0.85 * scaleMul + 0.2
  }vw, ${0.85 * scaleMul + 0.3}rem)`;

  // Bar fyller efter enter-delay, inom appearing→considering övergång
  const fillDelay = enterDelay + 0.45;

  // VIKTIGT: framer-motion överskriver style.transform när vi animerar
  // scale/y, så vi MÅSTE använda en wrapper-div för centrering. Inre motion.div
  // gör enbart animationen.
  return (
    <div
      style={{
        position: "absolute",
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: scaleMul * 0.7, y: -20 }}
        animate={phaseValues}
        transition={{
          duration: 0.5,
          delay: phase === "appearing" ? 0 : enterDelay,
          ease: phase === "selecting" ? [0.22, 1.4, 0.36, 1] : "easeOut",
        }}
        style={{
          width: `clamp(${4.5 * scaleMul}rem, ${10 * scaleMul + 1}vw, ${
            7.5 * scaleMul + 1.5
          }rem)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          padding: `${0.55 * scaleMul + 0.25}rem ${0.5 * scaleMul + 0.2}rem`,
          background: isChosen
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.025)",
          border: isChosen
            ? `1.5px solid ${accent}99`
            : "1px solid rgba(255,255,255,0.10)",
          borderRadius: "0.85rem",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: isChosen
            ? `0 0 ${50 * scaleMul}px ${accentGlow}, 0 0 ${
                20 * scaleMul
              }px ${accentGlow}, inset 0 0 0 1px ${accent}44`
            : `0 ${2 * scaleMul}px ${10 * scaleMul}px rgba(0,0,0,${
                0.3 * opacityMul
            })`,
        }}
      >
      <div
        style={{
          fontFamily: "var(--font-display, Fraunces, serif)",
          fontSize: tokenFontSize,
          fontWeight: isChosen ? 700 : 500,
          color: isChosen ? accent : "var(--text)",
          textShadow: isChosen
            ? `0 0 ${24 * scaleMul}px ${accentGlow}, 0 0 ${
                60 * scaleMul
              }px ${accentGlow}`
            : "none",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          lineHeight: 1.05,
          textAlign: "center",
        }}
      >
        {token}
      </div>
      {/* Probability bar */}
      <div
        style={{
          width: "100%",
          height: `${0.18 + scaleMul * 0.18}rem`,
          background: "rgba(255,255,255,0.08)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.max(probability * 100, 0.6)}%`,
          }}
          transition={{
            duration: 0.7,
            delay: fillDelay,
            ease: "easeOut",
          }}
          style={{
            height: "100%",
            background: isChosen
              ? `linear-gradient(90deg, ${accent}, ${accent}ee)`
              : "var(--text-muted)",
            boxShadow: isChosen ? `0 0 14px ${accent}` : "none",
            borderRadius: "999px",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
          fontSize: pctFontSize,
          letterSpacing: "0.06em",
          color: isChosen ? accent : "color-mix(in srgb, var(--text) 60%, transparent)",
          fontWeight: isChosen ? 600 : 400,
        }}
      >
        {formatProbability(probability)}
      </div>
      </motion.div>
    </div>
  );
}
