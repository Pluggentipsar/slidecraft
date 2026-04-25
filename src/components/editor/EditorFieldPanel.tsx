"use client";

import { useMemo, useState } from "react";
import type { ParsedComponent, PropValue } from "@/lib/mdx-parser";
import { getTemplateSchema, type FieldSchema } from "@/lib/template-schemas";
import { FieldInput } from "./FieldInput";
import { SizePills } from "./SizePills";
import { SubComponentList } from "./SubComponentList";

/**
 * Avgör om ett fält är ett storleks-fält och vilket bas-fält det hör till.
 * - "titleSize" → bas "title"
 * - "size" (standalone) → specialbas "__content__" om template har hasContent,
 *    annars "__firsttext__" (första text/multiline-fältet).
 */
function resolveSizeTarget(
  sizeFieldName: string,
  allFields: FieldSchema[],
  hasContent: boolean
): string | null {
  if (sizeFieldName === "size") {
    if (hasContent) return "__content__";
    // annars paira med första text/multiline-fältet
    const firstText = allFields.find(
      (f) => (f.type === "text" || f.type === "multiline") && f.name !== "size"
    );
    return firstText ? firstText.name : null;
  }
  const match = /^(.+)Size$/.exec(sizeFieldName);
  if (!match) return null;
  const base = match[1];
  if (allFields.some((f) => f.name === base)) return base;
  // "bulletSize" har ingen prop "bullet" men paras med content
  if (hasContent) return "__content__";
  return null;
}

interface EditorFieldPanelProps {
  slide: ParsedComponent;
  frontmatter: Record<string, unknown>;
  onUpdateProps: (update: Record<string, PropValue>) => void;
  onUpdateContent: (content: string) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateFrontmatter: (key: string, value: unknown) => void;
  // Children mutations (för Timeline/Comparison)
  onUpdateChildProps: (index: number, update: Record<string, PropValue>) => void;
  onUpdateChildContent: (index: number, content: string) => void;
  onAddChild: () => void;
  onRemoveChild: (index: number) => void;
  onMoveChild: (from: number, to: number) => void;
}

