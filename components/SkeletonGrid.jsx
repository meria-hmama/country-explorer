export default function SkeletonGrid({ count = 12 }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <span className="sr-only">Loading countries…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-[3/2] bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-8 rounded bg-slate-100" />
              <div className="h-8 rounded bg-slate-100" />
            </div>
            <div className="h-5 w-24 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
