interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-xl font-bold text-teal-800">
        +
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {(actionLabel || secondaryLabel) && (
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          {actionLabel && onAction && (
            <button className="btn btn-primary" type="button" onClick={onAction}>
              {actionLabel}
            </button>
          )}
          {secondaryLabel && onSecondaryAction && (
            <button className="btn btn-secondary" type="button" onClick={onSecondaryAction}>
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
