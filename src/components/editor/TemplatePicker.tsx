"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSlideTemplates } from "@/lib/template-schemas";

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (tag: string) => void;
}

/**
 * Grid-överlägg där användaren väljer template för ny slide.
 * Grupperar i kategorier baserat på namn-matchning.
 */
export function TemplatePicker({ open, onClose, onPick }: TemplatePickerProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const templates = getSlideTemplates();
  const q = query.trim().toLowerCase();
  const filtered = q
    ? templates.filter(
        (t) =>
          t.tag.toLowerCase().includes(q) ||
          t.schema.description.toLowerCase().includes(q)
      )
    : templates;

  const handlePick = (tag: string) => {
    onPick(tag);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" aria-hidden />
          <motion.div
            className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-8 md:p-12"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-accent">Ny slide</div>
                <div className="mt-1 text-sm text-text-muted">
                  Välj template · esc avbryter
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-text-muted transition-all hover:border-accent hover:text-accent"
              >
                Avbryt
              </button>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="Sök template..."
              className="rounded-md border border-white/10 bg-bg-surface/60 px-4 py-3 text-sm text-text placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(({ tag, schema }) => (
                <button
                  key={tag}
                  onClick={() => handlePick(tag)}
                  className="group flex flex-col gap-2 rounded-lg border border-white/10 bg-bg-surface/40 p-4 text-left transition-all hover:border-accent hover:bg-bg-surface"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-accent">
                      {tag}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">{schema.description}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full rounded-lg border border-white/5 bg-bg-surface/20 p-8 text-center text-sm text-text-muted">
                  Ingen template matchade &quot;{query}&quot;
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
