"use client";

import { useEffect, useMemo } from "react";
import { useExplorerStore } from "@/store/useExplorerStore";
import Spinner from "../Spinner";
import { inputClass } from "./Field";

// the countries come from the same store as the explorer page,
// so if you already loaded them there, this doesn't fetch again.
// your starred countries are shown first.

export default function CountrySelect({ id, value, error, disabled, onChange, onBlur, describedById }) {
  const status = useExplorerStore((s) => s.status);
  const countries = useExplorerStore((s) => s.countries);
  const favorites = useExplorerStore((s) => s.favorites);
  const ensureCountries = useExplorerStore((s) => s.ensureCountries);
  const loadCountries = useExplorerStore((s) => s.loadCountries);

  useEffect(() => {
    ensureCountries();
  }, [ensureCountries]);

  const favCountries = useMemo(
    () => countries.filter((c) => favorites.includes(c.id)),
    [countries, favorites]
  );

  const loading = status === "idle" || status === "loading";

  if (status === "error") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <span>Couldn&apos;t load the list of countries.</span>
        <button
          type="button"
          onClick={() => loadCountries()}
          className="rounded-lg bg-white px-3 py-1 font-medium text-red-700 shadow-sm hover:bg-red-100"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        id={id}
        name="country"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled || loading}
        aria-invalid={!!error}
        aria-describedby={describedById}
        className={inputClass(!!error)}
      >
        <option value="">{loading ? "Loading countries…" : "Select a country"}</option>
        {favCountries.length > 0 && (
          <optgroup label="★ Your favourites">
            {favCountries.map((c) => (
              <option key={`fav-${c.id}`} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="All countries">
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </optgroup>
      </select>
      {loading && (
        <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-slate-500">
          <Spinner />
        </span>
      )}
    </div>
  );
}
