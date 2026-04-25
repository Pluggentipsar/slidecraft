"use client";

import { useState } from "react";
import type { FieldSchema } from "@/lib/template-schemas";
import type { PropValue } from "@/lib/mdx-parser";
import { ImagePicker } from "./ImagePicker";

interface FieldInputProps {
  field: FieldSchema;
  value: PropValue | undefined;
  onChange: (value: PropValue) => void;
}

export function FieldInput({ field, value, onChange }: FieldInputProps) {
  const commonClasses =
    "rounded-md border border-white/10 bg-bg-surface/60 p-2 text-sm text-text placeholder:text-text-muted/40 focus:border-accent focus:outline-none";

  const [pickerOpen, setPickerOpen] = useState(false);

  const renderInput = () => {
    switch (field.type) {
      case "image":
        return (
          <>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={(value as string) ?? ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder ?? "/bilder/... eller klicka Sök"}
                className={`${commonClasses} flex-1`}
              />
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="shrink-0 rounded-md border border-accent/30 bg-accent/10 px-3 text-xs uppercase tracking-wider text-accent transition-all hover:bg-accent/20"
                title="Sök bild på Pexels"
              >
                Sök
              </button>
            </div>
            {typeof value === "string" && value.startsWith("/bilder/") && (
              <div className="mt-1.5 overflow-hidden rounded border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Förhandsvisning"
                  className="h-24 w-full object-cover"
                />
              </div>
            )}
            <ImagePicker
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onPick={(localPath) => onChange(localPath)}
              initialQuery=""
            />
          </>
        );

      case "text":
        return (
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        );

      case "multiline":
        return (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`${commonClasses} resize-y`}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value === undefined ? "" : String(value)}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? "" : parseFloat(v));
            }}
            step="any"
            placeholder={field.placeholder}
            className={commonClasses}
          />
        );

      case "select":
        return (
          <select
            value={(value as string) ?? field.default ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "boolean":
        return (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 accent-cyan-500"
            />
            <span className="text-text-muted">Aktiverad</span>
          </label>
        );

      case "color":
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#06b6d4 eller var(--accent)"
              className={`${commonClasses} flex-1`}
            />
            {typeof value === "string" && value.startsWith("#") && (
              <div
                className="h-8 w-8 flex-shrink-0 rounded border border-white/10"
                style={{ background: value }}
              />
            )}
          </div>
        );

      case "list":
        return (
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? "komma-separerat"}
            rows={3}
            className={`${commonClasses} font-mono`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={commonClasses}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-text">
          {field.label}
          {field.required && <span className="ml-1 text-accent">*</span>}
        </label>
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-text-muted/60">
          {field.name}
        </span>
      </div>
      {renderInput()}
      {field.hint && <p className="text-xs text-text-muted">{field.hint}</p>}
    </div>
  );
}
