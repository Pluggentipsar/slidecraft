"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ParsedComponent } from "@/lib/mdx-parser";
import { getTheme, themeToCssVars } from "@/themes";
import { SlideRenderer } from "./SlideRenderer";

interface EditorPreviewProps {
  slide: ParsedComponent | undefined;
  slideIndex: number;
  total: number;
  theme?: string;
  /** Inline-edit-mode på/av. */
  editMode?: boolean;
  /** Toggle inline-edit. */
  onToggleEditMode?: () => void;
  /** Uppdatera en prop på aktiv slide. */
  onUpdateProp?: (propName: string, value: string) => void;
  /** Uppdatera markdown-children på aktiv slide. */
  onUpdateContent?: (content: string) => void;
  /** Uppdatera en prop på en av aktiv slides overlays. */
  onUpdateOverlayProp?: (overlayIndex: number, propName: string, value: string) => void;
  /** Ta bort en overlay från aktiv slide. */
  onDeleteOverlay?: (overlayIndex: number) => void;
}

// Designstorlek som presentation-views är byggda för.
const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

type ZoomMode = "fit" | number;

/**
 * Live-preview som renderar aktuell slide direkt i React.
 *
 * Storlekssättning:
 *  - "fit" (default): största 16:9-rektangeln som får plats,
 *    1920×1080 skalas till containerns bredd.
 *  - Number (0.5–3): manuell zoom, multiplicerar fit-scalen.
 *    Containern får overflow:auto så man kan scrolla vid > 1×.
 */
export function EditorPreview({
  slide,
  slideIndex,
  total,
  theme,
  editMode = false,
  onToggleEditMode,
  onUpdateProp,
  onUpdateContent,
  onUpdateOverlayProp,
  onDeleteOverlay,
}: EditorPreviewProps) {
  const themeTokens = getTheme(theme);
  const cssVars = themeToCssVars(themeTokens);

  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState<ZoomMode>("fit");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      // Största skalan där hela 1920×1080 får plats i containern
      const s = Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT);
      setFitScale(s);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const effectiveScale = zoom === "fit" ? fitScale : fitScale * zoom;
  const displayPct = Math.round(effectiveScale * 100);

  // När zoom > fit: containern scrollar. När zoom = fit: centrera med flex.
  const isOverflow = zoom !== "fit" && zoom > 1;

  return (
    <div className="flex h-full flex-col bg-black">
      <div
        ref={containerRef}
        className={`relative flex-1 bg-black ${
          isOverflow ? "overflow-auto" : "flex items-center justify-center overflow-hidden"
        }`}
      >
        {slide && (
          <div
            className="presentation-root shrink-0 bg-bg"
            data-ornament={themeTokens.ornamentStyle}
            data-theme={theme ?? "default"}
            style={{
              width: DESIGN_WIDTH,
              height: DESIGN_HEIGHT,
              transform: `scale(${effectiveScale})`,
              transformOrigin: isOverflow ? "top left" : "center center",
              // Vid overflow: reservera utrymme så scroll-barer hittar rätt
              marginBottom: isOverflow
                ? `${-(DESIGN_HEIGHT * (1 - effectiveScale))}px`
                : undefined,
              marginRight: isOverflow
                ? `${-(DESIGN_WIDTH * (1 - effectiveScale))}px`
                : undefined,
              ...(cssVars as CSSProperties),
            }}
          >
            <div className="absolute inset-0">
              <SlideRenderer
                slide={slide}
                slideKey={`${slideIndex}-${slide.tag}`}
                editMode={editMode}
                onUpdateProp={onUpdateProp}
                onUpdateContent={onUpdateContent}
                onUpdateOverlayProp={onUpdateOverlayProp}
                onDeleteOverlay={onDeleteOverlay}
              />
            </div>
          </div>
        )}
      </div>

      {/* Zoom-kontroller nederst */}
      <div className="flex items-center justify-between border-t border-white/5 bg-bg-surface/30 px-3 py-1">
        <span className="text-[0.65rem] uppercase tracking-wider text-text-muted/60">
          Live · {slideIndex + 1}/{total}
        </span>
        <div className="flex items-center gap-1">
          <ZoomButton
            onClick={() =>
              setZoom((z) => {
                const base = z === "fit" ? 1 : z;
                return Math.max(0.5, Math.round((base - 0.1) * 10) / 10);
              })
            }
            title="Mindre"
          >
            −
          </ZoomButton>
          <button
            onClick={() => setZoom("fit")}
            className={`min-w-[3.5rem] rounded px-2 py-0.5 text-[0.7rem] font-mono tabular-nums transition-all ${
              zoom === "fit"
                ? "bg-accent/20 text-accent"
                : "text-text-muted hover:text-text"
            }`}
            title="Anpassa till fönster"
          >
            {zoom === "fit" ? `fit ${displayPct}%` : `${displayPct}%`}
          </button>
          <ZoomButton
            onClick={() =>
              setZoom((z) => {
                const base = z === "fit" ? 1 : z;
                return Math.min(3, Math.round((base + 0.1) * 10) / 10);
              })
            }
            title="Större"
          >
            +
          </ZoomButton>
          <button
            onClick={() => setZoom(1)}
            className="ml-1 rounded border border-white/10 px-1.5 py-0.5 text-[0.65rem] text-text-muted transition-all hover:border-accent hover:text-accent"
            title="Återställ till 100 %"
          >
            1:1
          </button>
        </div>
      </div>
    </div>
  );
}

function ZoomButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-6 w-6 items-center justify-center rounded border border-white/10 text-sm text-text-muted transition-all hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}
