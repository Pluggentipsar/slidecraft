"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useInlineEdit, EditableText } from "@/lib/inline-edit";
import { useIsOverlay, useOverlayInstance } from "./SlideWithOverlays";

/**
 * FloatingImage — frittflyttande bild med drag-and-resize i edit-mode.
 *
 * I edit-mode:
 *   - Klicka på bilden → markeras med outline + 4 corner-handles + delete-knapp
 *   - Drag i mitten → flytta (uppdaterar x, y som procent av slide-bredd/höjd)
 *   - Drag i hörn → resize (uppdaterar width som px, behåller aspect ratio)
 *   - Klick utanför → avmarkera
 *
 * I presenter-läget:
 *   - Bilden renderas statiskt på sin sparade position
 *
 * MDX-format:
 * ```mdx
 * <FloatingImage
 *   src="/bilder/min-bild.png"
 *   alt="Beskrivning"
 *   x="20%"
 *   y="30%"
 *   width="280px"
 *   rotation={-3}
 *   background="https://cdn.midjourney.com/..."
 * />
 * ```
 */

interface FloatingImageProps {
  /** Bildens URL — lokalt path eller extern URL. */
  src: string;
  /** Alt-text för tillgänglighet. */
  alt?: string;
  /** Horisontell position som procent av slide-bredd ("0%"-"100%") eller px. */
  x?: string;
  /** Vertikal position som procent av slide-höjd ("0%"-"100%") eller px. */
  y?: string;
  /** Bredd i px eller procent. Höjd beräknas automatiskt från aspect ratio. */
  width?: string;
  /** Höjd (valfri — om angiven brytss aspect ratio). */
  height?: string;
  /** Rotation i grader. Default 0. */
  rotation?: number;
  /** Opacitet 0-1. Default 1. */
  opacity?: number;
  /** Z-index. Default 10. */
  zIndex?: number;
  /**
   * Layer:
   * - "front" (default) — bilden ligger över template-content (zIndex 10)
   * - "back" — bilden ligger UNDER template-content men över bakgrunden (zIndex 1)
   *
   * "back" är användbart för dekorativa bilder du vill ha bakom rubriken/staplar.
   */
  layer?: "front" | "back";
  /** Slide-bakgrund — lägg samma som föregående slide för "overlay"-känsla. */
  background?: string;
  /** Mörk overlay på bakgrunden (0-1). Default 0. */
  overlay?: number;
  /** Liten chapter-tagg uppe till höger. */
  chapter?: string;
  /** Accentfärg. */
  accent?: string;
  /** Stäng av drop-shadow. Bra för transparenta bilder där skuggan annars syns runt kanten. */
  noShadow?: boolean;
}

function resolveBackground(bg: string | undefined, overlay: number): string {
  if (!bg) return "transparent";
  if (bg.startsWith("/") || bg.startsWith("http")) {
    if (overlay > 0) {
      return `linear-gradient(rgba(10,9,8,${overlay}), rgba(10,9,8,${Math.min(1, overlay + 0.06)})), url('${bg}') center/cover no-repeat`;
    }
    return `url('${bg}') center/cover no-repeat`;
  }
  return bg;
}

