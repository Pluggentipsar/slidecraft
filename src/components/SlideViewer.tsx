"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import { NotesOverlay } from "./NotesOverlay";
import { MenuOverlay } from "./MenuOverlay";
import { QuestionsOverlay } from "./QuestionsOverlay";
import { InteractionStartModal } from "./InteractionStartModal";
import { InteractionPresenterPanel } from "./InteractionPresenterPanel";
import { getPresenterChannel, type PresenterMessage } from "@/lib/presenter-sync";
import { usePresenterSession } from "@/lib/use-presenter-session";
import { usePresenterInteractions } from "@/lib/use-presenter-interactions";
import type { InteractionType } from "@/lib/interactions";
import type { StepController } from "@/lib/slide-steps";
import { SlideWithSteps } from "./SlideWithSteps";
import { AmbientParticles } from "./AmbientParticles";
import type { SlideMeta } from "@/lib/extract-slide-types";
import type { BrandWatermark } from "@/lib/types";

interface SlideViewerProps {
  children: ReactNode;
  notes?: (string | null)[];
  slideMetas?: SlideMeta[];
  slug?: string;
  theme?: string;
  title?: string;
  brand?: BrandWatermark;
  ambient?: boolean | string;
}

export function SlideViewer({
  children,
  notes = [],
  slideMetas = [],
  slug = "",
  theme = "default",
  title,
  brand,
  ambient = false,
}: SlideViewerProps) {
  const slides = useMemo(
    () =>
      Children.toArray(children).filter((child) =>
        isValidElement(child)
      ) as ReactElement[],
    [children]
  );
  const total = slides.length;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [notesVisible, setNotesVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [stepsCount, setStepsCount] = useState(0);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  const audience = usePresenterSession(slug);
  const interactions = usePresenterInteractions(audience.session?.id ?? null);
  const [interactionModal, setInteractionModal] = useState<InteractionType | null>(null);

  const stepsController = useRef<StepController | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setFullscreenSupported(document.fullscreenEnabled ?? false);
  }, []);

  // Göm hint efter 4 sekunder
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Sync with URL ?slide=N on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get("slide");
    if (param) {
      const n = parseInt(param, 10);
      if (!isNaN(n) && n >= 1 && n <= total) {
        setIndex(n - 1);
      }
    }
  }, [total]);

  // Update URL when index changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("slide", String(index + 1));
    window.history.replaceState({}, "", url.toString());
  }, [index]);

  // Broadcast slide till publikläget när session är aktiv
  useEffect(() => {
    audience.broadcastSlide(index);
  }, [index, audience]);

  // Poll stepsController så vi kan visa steg-count i menyn
  useEffect(() => {
    const interval = setInterval(() => {
      const n = stepsController.current?.getTotalSteps() ?? 0;
      setStepsCount((prev) => (prev !== n ? n : prev));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // BroadcastChannel: sync with presenter window
  useEffect(() => {
    const channel = getPresenterChannel();
    if (!channel) return;

    const msg: PresenterMessage = { type: "slide-changed", slideIndex: index, slug };
    channel.postMessage(msg);

    const handler = (e: MessageEvent<PresenterMessage>) => {
      const data = e.data;
      if (data.slug !== slug) return;
      if (data.type === "request-current") {
        channel.postMessage({ type: "slide-changed", slideIndex: index, slug } satisfies PresenterMessage);
      } else if (data.type === "navigate") {
        if (data.direction === "next") {
          setIndex((i) => {
            if (i >= total - 1) return i;
            setDirection(1);
            return i + 1;
          });
        } else {
          setIndex((i) => {
            if (i <= 0) return i;
            setDirection(-1);
            return i - 1;
          });
        }
      } else if (data.type === "goto") {
        setIndex((i) => {
          if (data.slideIndex < 0 || data.slideIndex >= total) return i;
          setDirection(data.slideIndex > i ? 1 : -1);
          return data.slideIndex;
        });
      }
    };
    channel.addEventListener("message", handler);
    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  }, [index, slug, total]);

  const goNext = useCallback(() => {
    if (stepsController.current?.tryNextStep()) return;
    setIndex((i) => {
      if (i >= total - 1) return i;
      setDirection(1);
      return i + 1;
    });
  }, [total]);

  const goPrev = useCallback(() => {
    if (stepsController.current?.tryPrevStep()) return;
    setIndex((i) => {
      if (i <= 0) return i;
      setDirection(-1);
      return i - 1;
    });
  }, []);

  const goTo = useCallback(
    (n: number) => {
      if (n < 0 || n >= total) return;
      setDirection(n > index ? 1 : -1);
      setIndex(n);
    },
    [index, total]
  );

  const toggleNotes = useCallback(() => setNotesVisible((v) => !v), []);
  const toggleMenu = useCallback(() => setMenuVisible((v) => !v), []);
  const toggleQuestions = useCallback(() => setQuestionsVisible((v) => !v), []);

  const startAudience = useCallback(() => {
    audience.start({ theme, title, currentSlide: index });
  }, [audience, theme, title, index]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const openPresenter = useCallback(() => {
    if (!slug) return;
    const url = `/${slug}/presenter`;
    window.open(url, `presenter-${slug}`, "width=1100,height=800,menubar=no,toolbar=no");
  }, [slug]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goPrev();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(total - 1);
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "n":
        case "N":
          e.preventDefault();
          toggleNotes();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMenu();
          break;
        case "Escape":
          if (questionsVisible) {
            e.preventDefault();
            setQuestionsVisible(false);
          } else if (notesVisible) {
            e.preventDefault();
            setNotesVisible(false);
          } else if (menuVisible) {
            e.preventDefault();
            setMenuVisible(false);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    goNext,
    goPrev,
    goTo,
    toggleFullscreen,
    toggleNotes,
    toggleMenu,
    total,
    notesVisible,
    menuVisible,
    questionsVisible,
  ]);

  // Touch swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - touchStartX.current;
      const dy = endY - touchStartY.current;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
    [goNext, goPrev]
  );

  const current = slides[index];
  const currentNotes = notes[index] ?? null;

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-bg text-text"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {(() => {
        // ambient kan vara true (alltid), false (aldrig) eller "a-b" (range, 1-indexerat).
        if (ambient === true) return <AmbientParticles />;
        if (typeof ambient === "string") {
          const m = ambient.match(/^(\d+)\s*-\s*(\d+)$/);
          if (m) {
            const from = parseInt(m[1], 10);
            const to = parseInt(m[2], 10);
            const currentSlide = index + 1;
            if (currentSlide >= from && currentSlide <= to) {
              return <AmbientParticles />;
            }
          }
        }
        return null;
      })()}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
            center: { opacity: 1, x: 0 },
            exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 32 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <SlideWithSteps slideKey={index} controllerRef={stepsController}>
            {current}
          </SlideWithSteps>
        </motion.div>
      </AnimatePresence>

      {/* Brand-watermark (frontmatter.brand) — alltid synlig om satt */}
      {brand && !(brand.hideOnFirst && index === 0) && (
        <BrandWatermarkBadge brand={brand} />
      )}

      {/* Diskret hint i botten - fadar bort efter några sekunder */}
      <AnimatePresence>
        {hintVisible && !menuVisible && !notesVisible && (
          <motion.div
            className="pointer-events-none fixed bottom-4 left-1/2 z-10 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.55, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-text-muted backdrop-blur-sm">
              <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0 font-mono text-[0.65rem]">
                M
              </kbd>
              <span>för meny</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotesOverlay
        visible={notesVisible}
        notes={currentNotes}
        slideNumber={index + 1}
        totalSlides={total}
        onClose={() => setNotesVisible(false)}
      />

      <MenuOverlay
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        slideMetas={slideMetas}
        notes={notes}
        totalSlides={total}
        currentIndex={index}
        totalSteps={stepsCount}
        slug={slug}
        theme={theme}
        onGoTo={goTo}
        onOpenPresenter={openPresenter}
        onToggleNotes={toggleNotes}
        onToggleFullscreen={toggleFullscreen}
        hasNotes={currentNotes != null && currentNotes !== ""}
        isFullscreenSupported={fullscreenSupported}
        audience={{
          supportsAudience: audience.supportsAudience,
          session: audience.session,
          starting: audience.starting,
          error: audience.error,
          onStart: startAudience,
          onEnd: audience.end,
        }}
        interactions={{
          canStart: Boolean(audience.session),
          activeType: interactions.active?.active ? interactions.active.type : null,
          onStartQuiz: () => setInteractionModal("quiz"),
          onStartReflection: () => setInteractionModal("reflection"),
        }}
      />

      <InteractionStartModal
        visible={interactionModal != null}
        type={interactionModal}
        starting={interactions.starting}
        error={interactions.error}
        slideIndex={index}
        onSubmit={async (payload) => {
          if (!interactionModal) return;
          const result = await interactions.start({
            type: interactionModal,
            prompt: payload.prompt,
            options: payload.options,
            slideIndex: payload.slideIndex,
          });
          if (result) setInteractionModal(null);
        }}
        onClose={() => setInteractionModal(null)}
      />

      {interactions.active?.active && (
        <InteractionPresenterPanel
          active={interactions.active}
          responses={interactions.responses}
          onEnd={interactions.end}
          onSetReveal={interactions.setReveal}
          onFeature={interactions.featureResponse}
        />
      )}

      {audience.session && (
        <QuestionButton
          count={audience.questions.length}
          unseen={audience.unseenCount}
          onClick={toggleQuestions}
        />
      )}

      <QuestionsOverlay
        visible={questionsVisible}
        questions={audience.questions}
        currentSlide={index}
        onClose={() => setQuestionsVisible(false)}
        onMarkSeen={audience.markAllSeen}
      />
    </div>
  );
}

function BrandWatermarkBadge({ brand }: { brand: BrandWatermark }) {
  const pos = brand.position ?? "bottom-left";
  const positionStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 5,
    pointerEvents: "none",
    opacity: brand.opacity ?? 0.55,
    ...(pos === "bottom-left" && { bottom: "1rem", left: "1rem" }),
    ...(pos === "bottom-right" && { bottom: "1rem", right: "1rem" }),
    ...(pos === "top-left" && { top: "1rem", left: "1rem" }),
    ...(pos === "top-right" && { top: "1rem", right: "1rem" }),
  };
  return (
    <motion.div
      style={positionStyle}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: brand.opacity ?? 0.55, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex items-center gap-2"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.logo}
        alt=""
        style={{ height: brand.size ?? "1.5rem", width: "auto" }}
      />
      {brand.tagline && (
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-text-muted">
          {brand.tagline}
        </span>
      )}
    </motion.div>
  );
}

function QuestionButton({
  count,
  unseen,
  onClick,
}: {
  count: number;
  unseen: number;
  onClick: () => void;
}) {
  const hasUnseen = unseen > 0;
  return (
    <button
      onClick={onClick}
      aria-label={`Publikfrågor (${unseen} olästa av ${count})`}
      className={`fixed bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-all ${
        hasUnseen
          ? "border-accent bg-accent/15 text-accent shadow-[0_0_22px_-6px_var(--color-accent)] animate-pulse"
          : "border-white/15 bg-black/40 text-text-muted hover:border-accent hover:text-accent"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      {hasUnseen && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] font-semibold text-bg">
          {unseen}
        </span>
      )}
    </button>
  );
}
