"use client";

import { useExplorerStore } from "@/store/useExplorerStore";

const REGIONS = [
  "All",
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

const SORTS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "lang-desc", label: "Most languages" },
];

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60";

export default function Toolbar() {
  const query = useExplorerStore((s) => s.query);
  const region = useExplorerStore((s) => s.region);
  const sort = useExplorerStore((s) => s.sort);
  const favoritesOnly = useExplorerStore((s) => s.favoritesOnly);
  const disabled = useExplorerStore((s) => s.status !== "success");
  const { setQuery, setRegion, setSort, setFavoritesOnly } = useExplorerStore.getState();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
      <label className="relative block sm:col-span-2 lg:col-span-1">
        <span className="sr-only">Search countries</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by country or capital…"
          disabled={disabled}
          className={`${fieldClass} pl-11`}
        />
      </label>

      <label className="block">
        <span className="sr-only">Filter by continent</span>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          disabled={disabled}
          className={`${fieldClass} lg:w-44`}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === "All" ? "All continents" : r}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="sr-only">Sort countries</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          disabled={disabled}
          className={`${fieldClass} lg:w-44`}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        aria-pressed={favoritesOnly}
        onClick={() => setFavoritesOnly(!favoritesOnly)}
        disabled={disabled}
        className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 lg:col-span-1 ${
          favoritesOnly
            ? "border-amber-400 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-700"
        }`}
      >
        {favoritesOnly ? "★" : "☆"} Favourites only
      </button>
    </div>
  );
}
