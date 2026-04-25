"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PresentationMeta } from "@/lib/types";
import {
  createPresentation,
  duplicatePresentation,
} from "@/lib/presentation-actions";

type SortMode = "recent" | "date" | "title" | "slides";

interface Props {
  presentations: PresentationMeta[];
}

function relativeDate(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return iso;
  const diff = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  if (days === 0) return "idag";
  if (days === 1) return "igår";
  if (days < 7) return `${days} dagar sen`;
  if (days < 30) return `${Math.floor(days / 7)}v sen`;
  if (days < 365) return `${Math.floor(days / 30)}m sen`;
  return `${Math.floor(days / 365)}å sen`;
}

export function HomeDashboard({ presentations }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortMode>("recent");
  const [creatingOpen, setCreatingOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Samla alla unika tags för chip-raden
  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const p of presentations) {
      p.tags?.forEach((t) => s.add(t));
    }
    return [...s].sort();
  }, [presentations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = presentations.filter((p) => {
      if (activeTags.length > 0) {
        const has = activeTags.every((t) => p.tags?.includes(t));
        if (!has) return false;
      }
      if (!q) return true;
      const hay = [
        p.title,
        p.description ?? "",
        p.event ?? "",
        p.author ?? "",
        (p.tags ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    // Sortera
    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "sv");
      if (sort === "slides") return (b.slideCount ?? 0) - (a.slideCount ?? 0);
      if (sort === "date") {
        return (b.date ?? "").localeCompare(a.date ?? "");
      }
      // recent = updatedAt
      return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    });
    return list;
  }, [presentations, query, activeTags, sort]);

  const toggleTag = (t: string) => {
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  // Kortkommandon: / = sök, n = ny, esc = rensa
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField =
        t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
      if (e.key === "/" && !inField) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "n" && !inField) {
        e.preventDefault();
        setCreatingOpen(true);
      } else if (e.key === "Escape") {
        if (document.activeElement === searchRef.current) {
          searchRef.current?.blur();
        }
        setQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const onDuplicate = (slug: string) => {
    startTransition(async () => {
      const res = await duplicatePresentation(slug);
      if (res.ok && res.newSlug) {
        router.refresh();
        router.push(`/${res.newSlug}/edit`);
      }
    });
  };

  return (
    <main className="min-h-screen bg-bg px-6 py-14 text-text">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-5 h-1 w-16 bg-accent" />
            <h1
              className="text-4xl font-semibold tracking-tight md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Slidecraft
            </h1>
            <p className="mt-3 text-base text-text-muted md:text-lg">
              {presentations.length} presentationer ·{" "}
              <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-xs">
                /
              </kbd>{" "}
              för att söka ·{" "}
              <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-xs">
                N
              </kbd>{" "}
              för ny
            </p>
          </div>
          <button
            onClick={() => setCreatingOpen(true)}
            className="group flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-[0_0_30px_-5px_var(--accent)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ny presentation
          </button>
        </header>

        {/* SÖKFÄLT + SORT */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sök titel, beskrivning, tagg, author…"
              className="w-full rounded-full border border-white/10 bg-bg-surface/50 py-3 pl-12 pr-4 text-base text-text outline-none transition-all placeholder:text-text-muted focus:border-accent focus:bg-bg-surface focus:shadow-[0_0_0_4px_var(--accent-dim)]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted transition-colors hover:bg-white/10 hover:text-text"
                aria-label="Rensa sökning"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-full border border-white/10 bg-bg-surface/50 px-4 py-3 text-sm text-text outline-none transition-colors hover:bg-bg-surface focus:border-accent"
          >
            <option value="recent">Senast ändrad</option>
            <option value="date">Event-datum</option>
            <option value="title">Titel A–Ö</option>
            <option value="slides">Flest slides</option>
          </select>
        </div>

        {/* TAG-CHIPS */}
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.2em] transition-all"
                  style={{
                    borderColor: active
                      ? "var(--accent)"
                      : "rgba(255,255,255,0.15)",
                    background: active
                      ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                      : "rgba(255,255,255,0.03)",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {tag}
                </button>
              );
            })}
            {activeTags.length > 0 && (
              <button
                onClick={() => setActiveTags([])}
                className="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-text-muted transition-colors hover:text-accent"
              >
                Rensa filter
              </button>
            )}
          </div>
        )}

        {/* RESULTAT-RÄKNARE */}
        <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-text-muted">
          <span>
            Visar {filtered.length} av {presentations.length}
          </span>
          {(query || activeTags.length > 0) && (
            <button
              onClick={() => {
                setQuery("");
                setActiveTags([]);
              }}
              className="text-accent hover:underline"
            >
              Nollställ
            </button>
          )}
        </div>

        {/* KORT-GRID */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-bg-surface/40 p-16 text-center text-text-muted">
            {presentations.length === 0 ? (
              <>
                <p className="mb-3 text-lg">Inga presentationer än.</p>
                <p>
                  Klicka på <span className="text-accent">Ny presentation</span>{" "}
                  eller lägg in en MDX-fil i{" "}
                  <code className="text-accent">content/</code>.
                </p>
              </>
            ) : (
              <>
                <p className="mb-2 text-lg">Inget matchade din sökning.</p>
                <p className="text-sm">Justera filter eller prova ett annat ord.</p>
              </>
            )}
          </div>
        ) : (
          <motion.ul
            layout
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.li
                  layout
                  key={p.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.35,
                    delay: i < 8 ? i * 0.04 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <PresentationCard
                    meta={p}
                    onDuplicate={() => onDuplicate(p.slug)}
                    isBusy={isPending}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {/* NY-PRESENTATION-MODAL */}
      <NewPresentationModal
        open={creatingOpen}
        onClose={() => setCreatingOpen(false)}
        existingTags={allTags}
      />
    </main>
  );
}

