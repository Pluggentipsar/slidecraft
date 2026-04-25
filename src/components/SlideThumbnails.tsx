"use client";

import type { SlideMeta } from "@/lib/extract-slide-types";

interface SlideThumbnailsProps {
  slideMetas: SlideMeta[];
  totalSlides: number;
  notes: (string | null)[];
  currentIndex: number;
  onGoTo: (index: number) => void;
}

/**
 * Grid med miniatyrer över alla slides.
 *
 * Vi använder slideMetas som extraherats från MDX-källkoden på server-sidan,
 * eftersom slide.type på klienten är en opaque RSC-reference utan displayName.
 */
export function SlideThumbnails({
  slideMetas,
  totalSlides,
  notes,
  currentIndex,
  onGoTo,
}: SlideThumbnailsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: totalSlides }).map((_, i) => {
        const isActive = i === currentIndex;
        const hasNotes = notes[i] != null && notes[i] !== "";
        const meta = slideMetas[i] ?? { templateName: "Slide" };

        return (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`group relative flex aspect-[16/9] flex-col justify-between overflow-hidden rounded-lg border p-3 text-left transition-all ${
              isActive
                ? "border-accent bg-accent-dim"
                : "border-white/10 bg-bg-surface/60 hover:border-white/30 hover:bg-bg-surface"
            }`}
            style={isActive ? { boxShadow: "0 0 24px var(--accent-dim)" } : undefined}
            aria-label={`Gå till slide ${i + 1}${meta.primaryText ? ": " + meta.primaryText : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`font-mono text-xs tabular-nums ${
                  isActive ? "text-accent" : "text-text-muted"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="rounded-sm border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-text-muted"
                title={meta.templateName}
              >
                {shortTemplateName(meta.templateName)}
              </span>
            </div>

            <div className="flex-1 overflow-hidden py-2">
              {meta.primaryText && (
                <div
                  className="line-clamp-2 text-sm font-medium leading-tight text-text"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {meta.primaryText}
                </div>
              )}
              {meta.secondaryText && (
                <div className="mt-1 line-clamp-2 text-xs text-text-muted">
                  {meta.secondaryText}
                </div>
              )}
              {!meta.primaryText && !meta.secondaryText && (
                <div className="text-xs italic text-text-muted">(inget synligt innehåll)</div>
              )}
            </div>

            {hasNotes && (
              <div className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-wider text-text-muted">
                <span className="h-1 w-1 rounded-full bg-accent" />
                Notes
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function shortTemplateName(name: string): string {
  const map: Record<string, string> = {
    TitleSlide: "TITLE",
    SectionDivider: "DIVIDER",
    GiantText: "GIANT",
    GiantScroll: "SCROLL",
    Quote: "QUOTE",
    PictureQuote: "P-QUOTE",
    ImageText: "IMG+TXT",
    HeroImage: "HERO",
    LayeredText: "LAYERED",
    ImageBleed: "BLEED",
    Collage: "COLLAGE",
    BulletBuild: "BULLETS",
    SideScrollList: "SIDESCRL",
    NumberedReveal: "NUMBERS",
    Timeline: "TIMELINE",
    Reflection: "REFLECT",
    Comparison: "COMPARE",
    StatCounter: "STAT",
    CodeReveal: "CODE",
    PromptAnimation: "PROMPT",
    VideoEmbed: "VIDEO",
    VideoBackground: "VIDEO-BG",
    SlideshowMorph: "MORPH",
    ParticleField: "PARTICLE",
    LoadingSlide: "LOADING",
    PollQuestion: "POLL",
    Callout: "CALLOUT",
  };
  return map[name] ?? name.toUpperCase().slice(0, 8);
}
