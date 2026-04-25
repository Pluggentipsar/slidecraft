"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PresentationMeta } from "@/lib/types";
import { getPresenterChannel, type PresenterMessage } from "@/lib/presenter-sync";

interface PresenterViewProps {
  slug: string;
  meta: PresentationMeta;
  notes: (string | null)[];
}

/**
 * Presenter mode - visas i separat fönster.
 *
 * Layout:
 * - Header: presentationstitel + tid
 * - Vänster: notes för aktuell slide (stort)
 * - Höger topp: aktuell slide (iframe/embed)
 * - Höger botten: nästa slide (mindre preview)
 * - Footer: navigation + timer + totalt antal slides
 */
export function PresenterView({ slug, meta, notes }: PresenterViewProps) {
  const totalSlides = notes.length;

  const [slideIndex, setSlideIndex] = useState(0);
  const [clockTime, setClockTime] = useState("");

  // Timer (elapsed)
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Sync med huvudfönstret via BroadcastChannel
  useEffect(() => {
    const channel = getPresenterChannel();
    if (!channel) return;

    const handler = (e: MessageEvent<PresenterMessage>) => {
      const data = e.data;
      if (data.slug !== slug) return;
      if (data.type === "slide-changed") {
        setSlideIndex(data.slideIndex);
      }
    };
    channel.addEventListener("message", handler);

    // Request current slide from main window
    channel.postMessage({ type: "request-current", slug } satisfies PresenterMessage);

    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  }, [slug]);

  // Tillåt scroll i presenter-fönstret
  useEffect(() => {
    document.body.classList.add("allow-scroll");
    return () => document.body.classList.remove("allow-scroll");
  }, []);

  // Klocka och timer
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
      );
      setElapsed(Date.now() - startTime);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const sendNav = useCallback(
    (direction: "next" | "prev") => {
      const channel = getPresenterChannel();
      if (!channel) return;
      channel.postMessage({ type: "navigate", direction, slug } satisfies PresenterMessage);
      channel.close();
    },
    [slug]
  );

  // Keyboard navigation i presenter-fönstret
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        sendNav("next");
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        sendNav("prev");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sendNav]);

  const currentNotes = notes[slideIndex] ?? null;
  const nextNotes = notes[slideIndex + 1] ?? null;
  const hasNext = slideIndex < totalSlides - 1;

  const elapsedSeconds = Math.floor(elapsed / 1000);
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const elapsedStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="presenter-view flex min-h-screen flex-col bg-bg text-text">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href={`/${slug}`}
            className="text-xs uppercase tracking-[0.25em] text-text-muted transition-colors hover:text-accent"
          >
            ← Huvudvy
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">{meta.title}</h1>
            {meta.event && (
              <p className="text-xs text-text-muted">{meta.event}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-text-muted">
          <div className="flex items-center gap-2">
            <span>Klocka</span>
            <span className="font-mono text-sm text-text tabular-nums">{clockTime}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span>Förfluten</span>
            <span className="font-mono text-sm text-accent tabular-nums">{elapsedStr}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col gap-4 p-6 lg:flex-row">
        {/* Left column: notes */}
        <section className="flex flex-1 flex-col rounded-xl border border-white/5 bg-bg-surface/40 p-6">
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" style={{ boxShadow: "0 0 8px var(--accent-glow)" }} />
              Speaker notes
            </span>
            <span className="tabular-nums">
              Slide {slideIndex + 1} / {totalSlides}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {currentNotes ? (
              <div className="text-lg leading-relaxed text-text md:text-xl">
                {currentNotes.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {para.trim()}
                  </p>
                ))}
              </div>
            ) : (
              <p className="italic text-text-muted">Inga notes för denna slide.</p>
            )}
          </div>
        </section>

        {/* Right column: next-up */}
        <aside className="flex flex-col gap-4 lg:w-[320px]">
          <div className="rounded-xl border border-white/5 bg-bg-surface/40 p-5">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-text-muted">
              <span>Nästa</span>
              {hasNext ? (
                <span className="tabular-nums">{slideIndex + 2} / {totalSlides}</span>
              ) : (
                <span className="text-accent">Sista slide</span>
              )}
            </div>
            {hasNext ? (
              <div className="text-sm leading-relaxed text-text-muted">
                {nextNotes ? (
                  <>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">
                      Notes för nästa
                    </p>
                    <p className="line-clamp-6">
                      {nextNotes.split(/\n\s*\n/)[0].trim()}
                    </p>
                  </>
                ) : (
                  <p className="italic">Inga notes.</p>
                )}
              </div>
            ) : (
              <p className="text-sm italic text-text-muted">Presentationen avslutas.</p>
            )}
          </div>

          <div className="rounded-xl border border-accent-dim bg-accent-dim/20 p-5">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">
              Kontroller
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => sendNav("prev")}
                disabled={slideIndex === 0}
                className="flex-1 rounded-md border border-white/10 py-2 text-sm transition-all hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-text"
              >
                ← Föregående
              </button>
              <button
                onClick={() => sendNav("next")}
                disabled={slideIndex >= totalSlides - 1}
                className="flex-1 rounded-md border border-accent bg-accent/10 py-2 text-sm text-accent transition-all hover:bg-accent/20 disabled:opacity-30 disabled:hover:bg-accent/10"
              >
                Nästa →
              </button>
            </div>
            <p className="mt-3 text-xs text-text-muted">
              Eller använd piltangenter. Ändringar synkas till huvudfönstret.
            </p>
          </div>
        </aside>
      </main>

    </div>
  );
}