export function FloatingImage({
  src,
  alt = "",
  x = "20%",
  y = "20%",
  width = "14%",
  height,
  rotation = 0,
  opacity = 1,
  zIndex,
  layer = "front",
  background,
  overlay = 0,
  chapter,
  accent = "#EC7E26",
  noShadow = false,
}: FloatingImageProps) {
  // Layer styr default-zIndex om inget explicit värde angivits.
  const effectiveZIndex = zIndex ?? (layer === "back" ? 1 : 10);
  const { editMode, updateProp: parentUpdateProp } = useInlineEdit();
  const isOverlay = useIsOverlay();
  const overlayInstance = useOverlayInstance();
  // När vi är overlay, använd OverlayInstanceContext för uppdateringar
  // — annars uppdaterar vi parent slidens props (vilket är fel).
  const updateProp = isOverlay && overlayInstance.onUpdateProp
    ? overlayInstance.onUpdateProp
    : parentUpdateProp;
  const onDelete = overlayInstance.onDelete;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  // Klicka utanför för att avmarkera
  useEffect(() => {
    if (!selected || !editMode) return;
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setSelected(false);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [selected, editMode]);

  // Drag start — flyttar bilden
  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      setSelected(true);

      const wrapper = wrapperRef.current;
      // Standalone: slideContainerRef pekar på vår egen wrapper-div.
      // Overlay: använd offsetParent (som är SlideWithOverlays-containern).
      const slideEl = isOverlay
        ? (wrapper?.offsetParent as HTMLElement | null)
        : slideContainerRef.current;
      if (!wrapper || !slideEl) return;

      // OBS: getBoundingClientRect ger SCALED storlek (om preview-containern
      // har transform: scale). offsetWidth/Left är UNSCALED. Vi använder
      // procent-baserad delta-beräkning som funkar i båda fall — eftersom
      // mouse-delta och slideRect båda är i scaled (skärm)koordinater.
      const slideRect = slideEl.getBoundingClientRect();
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      // Parsea nuvarande position från props (default 20%)
      const startLeftPct = parseFloat(x) || 0;
      const startTopPct = parseFloat(y) || 0;

      const DRAG_THRESHOLD = 4; // px innan vi börjar registrera drag
      let hasDragged = false;

      const onMove = (mv: PointerEvent) => {
        const dxPx = mv.clientX - startMouseX;
        const dyPx = mv.clientY - startMouseY;
        if (!hasDragged) {
          if (Math.abs(dxPx) < DRAG_THRESHOLD && Math.abs(dyPx) < DRAG_THRESHOLD) {
            return;
          }
          hasDragged = true;
          setDragging(true);
        }
        // Konvertera pixel-delta → procent (samma rymd som slideRect)
        const dxPct = (dxPx / slideRect.width) * 100;
        const dyPct = (dyPx / slideRect.height) * 100;
        // Clamp så bilden inte försvinner utanför sliden
        const newLeftPct = Math.max(-10, Math.min(110, startLeftPct + dxPct));
        const newTopPct = Math.max(-10, Math.min(110, startTopPct + dyPct));
        wrapper.style.left = `${newLeftPct}%`;
        wrapper.style.top = `${newTopPct}%`;
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!hasDragged) {
          // Bara klick — markera men spara inget nytt
          setDragging(false);
          return;
        }
        // Spara final position från CSS-värden vi just satte
        const finalLeft = parseFloat(wrapper.style.left);
        const finalTop = parseFloat(wrapper.style.top);
        const xPct = Math.max(-10, Math.min(110, finalLeft)).toFixed(1);
        const yPct = Math.max(-10, Math.min(110, finalTop)).toFixed(1);
        updateProp("x", `${xPct}%`);
        updateProp("y", `${yPct}%`);
        setDragging(false);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [editMode, updateProp, isOverlay, x, y],
  );

  // Resize start — ändrar bredd
  const startResize = useCallback(
    (e: React.PointerEvent, corner: "tl" | "tr" | "bl" | "br") => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      setSelected(true);

      const wrapper = wrapperRef.current;
      const slideEl = isOverlay
        ? (wrapper?.offsetParent as HTMLElement | null)
        : slideContainerRef.current;
      if (!wrapper || !slideEl) return;

      // Beräkna scale-faktor (om preview är skalad via transform)
      const slideRect = slideEl.getBoundingClientRect();
      const scale = slideRect.width / slideEl.offsetWidth || 1;
      const slideUnscaledWidth = slideEl.offsetWidth;

      const startWidth = wrapper.offsetWidth; // unscaled px
      const startMouseX = e.clientX;
      // Vid vänsterhörn ska vi resize:a "inåt" (motsatt riktning)
      const xDir = corner === "tl" || corner === "bl" ? -1 : 1;

      const RESIZE_THRESHOLD = 4;
      let hasResized = false;

      const onMove = (mv: PointerEvent) => {
        const dxPx = (mv.clientX - startMouseX) * xDir;
        if (!hasResized) {
          if (Math.abs(dxPx) < RESIZE_THRESHOLD) return;
          hasResized = true;
          setResizing(true);
        }
        // Normalisera pixel-delta från skärm-rymd till slide-rymd
        const dxNormalized = dxPx / scale;
        const newWidth = Math.max(40, startWidth + dxNormalized);
        wrapper.style.width = `${newWidth}px`;
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!hasResized) {
          setResizing(false);
          return;
        }
        // Spara som % av slide-canvas så storleken matchar mellan editor
        // (1920-canvas) och presenter (100vw). Annars renderar t.ex. "260px"
        // olika på olika skärmar relativt övriga element som använder vw/clamp.
        const finalWidth = wrapper.offsetWidth;
        const widthPct = (finalWidth / slideUnscaledWidth) * 100;
        updateProp("width", `${widthPct.toFixed(1)}%`);
        setResizing(false);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [editMode, updateProp, isOverlay],
  );

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width,
    height: height || "auto",
    transform: `rotate(${rotation}deg)`,
    opacity,
    // I edit-mode tvinar vi hög zIndex så bilden är klickbar även när
    // layer="back" (annars ligger den under template-content och kan inte
    // markeras). Visuellt "lyfts" back-bilder fram i edit-mode — användaren
    // ser layer-status via toggle-knappen och kan växla till presenter-vyn
    // för att se faktisk rendering.
    zIndex: editMode ? 50 : effectiveZIndex,
    cursor: editMode ? (dragging ? "grabbing" : "grab") : "default",
    transition: dragging || resizing ? "none" : "outline 200ms ease",
    outline: editMode && selected ? `2px solid ${accent}` : editMode ? "1px dashed rgba(247,241,230,0.25)" : "none",
    outlineOffset: "4px",
    userSelect: "none",
    touchAction: "none",
  };

  // Själva bild-elementet + handles (samma i båda modes)
  const imageElement = (
    <div
      ref={wrapperRef}
      onPointerDown={startDrag}
      style={wrapperStyle}
    >
      {/* Bilden själv */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          display: "block",
          width: "100%",
          height: height ? "100%" : "auto",
          objectFit: "cover",
          pointerEvents: "none",
          boxShadow:
            noShadow || (editMode && selected)
              ? "none"
              : "0 8px 30px rgba(0,0,0,0.35)",
          borderRadius: noShadow ? 0 : "0.2rem",
        }}
      />

      {/* Resize-handles + actions (bara i edit-mode + selected) */}
      {editMode && selected ? (
        <>
          <ResizeHandle corner="tl" onStart={startResize} accent={accent} />
          <ResizeHandle corner="tr" onStart={startResize} accent={accent} />
          <ResizeHandle corner="bl" onStart={startResize} accent={accent} />
          <ResizeHandle corner="br" onStart={startResize} accent={accent} />
        </>
      ) : null}
    </div>
  );

  // Edit-mode action-bar (delete + shadow toggle + info)
  const actionBar = editMode && selected ? (
    <div
      style={{
        position: "absolute",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        zIndex: 100,
      }}
    >
      {/* Layer-toggle: framför / bakom innehållet */}
      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          // Vid layer-byte: rensa även eventuellt explicit zIndex så
          // default-zIndex tar över för det nya laget.
          updateProp("layer", layer === "back" ? "" : "back");
          updateProp("zIndex", "");
        }}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: layer === "back" ? "#0a0908" : "var(--text)",
          background: layer === "back" ? accent : "rgba(10,9,8,0.85)",
          border: `1px solid ${accent}`,
          padding: "0.35rem 0.7rem",
          borderRadius: "0.3rem",
          cursor: "pointer",
          fontWeight: 700,
        }}
        title={
          layer === "back"
            ? "Bilden ligger BAKOM innehållet — klicka för att flytta fram"
            : "Bilden ligger FRAMFÖR innehållet — klicka för att flytta bakom"
        }
      >
        {layer === "back" ? "▢ Bakom" : "▣ Framför"}
      </button>

      {/* Skugga-toggle */}
      <button
        onPointerDown={(e) => {
          e.stopPropagation();
          updateProp("noShadow", noShadow ? "" : "true");
        }}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: noShadow ? "#0a0908" : "var(--text)",
          background: noShadow ? accent : "rgba(10,9,8,0.85)",
          border: `1px solid ${accent}`,
          padding: "0.35rem 0.7rem",
          borderRadius: "0.3rem",
          cursor: "pointer",
          fontWeight: 700,
        }}
        title="Stäng av skugga (bra för transparenta bilder)"
      >
        {noShadow ? "● No-shadow" : "Skugga"}
      </button>

      {/* Info-tagg */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "color-mix(in srgb, var(--text) 70%, transparent)",
          background: "rgba(10,9,8,0.85)",
          border: "1px solid rgba(247,241,230,0.2)",
          padding: "0.35rem 0.7rem",
          borderRadius: "0.3rem",
          pointerEvents: "none",
        }}
      >
        {x} · {y} · {width}
      </div>

      {/* Delete-knapp */}
      {onDelete ? (
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            if (confirm("Ta bort bilden från sliden?")) {
              onDelete();
            }
          }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text)",
            background: "rgba(232,77,77,0.85)",
            border: "1px solid rgba(232,77,77,1)",
            padding: "0.35rem 0.7rem",
            borderRadius: "0.3rem",
            cursor: "pointer",
            fontWeight: 700,
          }}
          title="Ta bort bilden från sliden"
        >
          × Ta bort
        </button>
      ) : null}
    </div>
  ) : null;

  // OVERLAY-MODE: bara bilden + handles, ingen slide-container.
  // Föräldern (SlideWithOverlays) har redan position:relative.
  if (isOverlay) {
    return (
      <>
        {imageElement}
        {actionBar}
      </>
    );
  }

  // STANDALONE-MODE: full slide-canvas med bakgrund + chapter-tagg.
  return (
    <div
      ref={slideContainerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: resolveBackground(background, overlay) }}
    >
      {/* Chapter — uppe till höger */}
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

      {imageElement}
      {actionBar}
    </div>
  );
}

// ============================================================================
// Resize-handle (en av fyra hörn)
// ============================================================================

function ResizeHandle({
  corner,
  onStart,
  accent,
}: {
  corner: "tl" | "tr" | "bl" | "br";
  onStart: (e: React.PointerEvent, corner: "tl" | "tr" | "bl" | "br") => void;
  accent: string;
}) {
  const positions: Record<string, CSSProperties> = {
    tl: { top: "-7px", left: "-7px", cursor: "nwse-resize" },
    tr: { top: "-7px", right: "-7px", cursor: "nesw-resize" },
    bl: { bottom: "-7px", left: "-7px", cursor: "nesw-resize" },
    br: { bottom: "-7px", right: "-7px", cursor: "nwse-resize" },
  };

  return (
    <div
      onPointerDown={(e) => onStart(e, corner)}
      style={{
        position: "absolute",
        width: "14px",
        height: "14px",
        background: accent,
        border: "2px solid #F7F1E6",
        borderRadius: "50%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        zIndex: 50,
        ...positions[corner],
      }}
    />
  );
}
