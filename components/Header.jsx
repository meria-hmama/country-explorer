"use client";

import { useExplorerStore } from "@/store/useExplorerStore";

export default function Header() {
  const favCount = useExplorerStore((s) => s.favorites.length);
  const favoritesOnly = useExplorerStore((s) => s.favoritesOnly);
  const setFavoritesOnly = useExplorerStore((s) => s.setFavoritesOnly);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white"
          >
            🌍
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Country Explorer
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Live data from the Countries GraphQL API
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            aria-pressed={favoritesOnly}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              favoritesOnly
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-700"
            }`}
          >
            <span aria-hidden="true">★</span>
            <span className="hidden sm:inline">Favourites</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {favCount}
            </span>
          </button>
          <a
            href="https://github.com/trevorblades/countries"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600 md:inline-block"
          >
            API docs ↗
          </a>
        </div>
      </div>
    </header>
  );
}
