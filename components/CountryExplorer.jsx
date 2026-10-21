"use client";

import { useMemo, useState } from "react";
import { useCountries } from "@/hooks/useCountries";
import { useDebounce } from "@/hooks/useDebounce";
import Toolbar from "./Toolbar";
import CountryCard from "./CountryCard";
import SkeletonGrid from "./SkeletonGrid";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

const sorters = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "lang-desc": (a, b) => b.languages.length - a.languages.length || a.name.localeCompare(b.name),
};

export default function CountryExplorer() {
  const { status, data, error, retry, simulateError } = useCountries();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [sort, setSort] = useState("name-asc");
  const debouncedQuery = useDebounce(query.trim().toLowerCase());

  const results = useMemo(() => {
    return data
      .filter((c) => region === "All" || c.continent === region)
      .filter(
        (c) =>
          !debouncedQuery ||
          c.name.toLowerCase().includes(debouncedQuery) ||
          c.nativeName.toLowerCase().includes(debouncedQuery) ||
          c.capital.toLowerCase().includes(debouncedQuery) ||
          c.id.toLowerCase() === debouncedQuery
      )
      .sort(sorters[sort]);
  }, [data, region, debouncedQuery, sort]);

  const resetFilters = () => {
    setQuery("");
    setRegion("All");
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Toolbar
        query={query}
        onQuery={setQuery}
        region={region}
        onRegion={setRegion}
        sort={sort}
        onSort={setSort}
        disabled={status !== "success"}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p aria-live="polite">
          {status === "loading" && "Fetching live data…"}
          {status === "error" && "Data unavailable"}
          {status === "success" && (
            <>
              Showing <strong className="text-slate-800">{results.length}</strong> of{" "}
              {data.length} countries
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={retry}
            disabled={status === "loading"}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={simulateError}
            disabled={status === "loading"}
            title="Calls a broken endpoint so you can see the error state"
            className="rounded-lg border border-dashed border-red-300 bg-white px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            ⚠ Simulate API failure
          </button>
        </div>
      </div>

      {status === "loading" && <SkeletonGrid />}

      {status === "error" && <ErrorState message={error} onRetry={retry} />}

      {status === "success" && results.length === 0 && (
        <EmptyState query={query.trim()} region={region} onReset={resetFilters} />
      )}

      {status === "success" && results.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((c) => (
            <CountryCard key={c.id} country={c} />
          ))}
        </div>
      )}
    </section>
  );
}
