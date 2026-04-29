"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Children, isValidElement } from "react";
import type { ReactElement } from "react";
import { useInlineEdit } from "@/lib/inline-edit";
import { useIsOverlay, useOverlayInstance } from "./SlideWithOverlays";

/**
 * FloatingText — fri textruta som overlay. Drag/resize i edit-mode samma
 * mönster som FloatingImage. Stödjer **bold** och *italic* via markdown.
 *
 * I edit-mode:
 *   - Klicka → markeras med outline + 4 corner-handles + action-bar
 *   - Drag i mitten → flytta (uppdaterar x, y som % av slide)
 *   - Drag i hörn → resize (uppdaterar width som % av slide-bredd)
 *   - Klick på pennan i action-baren → öppnar prompt för att redigera texten
 *   - Toggle "▣ Framför / ▢ Bakom" för layer
 *
 * MDX-format:
 * ```mdx
 * <FloatingText
 *   x="20%" y="30%" width="30%"
 *   align="left"
 *   size="lg"
 *   color="var(--text)"
 *   weight="bold"
 *   layer="front"
 * >
 * En **fri** textruta du kan flytta och dra ut storleken på.
 * </FloatingText>
 * ```
 */

type SizeKey = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

/**
 * SIZE_PRESETS — preset-namn → cqw-värde (% av container-bredd).
 * Container query units gör att texten skalar med wrapper-bredden,
 * så drar du i resize-hörnen växer fonten med boxen automatiskt.
 */
const SIZE_PRESETS: Record<SizeKey, number> = {
  xs: 5,
  sm: 7,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
};

/**
 * Tolka size-prop som antingen preset-namn ("md") eller direkt cqw-värde
 * (sträng som "12" eller nummer 12). Returnerar cqw-värde 1-100.
 */
function resolveSizeCqw(size: string | number | undefined): number {
  if (size == null) return SIZE_PRESETS.md;
  if (typeof size === "number") return Math.max(1, Math.min(100, size));
  // Strängar — kolla först om det är ett preset-namn
  if (size in SIZE_PRESETS) return SIZE_PRESETS[size as SizeKey];
  // Sen som numeriskt värde (t.ex. "12" eller "12cqw")
  const parsed = parseFloat(size);
  if (Number.isFinite(parsed)) return Math.max(1, Math.min(100, parsed));
  return SIZE_PRESETS.md;
}

interface FloatingTextProps {
  /** Texten — kan komma som children eller via `text`-prop. **bold** och *italic* stöds. */
  text?: string;
  /** Horisontell position som procent. */
  x?: string;
  /** Vertikal position som procent. */
  y?: string;
  /** Bredd. Default 25%. */
  width?: string;
  /** Höjd (auto om ej angiven). */
  height?: string;
  /**
   * Storlek på texten — antingen ett preset-namn (xs/sm/md/lg/xl/xxl) eller
   * ett direkt cqw-värde som sträng eller nummer (t.ex. "12" eller 12 = 12% av
   * container-bredden). Fri-storleks-knappar i action-baren tillåter justering
   * i 1cqw-steg eller direkt prompt.
   */
  size?: SizeKey | string | number;
  /** Textfärg. Default cream. */
  color?: string;
  /** Vikt. Default 500. */
  weight?: "regular" | "medium" | "bold" | "black" | number;
  /** Justering. */
  align?: "left" | "center" | "right";
  /** Stil — "display" (rubrikfont) eller "body" (löptext). */
  style?: "display" | "body" | "mono";
  /** Bakgrund inom rutan (CSS-färg eller "transparent"). Default transparent. */
  background?: string;
  /** Padding. Default 0. */
  padding?: string;
  /** Border-radius. Default 0. */
  radius?: string;
  /** Rotation i grader. */
  rotation?: number;
  /** Opacitet 0-1. */
  opacity?: number;
  /** Z-index. */
  zIndex?: number;
  /** Layer — front (default) eller back. */
  layer?: "front" | "back";
  /** Accent för edit-mode-handles. */
  accent?: string;
  children?: ReactNode;
}