export function EditorFieldPanel({
  slide,
  frontmatter,
  onUpdateProps,
  onUpdateContent,
  onUpdateNotes,
  onUpdateFrontmatter,
  onUpdateChildProps,
  onUpdateChildContent,
  onAddChild,
  onRemoveChild,
  onMoveChild,
}: EditorFieldPanelProps) {
  const schema = useMemo(() => getTemplateSchema(slide.tag), [slide.tag]);
  const [fmOpen, setFmOpen] = useState(false);

  // Bygg mappning: bas-fält → pills-kontroll (för storleks-fält)
  const { baseFields, sizePairs, sizeForContent } = useMemo(() => {
    if (!schema) {
      return {
        baseFields: [] as FieldSchema[],
        sizePairs: new Map<string, FieldSchema>(),
        sizeForContent: undefined as FieldSchema | undefined,
      };
    }
    const pairs = new Map<string, FieldSchema>();
    let contentSize: FieldSchema | undefined;
    const bases: FieldSchema[] = [];

    for (const f of schema.fields) {
      const isSize = f.variant === "pills" || /Size$/.test(f.name) || f.name === "size";
      if (!isSize) {
        bases.push(f);
        continue;
      }
      const target = resolveSizeTarget(f.name, schema.fields, !!schema.hasContent);
      if (target === "__content__") {
        contentSize = f;
      } else if (target && !pairs.has(target)) {
        pairs.set(target, f);
      } else {
        // ingen target hittad — rendera ändå som vanligt fält i botten
        bases.push(f);
      }
    }
    return { baseFields: bases, sizePairs: pairs, sizeForContent: contentSize };
  }, [schema]);

  if (!schema) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        <p>
          Template <code className="font-mono">{slide.tag}</code> saknar schema.
          Lägg till den i <code className="font-mono">src/lib/template-schemas.ts</code>.
        </p>
      </div>
    );
  }

  function renderFieldsSection() {
    if (baseFields.length === 0) return null;
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-[0.25em] text-text-muted">Fält</h2>
        <div className="flex flex-col gap-4">
          {baseFields.map((field) => {
            const sizeField = sizePairs.get(field.name);
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                {sizeField && (
                  <div className="flex justify-end">
                    <SizePills
                      field={sizeField}
                      value={slide.props[sizeField.name]}
                      onChange={(v) => onUpdateProps({ [sizeField.name]: v })}
                    />
                  </div>
                )}
                <FieldInput
                  field={field}
                  value={slide.props[field.name]}
                  onChange={(value) => onUpdateProps({ [field.name]: value })}
                />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Template info */}
      <section>
        <div className="mb-1 flex items-center gap-3">
          <span className="rounded-sm border border-accent/30 bg-accent-dim px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-accent">
            {slide.tag}
          </span>
        </div>
        <p className="text-sm text-text-muted">{schema.description}</p>
      </section>

      {/* Fält för props — size-fält pairas med sitt bas-fält */}
      {renderFieldsSection()}

      {/* Nested children (Timeline → TimelineEvent, Comparison → ComparisonColumn) */}
      {schema.childrenType && schema.childrenType !== "slot" && (
        <SubComponentList
          children={slide.children}
          childTag={schema.childrenType}
          onUpdateChild={onUpdateChildProps}
          onUpdateChildContent={onUpdateChildContent}
          onAddChild={onAddChild}
          onRemoveChild={onRemoveChild}
          onMoveChild={onMoveChild}
        />
      )}

      {/* Content (för templates som har children) */}
      {schema.hasContent && (
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-text-muted">
              Innehåll (markdown)
            </label>
            {sizeForContent && (
              <SizePills
                field={sizeForContent}
                value={slide.props[sizeForContent.name]}
                onChange={(v) => onUpdateProps({ [sizeForContent.name]: v })}
              />
            )}
          </div>
          <textarea
            value={slide.content ?? ""}
            onChange={(e) => onUpdateContent(e.target.value)}
            rows={10}
            spellCheck={false}
            className="rounded-md border border-white/10 bg-bg-surface/60 p-3 font-mono text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:outline-none"
            placeholder="Markdown-innehåll, tex punktlista med -"
          />
          <p className="text-xs text-text-muted">
            Tips: använd <code className="font-mono">-</code> för punktlista,{" "}
            <code className="font-mono">**fet**</code> för accent-färg.
          </p>
        </section>
      )}

      {/* Notes */}
      <section className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.25em] text-text-muted">
          Speaker notes
        </label>
        <textarea
          value={slide.notes ?? ""}
          onChange={(e) => onUpdateNotes(e.target.value)}
          rows={6}
          spellCheck
          className="rounded-md border border-white/10 bg-bg-surface/60 p-3 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:outline-none"
          placeholder="Anteckningar som bara du ser under presentationen..."
        />
      </section>

      {/* Kollapsbar frontmatter-panel (sällan-redigerad meta: titel, event, datum, tema) */}
      <section className="flex flex-col gap-3 border-t border-white/5 pt-4">
        <button
          onClick={() => setFmOpen((v) => !v)}
          className="flex items-center justify-between gap-2 text-left text-xs uppercase tracking-[0.25em] text-text-muted transition-colors hover:text-accent"
          aria-expanded={fmOpen}
        >
          <span>Presentation (meta &amp; tema)</span>
          <span className="font-mono text-[0.7rem] opacity-60">{fmOpen ? "▾" : "▸"}</span>
        </button>
        {fmOpen && (
          <div className="flex flex-col gap-4">
            <FrontmatterField
              label="Titel"
              value={(frontmatter.title as string) ?? ""}
              onChange={(v) => onUpdateFrontmatter("title", v)}
            />
            <FrontmatterField
              label="Event"
              value={(frontmatter.event as string) ?? ""}
              onChange={(v) => onUpdateFrontmatter("event", v)}
            />
            <FrontmatterField
              label="Datum"
              value={(frontmatter.date as string) ?? ""}
              onChange={(v) => onUpdateFrontmatter("date", v)}
            />
            <FrontmatterField
              label="Beskrivning"
              value={(frontmatter.description as string) ?? ""}
              onChange={(v) => onUpdateFrontmatter("description", v)}
              multiline
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text">Tema</label>
              <select
                value={(frontmatter.theme as string) ?? "default"}
                onChange={(e) => onUpdateFrontmatter("theme", e.target.value)}
                className="rounded-md border border-white/10 bg-bg-surface/60 p-2 text-sm text-text focus:border-accent focus:outline-none"
              >
                <option value="default">Default (Fraunces, cyan)</option>
                <option value="sunset">Sunset (Playfair, röd)</option>
                <option value="editorial">Editorial (Instrument Serif, guld)</option>
                <option value="forest">Forest (Fraunces, grön)</option>
                <option value="minimal">Minimal (Inter, svart/vit)</option>
                <option value="retro_futurism">Retro Futurism (magenta)</option>
                <option value="omtnk">Omtnk (teal, mint)</option>
              </select>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function FrontmatterField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="rounded-md border border-white/10 bg-bg-surface/60 p-2 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-md border border-white/10 bg-bg-surface/60 p-2 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:outline-none"
        />
      )}
    </div>
  );
}
