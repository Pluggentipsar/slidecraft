"use client";

interface SlideActionsProps {
  activeIndex: number;
  total: number;
  onAddAfter: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * CRUD-knappar för aktiv slide. Placeras högst upp i fält-panelen.
 */
export function SlideActions({
  activeIndex,
  total,
  onAddAfter,
  onDuplicate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SlideActionsProps) {
  const canMoveUp = activeIndex > 0;
  const canMoveDown = activeIndex < total - 1;
  const canRemove = total > 1;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-white/5 bg-bg-surface/30 p-1.5">
      <ActionButton onClick={onMoveUp} disabled={!canMoveUp} title="Flytta upp">
        ↑
      </ActionButton>
      <ActionButton onClick={onMoveDown} disabled={!canMoveDown} title="Flytta ner">
        ↓
      </ActionButton>
      <div className="mx-1 h-5 w-px bg-white/10" />
      <ActionButton onClick={onDuplicate} title="Duplicera">
        Duplicera
      </ActionButton>
      <ActionButton onClick={onAddAfter} title="Ny slide efter" accent>
        + Ny slide
      </ActionButton>
      <div className="mx-1 h-5 w-px bg-white/10" />
      <ActionButton
        onClick={onRemove}
        disabled={!canRemove}
        title="Ta bort (kan inte ångras)"
        danger
      >
        Ta bort
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  title,
  accent,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const base =
    "rounded px-2.5 py-1 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-30";
  const variant = accent
    ? "border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
    : danger
      ? "border border-white/10 text-text-muted hover:border-red-400/40 hover:text-red-300"
      : "border border-white/10 text-text-muted hover:border-white/30 hover:text-text";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${variant}`}
    >
      {children}
    </button>
  );
}
