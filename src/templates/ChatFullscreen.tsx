"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

interface ChatFullscreenProps {
  /** Liten mono-tagg uppe (t.ex. "§ XV · Tutorn"). */
  kicker?: string;
  /** Titel i header. */
  title?: string;
  /** Subtitel under titel. */
  subtitle?: string;
  /** Namn på AI-avsändaren i bubblan. Default "Tutor". */
  aiLabel?: string;
  /** Namn på user i bubblan. Default "Elev". */
  userLabel?: string;
  /** Regex-pattern för user-sida. Default matchar elev/du/user. */
  userPattern?: string;
  /** Bakgrundsbild eller CSS-värde. */
  background?: string;
  /** Accentfärg. */
  accent?: string;
  /** ms per tecken när AI typar. Default 14. */
  aiSpeed?: number;
  /** ms per tecken när user typar. Default 10. */
  userSpeed?: number;
  /** ms paus innan AI börjar svara (thinking). Default 600. */
  thinkingDelay?: number;
  /** ms paus mellan meddelanden. Default 400. */
  betweenDelay?: number;
  /**
   * Markdown-lista: `- **Role:** text`.
   * Labels som matchar userPattern renderas som user-bubbla (höger).
   */
  children?: ReactNode;
}

interface Message {
  side: "user" | "ai";
  label: string;
  text: string;
}

