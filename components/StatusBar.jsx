"use client";

import { useExplorerStore } from "@/store/useExplorerStore";
import { useVisibleCountries } from "@/hooks/useVisibleCountries";
import Spinner from "./Spinner";

// initialCount: set while the page still shows the list the server rendered
export default function StatusBar({ initialCount = null }) {
  const status = useExplorerStore((s) => s.status);
  const total = useExplorerStore((s) => s.countries.length);
  const loadCountries = useExplorerStore((s) => s.loadCountries);
  const shown = useVisibleCountries().length;

  const isLoading = initialCount === null && (status === "idle" || status === "loading");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
      <p aria-live="polite" className="flex items-center gap-2">
        {isLoading && (
          <>
            <Spinner /> Fetching live data…
          </>
        )}
        {status === "error" && "Data unavailable"}
        {initialCount !== null && (
          <>
            Showing <strong className="text-slate-800">{initialCount}</strong> of {initialCount} countries
          </>
        )}
        {status === "success" && (
          <>
            Showing <strong className="text-slate-800">{shown}</strong> of {total} countries
          </>
        )}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => loadCountries()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
        >
          {isLoading ? <Spinner /> : <span aria-hidden="true">↻</span>} Refresh
        </button>
        <button
          type="button"
          onClick={() => loadCountries({ simulateError: true })}
          disabled={isLoading}
          title="Calls a broken endpoint so you can see the error state"
          className="rounded-lg border border-dashed border-red-300 bg-white px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          ⚠ Simulate API failure
        </button>
      </div>
    </div>
  );
}