function PresentationCard({
  meta,
  onDuplicate,
  isBusy,
}: {
  meta: PresentationMeta;
  onDuplicate: () => void;
  isBusy: boolean;
}) {
  return (
    <div
      className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-bg-surface/40 p-6 transition-all hover:border-accent/50 hover:bg-bg-surface/70"
      style={{
        boxShadow:
          "0 20px 40px -30px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}
    >
      {/* Accent-linje som tonas fram vid hover */}
      <div
        className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
        aria-hidden
      />

      <Link href={`/${meta.slug}`} className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h2
            className="text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {meta.title}
          </h2>
          {typeof meta.slideCount === "number" && (
            <span className="mt-1 flex-shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">
              {meta.slideCount} slides
            </span>
          )}
        </div>

        {meta.description && (
          <p className="text-sm leading-relaxed text-text-muted">
            {meta.description.length > 140
              ? meta.description.slice(0, 140) + "…"
              : meta.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] uppercase tracking-[0.22em] text-text-muted">
          {meta.event && <span>{meta.event}</span>}
          {meta.event && meta.date && <span className="text-accent/60">·</span>}
          {meta.date && <span>{meta.date}</span>}
          {meta.updatedAt && (
            <>
              <span className="text-accent/60">·</span>
              <span title={`Senast ändrad ${meta.updatedAt}`}>
                {relativeDate(meta.updatedAt)}
              </span>
            </>
          )}
          {meta.theme && meta.theme !== "default" && (
            <>
              <span className="text-accent/60">·</span>
              <span>{meta.theme}</span>
            </>
          )}
        </div>

        {meta.tags && meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.18em]"
                style={{
                  background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* ACTION-RAD */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
        <Link
          href={`/${meta.slug}`}
          className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-accent hover:text-bg"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Visa
        </Link>
        <Link
          href={`/${meta.slug}/edit`}
          className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-white/15"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          </svg>
          Redigera
        </Link>
        <Link
          href={`/${meta.slug}/presenter`}
          className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-white/15"
          target={`presenter-${meta.slug}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          Presenter
        </Link>
        <button
          onClick={onDuplicate}
          disabled={isBusy}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-white/15 hover:text-text disabled:opacity-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Duplicera
        </button>
      </div>
    </div>
  );
}

function NewPresentationModal({
  open,
  onClose,
  existingTags,
}: {
  open: boolean;
  onClose: () => void;
  existingTags: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("default");
  const [tagsInput, setTagsInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setTheme("default");
      setTagsInput("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await createPresentation({ title, theme, tags });
    setBusy(false);
    if (res.ok && res.slug) {
      onClose();
      router.refresh();
      router.push(`/${res.slug}/edit`);
    } else {
      setError(res.error ?? "Kunde inte skapa");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-bg p-8 shadow-2xl"
          >
            <form onSubmit={submit} className="flex flex-col gap-5">
              <div>
                <div className="mb-3 h-0.5 w-10 bg-accent" />
                <h2
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Ny presentation
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Slug genereras automatiskt från titeln. Du kan ändra innehåll direkt efter skapande.
                </p>
              </div>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-text-muted">Titel</span>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="t.ex. AI i skolledarskap"
                  className="rounded-lg border border-white/10 bg-bg-surface px-4 py-2.5 text-text outline-none transition-colors focus:border-accent"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-text-muted">Tema</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="rounded-lg border border-white/10 bg-bg-surface px-4 py-2.5 text-text outline-none focus:border-accent"
                >
                  <option value="default">Default (Fraunces, cyan)</option>
                  <option value="sunset">Sunset (röd)</option>
                  <option value="editorial">Editorial (guld)</option>
                  <option value="forest">Forest (grön)</option>
                  <option value="minimal">Minimal (svart/vit)</option>
                  <option value="retro_futurism">Retro Futurism</option>
                  <option value="omtnk">Omtnk (teal — example)</option>
                  <option value="karlskrona">Karlskrona (konjak — example)</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="text-text-muted">
                  Taggar{" "}
                  <span className="text-xs">(komma-separerade — hjälper dig hitta)</span>
                </span>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="t.ex. pitch, extern, workshop"
                  className="rounded-lg border border-white/10 bg-bg-surface px-4 py-2.5 text-text outline-none focus:border-accent"
                />
                {existingTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {existingTags.slice(0, 12).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => {
                          const current = tagsInput
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          if (current.includes(t)) return;
                          setTagsInput(
                            current.length
                              ? `${current.join(", ")}, ${t}`
                              : t
                          );
                        }}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-text-muted hover:border-accent hover:text-accent"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </label>

              {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-text"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={busy || !title.trim()}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg transition-all hover:shadow-[0_0_30px_-5px_var(--accent)] disabled:opacity-50"
                >
                  {busy ? "Skapar…" : "Skapa + redigera"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
