"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { SlideThumbnails } from "./SlideThumbnails";
import { AudiencePanel } from "./AudiencePanel";
import { SharePresentationPanel } from "./SharePresentationPanel";
import type { SlideMeta } from "@/lib/extract-slide-types";
import type { AudienceSession } from "@/lib/audience-session";

interface MenuOverlayProps {
  visible: boolean;
  onClose: () => void;
  slideMetas: SlideMeta[];
  notes: (string | null)[];
  totalSlides: number;
  currentIndex: number;
  totalSteps: number;
  slug: string;
  theme: string;
  onGoTo: (index: number) => void;
  onOpenPresenter: () => void;
  onToggleNotes: () => void;
  onToggleFullscreen: () => void;
  hasNotes: boolean;
  isFullscreenSupported: boolean;
  audience?: {
    supportsAudience: boolean;
    session: AudienceSession | null;
    starting: boolean;
    error: string | null;
    onStart: () => void;
    onEnd: () => void;
  };
  interactions?: {
    canStart: boolean;
    activeType: "quiz" | "reflection" | null;
    onStartQuiz: () => void;
    onStartReflection: () => void;
  };
}

export function MenuOverlay({
  visible,
  onClose,
  slideMetas,
  notes,
  totalSlides,
  currentIndex,
  totalSteps,
  slug,
  theme,
  onGoTo,
  onOpenPresenter,
  onToggleNotes,
  onToggleFullscreen,
  hasNotes,
  isFullscreenSupported,
  audience,
  interactions,
}: MenuOverlayProps) {
  const handleGoTo = (i: number) => {
    onGoTo(i);
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-40 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" aria-hidden />

          <motion.div
            className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-8 p-8 md:p-12"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-accent">Meny</div>
                <div className="mt-1 text-sm text-text-muted">
                  Slide {currentIndex + 1} av {totalSlides}
                  {totalSteps > 0 && (
                    <span className="ml-2">· aktuell slide har {totalSteps} steg</span>
                  )}
                  <span className="ml-2">· tema: {theme}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-text-muted transition-all hover:border-accent hover:text-accent"
              >
                Stäng · M
              </button>
            </div>

            <section>
              <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-text-muted">Verktyg</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MenuAction
                  icon={<IconPresenter />}
                  label="Presenter mode"
                  hint="Öppnar i nytt fönster"
                  onClick={() => {
                    onOpenPresenter();
                    onClose();
                  }}
                />
                <MenuAction
                  icon={<IconNotes />}
                  label="Speaker notes"
                  hint={hasNotes ? "Tryck N" : "Inga notes på denna slide"}
                  onClick={() => {
                    onToggleNotes();
                    onClose();
                  }}
                  disabled={!hasNotes}
                />
                <MenuAction
                  icon={<IconFullscreen />}
                  label="Fullscreen"
                  hint="Tryck F"
                  onClick={() => {
                    onToggleFullscreen();
                    onClose();
                  }}
                  disabled={!isFullscreenSupported}
                />
                <MenuActionLink
                  href={`/${slug}/edit`}
                  icon={<IconEdit />}
                  label="Redigera"
                  hint="Öppnar redigeringsvy"
                />
              </div>
            </section>

            {audience && (
              <AudiencePanel
                supportsAudience={audience.supportsAudience}
                session={audience.session}
                starting={audience.starting}
                error={audience.error}
                onStart={audience.onStart}
                onEnd={audience.onEnd}
              />
            )}

            {interactions && (
              <section>
                <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-text-muted">
                  Interaktivitet
                </h2>
                {!interactions.canStart ? (
                  <div className="rounded-lg border border-white/10 bg-bg-surface/40 p-4 text-sm text-text-muted">
                    Starta publikläget först — quiz och reflektioner går via
                    samma session.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <InteractionStartButton
                      label="Starta quiz"
                      hint="Flervalsfråga, live-resultat"
                      icon={<IconQuiz />}
                      disabled={interactions.activeType === "quiz"}
                      running={interactions.activeType === "quiz"}
                      onClick={() => {
                        interactions.onStartQuiz();
                        onClose();
                      }}
                    />
                    <InteractionStartButton
                      label="Starta reflektion"
                      hint="Öppen fråga, fri text"
                      icon={<IconReflection />}
                      disabled={interactions.activeType === "reflection"}
                      running={interactions.activeType === "reflection"}
                      onClick={() => {
                        interactions.onStartReflection();
                        onClose();
                      }}
                    />
                  </div>
                )}
              </section>
            )}

            <SharePresentationPanel slug={slug} />

            <section className="flex-1">
              <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-text-muted">Navigation</h2>
              <SlideThumbnails
                slideMetas={slideMetas}
                totalSlides={totalSlides}
                notes={notes}
                currentIndex={currentIndex}
                onGoTo={handleGoTo}
              />
            </section>

            <section>
              <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-text-muted">Kortkommandon</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-text-muted md:grid-cols-3">
                <Shortcut keys="→ Space" label="Nästa steg/slide" />
                <Shortcut keys="←" label="Föregående" />
                <Shortcut keys="Home End" label="Första/sista" />
                <Shortcut keys="F" label="Fullscreen" />
                <Shortcut keys="N" label="Speaker notes" />
                <Shortcut keys="M" label="Denna meny" />
              </div>
            </section>

            <div className="border-t border-white/5 pt-6">
              <Link
                href="/"
                className="text-xs uppercase tracking-[0.3em] text-text-muted transition-colors hover:text-accent"
              >
                ← Alla presentationer
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuAction({
  icon,
  label,
  hint,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col items-start gap-2 rounded-lg border border-white/10 bg-bg-surface/40 p-4 text-left transition-all hover:border-accent hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-bg-surface/40"
    >
      <div className="text-text-muted transition-colors group-hover:text-accent group-disabled:group-hover:text-text-muted">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-text">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-text-muted">{hint}</div>}
      </div>
    </button>
  );
}

function MenuActionLink({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-start gap-2 rounded-lg border border-white/10 bg-bg-surface/40 p-4 text-left transition-all hover:border-accent hover:bg-bg-surface"
    >
      <div className="text-text-muted transition-colors group-hover:text-accent">{icon}</div>
      <div>
        <div className="text-sm font-medium text-text">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-text-muted">{hint}</div>}
      </div>
    </Link>
  );
}

function InteractionStartButton({
  label,
  hint,
  icon,
  disabled,
  running,
  onClick,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  disabled: boolean;
  running: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all ${
        running
          ? "border-accent bg-accent/10"
          : "border-white/10 bg-bg-surface/40 hover:border-accent hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      }`}
    >
      <div className={running ? "text-accent" : "text-text-muted transition-colors group-hover:text-accent"}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-text">
          {running ? `${label} pågår` : label}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">{hint}</div>
      </div>
    </button>
  );
}

function IconQuiz() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function IconReflection() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="13" y2="14" />
    </svg>
  );
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-xs text-text">
        {keys}
      </span>
      <span>{label}</span>
    </div>
  );
}

function IconPresenter() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconNotes() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function IconFullscreen() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