function resolveBackground(bg: string | undefined): string {
  const fallback = "radial-gradient(ellipse at 50% 10%, #141018 0%, #0a0908 70%)";
  if (!bg) return fallback;
  if (bg.startsWith("/") || bg.startsWith("http")) {
    return `linear-gradient(rgba(10,9,8,0.5), rgba(10,9,8,0.72)), url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
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

function parseMessages(children: ReactNode, userRe: RegExp): Message[] {
  const out: Message[] = [];
  const walkLi = (li: ReactElement<{ children?: ReactNode }>) => {
    const raw = extractText(li.props.children);
    const m = raw.match(/^\*\*([^*]+):\*\*\s*(.*)$/s);
    const label = m ? m[1].trim() : "";
    const text = m ? m[2].trim() : raw.trim();
    const side: "user" | "ai" = userRe.test(label) ? "user" : "ai";
    if (text) out.push({ side, label, text });
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

export function ChatFullscreen({
  kicker,
  title,
  subtitle,
  aiLabel = "Tutor",
  userLabel = "Elev",
  userPattern = "elev|du|user|jag",
  background,
  accent = "#EC7E26",
  aiSpeed = 28,
  userSpeed = 20,
  thinkingDelay = 1000,
  betweenDelay = 900,
  children,
}: ChatFullscreenProps) {
  const userRe = new RegExp(`^(${userPattern})\\b`, "i");
  const messages = parseMessages(children, userRe);
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-play driver — väntar på att CURRENT message ska typas klart innan nästa visas
  useEffect(() => {
    if (visibleIndex >= messages.length - 1) return;
    let delay: number;
    if (visibleIndex === -1) {
      delay = 800;
    } else {
      const curMsg = messages[visibleIndex];
      const thinkingPart = curMsg.side === "ai" ? thinkingDelay : 0;
      const speed = curMsg.side === "ai" ? aiSpeed : userSpeed;
      const typingPart = curMsg.text.length * speed;
      delay = thinkingPart + typingPart + betweenDelay;
    }
    const t = setTimeout(() => {
      setVisibleIndex(visibleIndex + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [visibleIndex, messages, aiSpeed, userSpeed, thinkingDelay, betweenDelay]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleIndex]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background) }}
    >
      <div
        className="relative flex h-full w-full flex-col"
        style={{
          padding: "clamp(2rem, 4vw, 3.5rem)",
          zIndex: 2,
          gap: "1rem",
        }}
      >
        {/* Header */}
        {(kicker || title || subtitle) ? (
          <div className="flex flex-col gap-2" style={{ flexShrink: 0 }}>
            {kicker ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(0.7rem, 0.85vw, 0.9rem)",
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: accent,
                  fontWeight: 600,
                }}
              >
                <EditableText path="kicker" value={kicker ?? ""}>{kicker}</EditableText>
              </motion.div>
            ) : null}
            {title ? (
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  color: "#F7F1E6",
                  margin: 0,
                }}
              >
                <EditableText path="title" value={title ?? ""}>{title}</EditableText>
              </motion.h2>
            ) : null}
            {subtitle ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "clamp(0.95rem, 1.1vw, 1.15rem)",
                  color: "rgba(247,241,230,0.65)",
                  margin: 0,
                }}
              >
                <EditableText path="subtitle" value={subtitle ?? ""}>{subtitle}</EditableText>
              </motion.p>
            ) : null}
          </div>
        ) : null}

        {/* Chat container */}
        <div
          ref={containerRef}
          className="flex-1"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(0.8rem, 1.2vw, 1.2rem)",
            overflowY: "auto",
            paddingRight: "0.5rem",
            scrollBehavior: "smooth",
          }}
        >
          {messages.map((msg, i) => {
            if (i > visibleIndex) return null;
            const isLatest = i === visibleIndex;
            const speed = msg.side === "ai" ? aiSpeed : userSpeed;
            return (
              <Bubble
                key={i}
                message={msg}
                aiLabel={aiLabel}
                userLabel={userLabel}
                accent={accent}
                typeSpeed={speed}
                thinkingDelay={msg.side === "ai" ? thinkingDelay : 0}
                animate={isLatest}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface BubbleProps {
  message: Message;
  aiLabel: string;
  userLabel: string;
  accent: string;
  typeSpeed: number;
  thinkingDelay: number;
  animate: boolean;
}

function Bubble({
  message,
  aiLabel,
  userLabel,
  accent,
  typeSpeed,
  thinkingDelay,
  animate,
}: BubbleProps) {
  const isUser = message.side === "user";
  const displayLabel = message.label || (isUser ? userLabel : aiLabel);
  const [thinking, setThinking] = useState(animate && !isUser);
  const [typed, setTyped] = useState(animate ? "" : message.text);

  useEffect(() => {
    if (!animate || isUser) {
      setThinking(false);
      return;
    }
    setThinking(true);
    const t = setTimeout(() => setThinking(false), thinkingDelay);
    return () => clearTimeout(t);
  }, [animate, isUser, thinkingDelay]);

  // När animate slås av (bubblan är inte längre senaste), tvinga full text.
  useEffect(() => {
    if (!animate) {
      setTyped(message.text);
    }
  }, [animate, message.text]);

  useEffect(() => {
    if (!animate) return;
    if (thinking) return;
    if (typed.length >= message.text.length) return;
    const t = setTimeout(() => {
      setTyped(message.text.slice(0, typed.length + 1));
    }, typeSpeed);
    return () => clearTimeout(t);
  }, [animate, thinking, typed, message.text, typeSpeed]);

  const typingDone = !animate || (!thinking && typed.length >= message.text.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        gap: "0.7rem",
        alignItems: "flex-end",
      }}
    >
      {!isUser ? (
        <div
          style={{
            flexShrink: 0,
            width: "2.1rem",
            height: "2.1rem",
            borderRadius: "50%",
            background: accent,
            color: "#0a0908",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            boxShadow: `0 6px 16px -4px ${accent}80`,
          }}
          aria-hidden
        >
          {aiLabel.slice(0, 2).toUpperCase()}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          alignItems: isUser ? "flex-end" : "flex-start",
          maxWidth: "min(75%, 42em)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: isUser ? accent : "rgba(247,241,230,0.55)",
            fontWeight: 600,
          }}
        >
          {displayLabel}
        </div>
        <div
          style={{
            padding: "0.85rem 1.15rem",
            borderRadius: isUser ? "1.2rem 1.2rem 0.3rem 1.2rem" : "1.2rem 1.2rem 1.2rem 0.3rem",
            background: isUser ? `${accent}` : "rgba(20, 18, 15, 0.65)",
            color: isUser ? "#0a0908" : "#F7F1E6",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
            lineHeight: 1.5,
            fontWeight: isUser ? 500 : 400,
            backdropFilter: isUser ? undefined : "blur(20px) saturate(140%)",
            WebkitBackdropFilter: isUser ? undefined : "blur(20px) saturate(140%)",
            border: isUser ? "none" : "1px solid rgba(255,255,255,0.12)",
            boxShadow: isUser
              ? `0 12px 30px -8px ${accent}50`
              : "0 12px 30px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            whiteSpace: "pre-wrap",
          }}
        >
          <AnimatePresence mode="wait">
            {thinking ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", gap: "0.35rem", padding: "0.15rem 0" }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    style={{
                      display: "inline-block",
                      width: "0.5rem",
                      height: "0.5rem",
                      borderRadius: "50%",
                      background: "rgba(247,241,230,0.6)",
                    }}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {typed}
                {!typingDone ? (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                    style={{
                      display: "inline-block",
                      width: "0.5ch",
                      height: "1em",
                      background: isUser ? "#0a0908" : accent,
                      marginLeft: "0.08em",
                      verticalAlign: "middle",
                    }}
                  />
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isUser ? (
        <div
          style={{
            flexShrink: 0,
            width: "2.1rem",
            height: "2.1rem",
            borderRadius: "50%",
            background: "rgba(247,241,230,0.15)",
            color: "#F7F1E6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            fontWeight: 700,
            border: "1px solid rgba(255,255,255,0.18)",
          }}
          aria-hidden
        >
          {userLabel.slice(0, 2).toUpperCase()}
        </div>
      ) : null}
    </motion.div>
  );
}
