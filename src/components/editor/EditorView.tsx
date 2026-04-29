"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PresentationMeta } from "@/lib/types";
import type { ParsedPresentation, ParsedComponent, PropValue } from "@/lib/mdx-parser";
import { savePresentation } from "@/lib/edit-actions";
import { createDefaultSlide } from "@/lib/template-schemas";
import { EditorFieldPanel } from "./EditorFieldPanel";
import { EditorPreview } from "./EditorPreview";
import { EditorNavigator } from "./EditorNavigator";
import { TemplatePicker } from "./TemplatePicker";
import { SlideActions } from "./SlideActions";
import { AddImageModal } from "./AddImageModal";
import { AddVideoModal } from "./AddVideoModal";

interface EditorViewProps {
  slug: string;
  meta: PresentationMeta;
  initialParsed: ParsedPresentation;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function EditorView({ slug, meta, initialParsed }: EditorViewProps) {
  const [parsed, setParsed] = useState<ParsedPresentation>(initialParsed);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  // Inline-edit aktiveras per default när man går in i edit-vyn —
  // användaren kan stänga av med "Inline"-toggle eller "I"-tangenten.
  const [editMode, setEditMode] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const latestParsed = useRef(parsed);
  latestParsed.current = parsed;

  // Tillåt scroll på body
  useEffect(() => {
    document.body.classList.add("allow-scroll");
    return () => document.body.classList.remove("allow-scroll");
  }, []);

  // Synka activeIndex med URL ?slide=N. På mount: läs URL och initialisera
  // activeIndex. Vid efterföljande activeIndex-ändringar: uppdatera URL.
  // Två separata useEffects funkade inte eftersom URL-update-effecten kör
  // med activeIndex=0 vid mount INNAN read-effekten hunnit triggra re-render
  // — vilket skrev över ?slide=47 till ?slide=1 omedelbart.
  const slideUrlSyncedRef = useRef(false);
  useEffect(() => {
    if (!slideUrlSyncedRef.current) {
      // Första körningen: läs URL
      slideUrlSyncedRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const param = params.get("slide");
      if (param) {
        const n = parseInt(param, 10);
        const total = initialParsed.slides.length;
        if (!isNaN(n) && n >= 1 && n <= total) {
          setActiveIndex(n - 1);
        }
      }
      return;
    }
    // Efterföljande körningar: uppdatera URL
    const url = new URL(window.location.href);
    url.searchParams.set("slide", String(activeIndex + 1));
    window.history.replaceState({}, "", url.toString());
  }, [activeIndex, initialParsed.slides.length]);

  // Keyboard shortcuts i editorn
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignorera om fokus är i input/textarea
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;
      if (inField) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, latestParsed.current.slides.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "n" || e.key === "m") {
        e.preventDefault();
        setNavigatorOpen((v) => !v);
      } else if (e.key === "e") {
        e.preventDefault();
        setPanelOpen((v) => !v);
      } else if (e.key === "i") {
        e.preventDefault();
        setEditMode((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const activeSlide = parsed.slides[activeIndex];

  const doSave = useCallback(async () => {
    setSaveStatus("saving");
    const result = await savePresentation(slug, latestParsed.current);
    if (result.ok) {
      setSaveStatus("saved");
      setSaveError(null);
      // Återgå till idle efter 2s
      setTimeout(() => setSaveStatus((prev) => (prev === "saved" ? "idle" : prev)), 2000);
    } else {
      setSaveStatus("error");
      setSaveError(result.error ?? "Okänt fel");
    }
  }, [slug]);

  // Debounced autosave
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      doSave();
    }, 300);
  }, [doSave]);

  const updateSlideProps = useCallback(
    (propsUpdate: Record<string, PropValue>) => {
      setParsed((prev) => {
        const newSlides = [...prev.slides];
        const current = newSlides[activeIndex];
        newSlides[activeIndex] = {
          ...current,
          props: { ...current.props, ...propsUpdate },
        };
        return { ...prev, slides: newSlides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const updateSlideContent = useCallback(
    (content: string) => {
      setParsed((prev) => {
        const newSlides = [...prev.slides];
        const current = newSlides[activeIndex];
        newSlides[activeIndex] = { ...current, content };
        return { ...prev, slides: newSlides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  // Adapter för inline-editorn: ta single prop+value och bygg ett
  // one-key-object som matchar updateSlideProps-signaturen.
  const updateSlidePropInline = useCallback(
    (propName: string, value: string) => {
      updateSlideProps({ [propName]: value });
    },
    [updateSlideProps]
  );

  const updateSlideNotes = useCallback(
    (notes: string) => {
      setParsed((prev) => {
        const newSlides = [...prev.slides];
        const current = newSlides[activeIndex];
        newSlides[activeIndex] = {
          ...current,
          notes: notes.trim() ? notes : undefined,
        };
        return { ...prev, slides: newSlides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const updateFrontmatter = useCallback(
    (key: string, value: unknown) => {
      setParsed((prev) => ({
        ...prev,
        frontmatter: { ...prev.frontmatter, [key]: value },
      }));
      scheduleSave();
    },
    [scheduleSave]
  );

  // --- CRUD-handlers ---

  const addSlideAfter = useCallback(
    (tag: string) => {
      const newSlide = createDefaultSlide(tag) as ParsedComponent;
      setParsed((prev) => {
        const slides = [...prev.slides];
        const insertAt = activeIndex + 1;
        slides.splice(insertAt, 0, newSlide);
        return { ...prev, slides };
      });
      setActiveIndex((i) => i + 1);
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const addOverlayImage = useCallback(
    (src: string) => {
      const newOverlay: ParsedComponent = {
        tag: "FloatingImage",
        props: { src, x: "30%", y: "30%", width: "14%" },
        content: null,
        children: [],
      };
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current) return prev;
        slides[activeIndex] = {
          ...current,
          overlays: [...(current.overlays ?? []), newOverlay],
        };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const addOverlayVideo = useCallback(
    (src: string) => {
      const newOverlay: ParsedComponent = {
        tag: "FloatingVideo",
        props: { src, x: "30%", y: "30%", width: "30%" },
        content: null,
        children: [],
      };
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current) return prev;
        slides[activeIndex] = {
          ...current,
          overlays: [...(current.overlays ?? []), newOverlay],
        };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const addOverlayText = useCallback(() => {
    const newOverlay: ParsedComponent = {
      tag: "FloatingText",
      props: {
        text: "Ny textruta",
        x: "30%",
        y: "30%",
        width: "30%",
        size: "md",
      },
      content: null,
      children: [],
    };
    setParsed((prev) => {
      const slides = [...prev.slides];
      const current = slides[activeIndex];
      if (!current) return prev;
      slides[activeIndex] = {
        ...current,
        overlays: [...(current.overlays ?? []), newOverlay],
      };
      return { ...prev, slides };
    });
    scheduleSave();
  }, [activeIndex, scheduleSave]);

  const updateOverlayProp = useCallback(
    (overlayIndex: number, propName: string, value: string) => {
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current?.overlays) return prev;
        const overlays = [...current.overlays];
        const target = overlays[overlayIndex];
        if (!target) return prev;
        // Tom sträng → ta bort prop helt (för booleans som noShadow=true/false)
        const newProps: Record<string, PropValue> = { ...target.props };
        if (value === "") {
          delete newProps[propName];
        } else if (value === "true") {
          newProps[propName] = true;
        } else if (value === "false") {
          newProps[propName] = false;
        } else {
          newProps[propName] = value;
        }
        overlays[overlayIndex] = { ...target, props: newProps };
        slides[activeIndex] = { ...current, overlays };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const deleteOverlay = useCallback(
    (overlayIndex: number) => {
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current?.overlays) return prev;
        const overlays = current.overlays.filter((_, i) => i !== overlayIndex);
        slides[activeIndex] = {
          ...current,
          overlays: overlays.length > 0 ? overlays : undefined,
        };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const duplicateSlide = useCallback(() => {
    setParsed((prev) => {
      const slides = [...prev.slides];
      const current = slides[activeIndex];
      if (!current) return prev;
      // Deep clone via JSON (ParsedComponent har bara plain data)
      const copy = JSON.parse(JSON.stringify(current)) as ParsedComponent;
      slides.splice(activeIndex + 1, 0, copy);
      return { ...prev, slides };
    });
    setActiveIndex((i) => i + 1);
    scheduleSave();
  }, [activeIndex, scheduleSave]);

  const removeSlide = useCallback(() => {
    setParsed((prev) => {
      if (prev.slides.length <= 1) return prev;
      const slides = prev.slides.filter((_, i) => i !== activeIndex);
      return { ...prev, slides };
    });
    setActiveIndex((i) =>
      Math.min(i, Math.max(0, latestParsed.current.slides.length - 2))
    );
    scheduleSave();
  }, [activeIndex, scheduleSave]);

  // --- Sub-component (children) mutations: TimelineEvent, ComparisonColumn ---

  const updateChildProps = useCallback(
    (childIndex: number, propsUpdate: Record<string, PropValue>) => {
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current) return prev;
        const children = [...current.children];
        const child = children[childIndex];
        if (!child) return prev;
        children[childIndex] = {
          ...child,
          props: { ...child.props, ...propsUpdate },
        };
        slides[activeIndex] = { ...current, children };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const updateChildContent = useCallback(
    (childIndex: number, content: string) => {
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current) return prev;
        const children = [...current.children];
        const child = children[childIndex];
        if (!child) return prev;
        children[childIndex] = { ...child, content };
        slides[activeIndex] = { ...current, children };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const addChild = useCallback(() => {
    setParsed((prev) => {
      const slides = [...prev.slides];
      const current = slides[activeIndex];
      if (!current) return prev;
      const childTag = current.tag === "Timeline" ? "TimelineEvent" : "ComparisonColumn";
      const newChild: ParsedComponent = {
        tag: childTag,
        props:
          childTag === "TimelineEvent"
            ? { date: "2026", title: "Ny händelse" }
            : { title: "Ny kolumn" },
        content: childTag === "TimelineEvent" ? "Beskrivning" : "- Ny punkt",
        children: [],
      };
      slides[activeIndex] = {
        ...current,
        children: [...current.children, newChild],
      };
      return { ...prev, slides };
    });
    scheduleSave();
  }, [activeIndex, scheduleSave]);

  const removeChild = useCallback(
    (childIndex: number) => {
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current) return prev;
        const children = current.children.filter((_, i) => i !== childIndex);
        slides[activeIndex] = { ...current, children };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const moveChild = useCallback(
    (from: number, to: number) => {
      setParsed((prev) => {
        const slides = [...prev.slides];
        const current = slides[activeIndex];
        if (!current) return prev;
        if (to < 0 || to >= current.children.length) return prev;
        const children = [...current.children];
        const [moved] = children.splice(from, 1);
        children.splice(to, 0, moved);
        slides[activeIndex] = { ...current, children };
        return { ...prev, slides };
      });
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const reorderSlides = useCallback(
    (from: number, to: number) => {
      setParsed((prev) => {
        if (from < 0 || from >= prev.slides.length) return prev;
        if (to < 0 || to >= prev.slides.length) return prev;
        const slides = [...prev.slides];
        const [moved] = slides.splice(from, 1);
        slides.splice(to, 0, moved);
        return { ...prev, slides };
      });
      // Håll fokus på den flyttade sliden
      setActiveIndex(to);
      scheduleSave();
    },
    [scheduleSave]
  );

  const moveSlide = useCallback(
    (direction: -1 | 1) => {
      setParsed((prev) => {
        const target = activeIndex + direction;
        if (target < 0 || target >= prev.slides.length) return prev;
        const slides = [...prev.slides];
        [slides[activeIndex], slides[target]] = [slides[target], slides[activeIndex]];
        return { ...prev, slides };
      });
      setActiveIndex((i) => i + direction);
      scheduleSave();
    },
    [activeIndex, scheduleSave]
  );

  const slideLabels = useMemo(
    () =>
      parsed.slides.map((s) => {
        const title =
          (s.props.title as string) ??
          (s.props.text as string) ??
          (s.props.question as string) ??
          (s.props.resultText as string) ??
          (s.content ? firstLine(s.content) : "") ??
          "";
        return { tag: s.tag, title: truncate(title, 40) };
      }),
    [parsed.slides]
  );

  const total = parsed.slides.length;
  const goPrev = () => setActiveIndex((i) => Math.max(i - 1, 0));
  const goNext = () => setActiveIndex((i) => Math.min(i + 1, total - 1));

  return (
    <div className="editor-view flex h-screen flex-col overflow-hidden bg-bg text-text">
      {/* Kompakt single-row header */}
      <header className="flex items-center justify-between gap-3 border-b border-white/5 bg-bg/90 px-4 py-1.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/${slug}`}
            className="shrink-0 text-[0.65rem] uppercase tracking-[0.25em] text-text-muted transition-colors hover:text-accent"
            title="Tillbaka till presentation"
          >
            ←
          </Link>
          <h1 className="truncate text-sm font-medium text-text">{meta.title}</h1>
          <span className="hidden shrink-0 font-mono text-[0.65rem] text-text-muted/60 lg:inline">
            {slug}.mdx
          </span>
        </div>

        {/* Slide-nav i mitten */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="rounded border border-white/10 bg-bg-surface/40 px-2 py-1 text-xs text-text-muted transition-all hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
            title="Föregående (k / ↑)"
          >
            ←
          </button>
          <button
            onClick={() => setNavigatorOpen(true)}
            className="flex items-center gap-2 rounded border border-white/10 bg-bg-surface/40 px-2.5 py-1 text-xs text-text transition-all hover:border-accent hover:text-accent"
            title="Öppna navigator (N)"
          >
            <span className="font-mono tabular-nums text-text-muted">
              {String(activeIndex + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
            <span className="hidden truncate max-w-[180px] md:inline">
              {slideLabels[activeIndex]?.title || slideLabels[activeIndex]?.tag}
            </span>
          </button>
          <button
            onClick={goNext}
            disabled={activeIndex >= total - 1}
            className="rounded border border-white/10 bg-bg-surface/40 px-2 py-1 text-xs text-text-muted transition-all hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
            title="Nästa (j / ↓)"
          >
            →
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SaveIndicator status={saveStatus} error={saveError} />
          <button
            onClick={() => setImageModalOpen(true)}
            className="rounded border border-white/10 bg-bg-surface/40 px-2 py-1 text-xs text-text-muted transition-all hover:border-accent hover:text-accent"
            title="Lägg till bild som overlay på aktuell slide"
          >
            + Bild
          </button>
          <button
            onClick={() => setVideoModalOpen(true)}
            className="rounded border border-white/10 bg-bg-surface/40 px-2 py-1 text-xs text-text-muted transition-all hover:border-accent hover:text-accent"
            title="Lägg till video som overlay på aktuell slide"
          >
            + Video
          </button>
          <button
            onClick={addOverlayText}
            className="rounded border border-white/10 bg-bg-surface/40 px-2 py-1 text-xs text-text-muted transition-all hover:border-accent hover:text-accent"
            title="Lägg till fri textruta som overlay på aktuell slide"
          >
            + Text
          </button>
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`rounded border px-2 py-1 text-xs uppercase tracking-[0.1em] transition-all ${
              editMode
                ? "border-accent bg-accent/20 text-accent"
                : "border-white/10 bg-bg-surface/40 text-text-muted hover:border-accent hover:text-accent"
            }`}
            title="Inline-edit på/av (I) — klicka på text i preview för att redigera"
          >
            {editMode ? "● Inline" : "Inline"}
          </button>
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="rounded border border-white/10 bg-bg-surface/40 px-2 py-1 text-xs text-text-muted transition-all hover:border-accent hover:text-accent"
            title="Toggla fält-panel (E)"
          >
            {panelOpen ? "Dölj ▸" : "◂ Visa"}
          </button>
          <Link
            href={`/${slug}?slide=${activeIndex + 1}`}
            className="rounded border border-accent bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-accent transition-all hover:bg-accent/20"
            title="Visa presentation från aktuell slide"
          >
            Visa →
          </Link>
        </div>
      </header>

      {/* Split: preview + fält-panel (kollapsbar) */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <EditorPreview
            slide={activeSlide}
            slideIndex={activeIndex}
            total={total}
            theme={(parsed.frontmatter.theme as string) ?? "default"}
            editMode={editMode}
            onToggleEditMode={() => setEditMode((v) => !v)}
            onUpdateProp={updateSlidePropInline}
            onUpdateContent={updateSlideContent}
            onUpdateOverlayProp={updateOverlayProp}
            onDeleteOverlay={deleteOverlay}
          />
        </div>
        {panelOpen && (
          <aside className="flex w-full max-w-sm flex-col overflow-y-auto border-l border-white/5 bg-bg">
            <div className="border-b border-white/5 p-4">
              <SlideActions
                activeIndex={activeIndex}
                total={total}
                onAddAfter={() => setPickerOpen(true)}
                onDuplicate={duplicateSlide}
                onRemove={removeSlide}
                onMoveUp={() => moveSlide(-1)}
                onMoveDown={() => moveSlide(1)}
              />
            </div>
            <div className="flex-1 p-6">
              {activeSlide && (
                <EditorFieldPanel
                  slide={activeSlide}
                  frontmatter={parsed.frontmatter}
                  onUpdateProps={updateSlideProps}
                  onUpdateContent={updateSlideContent}
                  onUpdateNotes={updateSlideNotes}
                  onUpdateFrontmatter={updateFrontmatter}
                  onUpdateChildProps={updateChildProps}
                  onUpdateChildContent={updateChildContent}
                  onAddChild={addChild}
                  onRemoveChild={removeChild}
                  onMoveChild={moveChild}
                />
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Template picker för att lägga till ny slide */}
      <TemplatePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addSlideAfter}
      />

      {/* Fullscreen slide-navigator (öppnas med N eller knapp) */}
      <EditorNavigator
        open={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
        labels={slideLabels}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        onReorder={reorderSlides}
      />

      {/* Lägg till bild som overlay på aktuell slide */}
      <AddImageModal
        open={imageModalOpen}
        slug={slug}
        onClose={() => setImageModalOpen(false)}
        onPick={addOverlayImage}
      />

      {/* Lägg till video som overlay på aktuell slide */}
      <AddVideoModal
        open={videoModalOpen}
        slug={slug}
        onClose={() => setVideoModalOpen(false)}
        onPick={addOverlayVideo}
      />

    </div>
  );
}

function SaveIndicator({ status, error }: { status: SaveStatus; error: string | null }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        Sparar...
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Sparat
      </span>
    );
  }
  if (status === "error") {
    return (
      <span
        className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-red-400"
        title={error ?? undefined}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Fel
      </span>
    );
  }
  return null;
}

function firstLine(s: string): string {
  return s.split("\n").find((l) => l.trim() !== "") ?? "";
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
