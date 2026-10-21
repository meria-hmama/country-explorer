const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"];

const SORTS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "pop-desc", label: "Population (high → low)" },
  { value: "pop-asc", label: "Population (low → high)" },
];

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60";

export default function Toolbar({ query, onQuery, region, onRegion, sort, onSort, disabled }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <label className="relative block">
        <span className="sr-only">Search countries</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by country or capital…"
          disabled={disabled}
          className={`${fieldClass} pl-11`}
        />
      </label>

      <label className="block">
        <span className="sr-only">Filter by region</span>
        <select
          value={region}
          onChange={(e) => onRegion(e.target.value)}
          disabled={disabled}
          className={`${fieldClass} sm:w-44`}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "All" ? "All regions" : r}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="sr-only">Sort countries</span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          disabled={disabled}
          className={`${fieldClass} sm:w-56`}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
