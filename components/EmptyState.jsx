export default function EmptyState({ query, region, onReset }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div aria-hidden="true" className="text-4xl">
        🗺️
      </div>
      <h2 className="mt-3 text-lg font-semibold text-slate-800">No countries found</h2>
      <p className="mt-2 text-sm text-slate-500">
        Nothing matches
        {query ? <> &ldquo;<strong className="text-slate-700">{query}</strong>&rdquo;</> : null}
        {region !== "All" ? <> in <strong className="text-slate-700">{region}</strong></> : null}.
        Try a different search or continent.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
      >
        Clear filters
      </button>
    </div>
  );
}
