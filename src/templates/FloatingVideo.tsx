"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useInlineEdit, EditableText } from "@/lib/inline-edit";
import { useIsOverlay, useOverlayInstance } from "./SlideWithOverlays";

/**
 * FloatingVideo — frittflyttande video med drag-and-resize i edit-mode.
 *
 * Speglar FloatingImage exakt vad gäller drag/resize/positionering. Skillnad:
 * renderar `<video>` för lokala MP4/WEBM/MOV-filer och direkt-URL:er, samt
 * `<iframe>` för YouTube- och Vimeo-URL:er.
 *
 * I edit-mode:
 *   - Klicka → markeras (outline + corner-handles + delete-knapp)
 *   - Drag i mitten → flytta (uppdaterar x, y som procent)
 *   - Drag i hörn → resize (uppdaterar width som px)
 *   - Video-controls är inaktiverade så drag inte krockar med play/paus
 *
 * I presenter-läget:
 *   - Video autoplayar muted+loopad (typiskt användningsfall för filmklipp)
 *   - Controls visas vid behov (om showControls=true)
 *
 * MDX-format:
 * ```mdx
 * <FloatingVideo
 *   src="/videos/min-video.mp4"
 *   x="20%" y="30%" width="380px"
 *   rotation={-2}
 * />
 *
 * <FloatingVideo
 *   src="https://youtu.be/dQw4w9WgXcQ"
 *   x="50%" y="40%" width="480px"
 * />
 * ```
 */

interface FloatingVideoProps {
  /** Video-URL — lokalt path (.mp4/.webm/.mov), direkt URL, eller YouTube/Vimeo-URL. */
  src: string;
  /** Horisontell position som procent eller px. */
  x?: string;
  /** Vertikal position som procent eller px. */
  y?: string;
  /** Bredd i px eller procent. */
  width?: string;
  /** Höjd (valfri — bryter aspect ratio om angiven). */
  height?: string;
  /** Rotation i grader. Default 0. */
  rotation?: number;
  /** Opacitet 0-1. Default 1. */
  opacity?: number;
  /** Z-index. Default 10. */
  zIndex?: number;
  /**
   * Layer:
   * - "front" (default) — videon ligger över template-content (zIndex 10)
   * - "back" — videon ligger UNDER template-content men över bakgrunden (zIndex 1)
   */
  layer?: "front" | "back";
  /** Slide-bakgrund vid standalone-läge. */
  background?: string;
  /** Mörk overlay på bakgrunden (0-1). Default 0. */
  overlay?: number;
  /** Liten chapter-tagg uppe till höger. */
  chapter?: string;
  /** Accentfärg. */
  accent?: string;
  /** Stäng av drop-shadow. */
  noShadow?: boolean;
  /** Visa native player-controls i presenter-läget. Default true. */
  showControls?: boolean;
  /** Autoplay i presenter-läget. Default true. */
  autoplay?: boolean;
  /** Loopa video i presenter-läget. Default true. */
  loop?: boolean;
  /** Mute (krävs för autoplay i de flesta browsers). Default true. */
  muted?: boolean;
  /** Poster-bild (visas innan video laddat). */
  poster?: string;
}

interface EmbedInfo {
  kind: "video" | "iframe";
  /** URL för rendering (kan vara ombyggd för YouTube/Vimeo embeds). */
  src: string;
}

/**
 * Detektera om src är YouTube/Vimeo och bygg embed-URL.
 * Returnerar `{ kind: "video", src }` för allt annat (lokala filer, direkt-URL:er).
 */
function resolveEmbed(
  src: string,
  { autoplay, loop, muted }: { autoplay: boolean; loop: boolean; muted: boolean },
): EmbedInfo {
  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/.exec(src);
  if (ytMatch) {
    const id = ytMatch[1];
    const params = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      controls: "1",
      modestbranding: "1",
      rel: "0",
    });
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", id); // krävs för loop på single video
    }
    return { kind: "iframe", src: `https://www.youtube.com/embed/${id}?${params.toString()}` };
  }
  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = /vimeo\.com\/(?:video\/)?(\d+)/.exec(src);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    const params = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      muted: muted ? "1" : "0",
      loop: loop ? "1" : "0",
    });
    return { kind: "iframe", src: `https://player.vimeo.com/video/${id}?${params.toString()}` };
  }
  return { kind: "video", src };
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

