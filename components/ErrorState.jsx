"use client";

import { useExplorerStore } from "@/store/useExplorerStore";

export default function ErrorState() {
  const message = useExplorerStore((s) => s.error);
  const loadCountries = useExplorerStore((s) => s.loadCountries);

  return (
    <div
      role="alert"
      className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
    >
      <div aria-hidden="true" className="text-4xl">
        😕
      </div>
      <h2 className="mt-3 text-lg font-semibold text-red-800">We couldn&apos;t load the countries</h2>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      <button
        type="button"
        onClick={() => loadCountries()}
        className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
      >
        Try again
      </button>
    </div>
  );
}