const WEIGHT_MAP: Record<string, number> = {
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900,
};

function extractText(node: ReactNode): string {
  if (node == null || node === false) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    const t = el.type;
    const inner = extractText(el.props.children);
    if (t === "strong") return `**${inner}**`;
    if (t === "em") return `*${inner}*`;
    if (t === "p") return inner + "\n";
    if (t === "br") return "\n";
    return inner;
  }
  return "";
}

function renderRich(text: string, accent: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span
        key={lineIdx}
        style={{ display: "block" }}
      >
        {parts.map((p, i) => {
          if (p.startsWith("**") && p.endsWith("**")) {
            return (
              <span key={i} style={{ color: accent, fontWeight: 700 }}>
                {p.slice(2, -2)}
              </span>
            );
          }
          if (p.startsWith("*") && p.endsWith("*")) {
            return (
              <em key={i} style={{ fontStyle: "italic" }}>
                {p.slice(1, -1)}
              </em>
            );
          }
          return <span key={i}>{p}</span>;
        })}
      </span>
    );
  });
}

export function FloatingText({
  text,
  x = "30%",
  y = "30%",
  width = "30%",
  height,
  size = "md",
  color = "var(--text)",
  weight = "medium",
  align = "left",
  style = "display",
  background = "transparent",
  padding = "0",
  radius = "0",
  rotation = 0,
  opacity = 1,
  zIndex,
  layer = "front",
  accent = "#EC7E26",
  children,
}: FloatingTextProps) {
  // Resolve size till cqw-nummer (stödjer både preset-namn och direkt värde)
  const sizeCqw = resolveSizeCqw(size);
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

  const effectiveZIndex = zIndex ?? (layer === "back" ? 1 : 10);

  // Innehåll: text-prop eller children
  const rawText = text ?? extractText(children).trim();

  // Resolve weight
  const fontWeight =
    typeof weight === "number"
      ? weight
      : WEIGHT_MAP[weight] ?? 500;

  // Font-family baserat på style
  const fontFamily =
    style === "mono"
      ? "var(--font-mono)"
      : style === "body"
      ? "var(--font-body)"
      : "var(--font-display)";

  // Klick utanför → avmarkera
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

  // Drag (samma mönster som FloatingImage)
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

  // Resize
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
        const newWidth = Math.max(60, startWidth + dxNormalized);
        wrapper.style.width = `${newWidth}px`;
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!hasResized) {
          setResizing(false);
          return;
        }
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
    minHeight: editMode && !rawText ? "2rem" : undefined,
    transform: `rotate(${rotation}deg)`,
    opacity,
    // I edit-mode tvinar vi hög zIndex så textrutan är klickbar även när
    // layer="back". Se FloatingImage för full förklaring.
    zIndex: editMode ? 50 : effectiveZIndex,
    cursor: editMode ? (dragging ? "grabbing" : "grab") : "default",
    transition: dragging || resizing ? "none" : "outline 200ms ease",
    outline:
      editMode && selected
        ? `2px solid ${accent}`
        : editMode
        ? "1px dashed rgba(247,241,230,0.25)"
        : "none",
    outlineOffset: "4px",
    userSelect: editMode ? "none" : "text",
    touchAction: "none",
    background,
    padding,
    borderRadius: radius,
    // Container query — gör att font-size i SIZE_MAP (cqw) skalas med
    // wrapper-bredden. När du drar för att ändra storlek växer fonten
    // automatiskt med boxen.
    containerType: "inline-size",
  };

  const textStyle: CSSProperties = {
    fontFamily,
    fontWeight,
    // cqw skalas dynamiskt med container-bredd. Min/max-clamp så texten
    // inte blir orimligt liten/stor när boxen är extrem.
    fontSize: `clamp(0.6rem, ${sizeCqw}cqw, 12rem)`,
    lineHeight: 1.3,
    letterSpacing: "-0.005em",
    color,
    textAlign: align,
    margin: 0,
    pointerEvents: editMode ? "none" : "auto",
    width: "100%",
  };

  const contentElement = (
    <div
      ref={wrapperRef}
      onPointerDown={startDrag}
      style={wrapperStyle}
    >
      <div style={textStyle}>
        {rawText ? (
          renderRich(rawText, accent)
        ) : editMode ? (
          <span
            style={{
              color: "color-mix(in srgb, var(--text-muted) 80%, transparent)",
              fontStyle: "italic",
            }}
          >
            (klicka pennan för att skriva)
          </span>
        ) : null}
      </div>

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

  // Action-bar
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
        {/* Redigera text */}
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            const newText = window.prompt(
              "Redigera text (stöd: **fet**, *kursiv*, ny rad = enter):",
              rawText,
            );
            if (newText != null) {
              updateProp("text", newText);
            }
          }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text)",
            background: "rgba(10,9,8,0.85)",
            border: `1px solid ${accent}`,
            padding: "0.35rem 0.7rem",
            borderRadius: "0.3rem",
            cursor: "pointer",
            fontWeight: 700,
          }}
          title="Redigera texten"
        >
          ✎ Text
        </button>

        {/* Storlek-grupp: − [värde] + */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            border: `1px solid ${accent}`,
            borderRadius: "0.3rem",
            background: "rgba(10,9,8,0.85)",
            overflow: "hidden",
          }}
        >
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              const newSize = Math.max(1, sizeCqw - 1);
              updateProp("size", String(newSize));
            }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--text)",
              background: "transparent",
              border: "none",
              borderRight: `1px solid ${accent}66`,
              padding: "0.35rem 0.55rem",
              cursor: "pointer",
              fontWeight: 700,
              lineHeight: 1,
            }}
            title="Minska 1cqw"
          >
            A−
          </button>
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              const input = window.prompt(
                "Storlek (1-100, % av box-bredd):",
                String(Math.round(sizeCqw)),
              );
              if (input == null) return;
              const num = parseFloat(input);
              if (Number.isFinite(num) && num >= 1 && num <= 100) {
                updateProp("size", String(num));
              }
            }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--text)",
              background: "transparent",
              border: "none",
              borderRight: `1px solid ${accent}66`,
              padding: "0.35rem 0.65rem",
              cursor: "pointer",
              fontWeight: 700,
              minWidth: "3rem",
              lineHeight: 1,
            }}
            title="Klicka för att ange exakt storlek"
          >
            {Math.round(sizeCqw)}
          </button>
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              const newSize = Math.min(100, sizeCqw + 1);
              updateProp("size", String(newSize));
            }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--text)",
              background: "transparent",
              border: "none",
              padding: "0.35rem 0.55rem",
              cursor: "pointer",
              fontWeight: 700,
              lineHeight: 1,
            }}
            title="Öka 1cqw"
          >
            A+
          </button>
        </div>

        {/* Layer-toggle */}
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
              ? "Texten ligger BAKOM innehållet"
              : "Texten ligger FRAMFÖR innehållet"
          }
        >
          {layer === "back" ? "▢ Bakom" : "▣ Framför"}
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

        {/* Delete */}
        {onDelete ? (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              if (confirm("Ta bort textrutan?")) {
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
            title="Ta bort textrutan"
          >
            × Ta bort
          </button>
        ) : null}
      </div>
    ) : null;

  // Overlay-mode: bara textrutan + handles
  if (isOverlay) {
    return (
      <>
        {contentElement}
        {actionBar}
      </>
    );
  }

  // Standalone-mode (sällan använt — främst som overlay)
  return (
    <div
      ref={slideContainerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "#0a0908" }}
    >
      {contentElement}
      {actionBar}
    </div>
  );
}

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
