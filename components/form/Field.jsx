// label + the input + hint or error underneath.
// the input itself is passed as children so this works for any kind of field.

export const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-brand-50 disabled:opacity-70 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-brand-200 focus:border-brand-500 focus:ring-brand-100"
  }`;

export default function Field({ id, label, optional, hint, error, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-slate-600">optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-red-600">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-600">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

// what to put in aria-describedby for a field
export function describedBy(id, error, hint) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