export function FloatingVideo({
  src,
  x = "20%",
  y = "20%",
  width = "20%",
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
  showControls = true,
  autoplay = true,
  loop = true,
  muted = true,
  poster,
}: FloatingVideoProps) {
  const { editMode, updateProp: parentUpdateProp } = useInlineEdit();
  const isOverlay = useIsOverlay();
  const overlayInstance = useOverlayInstance();
  const updateProp =
    isOverlay && overlayInstance.onUpdateProp
      ? overlayInstance.onUpdateProp
      : parentUpdateProp;
  const onDelete = overlayInstance.onDelete;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  // Layer styr default-zIndex om inget explicit värde angivits
  const effectiveZIndex = zIndex ?? (layer === "back" ? 1 : 10);

  const embed = useMemo(
    () => resolveEmbed(src, { autoplay, loop, muted }),
    [src, autoplay, loop, muted],
  );

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

  // Drag start — flyttar videon
  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      setSelected(true);

      const wrapper = wrapperRef.current;
      const slideEl = isOverlay
        ? (wrapper?.offsetParent as HTMLElement | null)
        : slideContainerRef.current;
      if (!wrapper || !slideEl) return;

      const slideRect = slideEl.getBoundingClientRect();
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startLeftPct = parseFloat(x) || 0;
      const startTopPct = parseFloat(y) || 0;

      const DRAG_THRESHOLD = 4;
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
        const dxPct = (dxPx / slideRect.width) * 100;
        const dyPct = (dyPx / slideRect.height) * 100;
        const newLeftPct = Math.max(-10, Math.min(110, startLeftPct + dxPct));
        const newTopPct = Math.max(-10, Math.min(110, startTopPct + dyPct));
        wrapper.style.left = `${newLeftPct}%`;
        wrapper.style.top = `${newTopPct}%`;
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!hasDragged) {
          setDragging(false);
          return;
        }
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

      const slideRect = slideEl.getBoundingClientRect();
      const scale = slideRect.width / slideEl.offsetWidth || 1;
      const slideUnscaledWidth = slideEl.offsetWidth;

      const startWidth = wrapper.offsetWidth;
      const startMouseX = e.clientX;
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
        const dxNormalized = dxPx / scale;
        const newWidth = Math.max(80, startWidth + dxNormalized);
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
        // (1920-canvas) och presenter (100vw). Annars renderar t.ex. "380px"
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
    // I edit-mode tvinar vi hög zIndex så videon är klickbar även när
    // layer="back". Se FloatingImage för full förklaring.
    zIndex: editMode ? 50 : effectiveZIndex,
    cursor: editMode ? (dragging ? "grabbing" : "grab") : "default",
    transition: dragging || resizing ? "none" : "outline 200ms ease",
    outline: editMode && selected ? `2px solid ${accent}` : editMode ? "1px dashed rgba(247,241,230,0.25)" : "none",
    outlineOffset: "4px",
    userSelect: "none",
    touchAction: "none",
  };

  // I edit-mode: pointer-events:none så drag fungerar utan att krocka med
  // video-controls eller iframe-interaktion.
  // I presenter-läget: pointer-events:auto så användaren kan klicka på controls.
  const innerPointerEvents: CSSProperties["pointerEvents"] = editMode ? "none" : "auto";

  const innerCommon: CSSProperties = {
    display: "block",
    width: "100%",
    height: height ? "100%" : "auto",
    pointerEvents: innerPointerEvents,
    boxShadow:
      noShadow || (editMode && selected)
        ? "none"
        : "0 8px 30px rgba(0,0,0,0.35)",
    borderRadius: noShadow ? 0 : "0.2rem",
  };

  const mediaElement =
    embed.kind === "iframe" ? (
      <iframe
        src={embed.src}
        title="Inbäddad video"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        style={{
          ...innerCommon,
          aspectRatio: height ? undefined : "16 / 9",
          border: "none",
          objectFit: "cover",
        }}
      />
    ) : (
      <video
        src={embed.src}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        controls={!editMode && showControls}
        playsInline
        poster={poster}
        style={{
          ...innerCommon,
          objectFit: "cover",
        }}
      />
    );

  const videoElement = (
    <div ref={wrapperRef} onPointerDown={startDrag} style={wrapperStyle}>
      {mediaElement}

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

  const actionBar =
    editMode && selected ? (
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
        {/* Mute-toggle (för videos — irrelevant för iframe) */}
        {embed.kind === "video" ? (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              updateProp("muted", muted ? "false" : "true");
            }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: muted ? "var(--text)" : "#0a0908",
              background: muted ? "rgba(10,9,8,0.85)" : accent,
              border: `1px solid ${accent}`,
              padding: "0.35rem 0.7rem",
              borderRadius: "0.3rem",
              cursor: "pointer",
              fontWeight: 700,
            }}
            title="Slå på/av ljud i presenter-läget"
          >
            {muted ? "Muted" : "● Ljud"}
          </button>
        ) : null}

        {/* Layer-toggle: framför / bakom innehållet */}
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
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
              ? "Videon ligger BAKOM innehållet — klicka för att flytta fram"
              : "Videon ligger FRAMFÖR innehållet — klicka för att flytta bakom"
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
          title="Stäng av skugga"
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
              if (confirm("Ta bort videon från sliden?")) {
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
            title="Ta bort videon från sliden"
          >
            × Ta bort
          </button>
        ) : null}
      </div>
    ) : null;

  // OVERLAY-MODE: bara videon + handles, ingen slide-container.
  if (isOverlay) {
    return (
      <>
        {videoElement}
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

      {videoElement}
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
