"use client";

import { useExplorerStore } from "@/store/useExplorerStore";

function Shell({ icon, title, children, action }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div aria-hidden="true" className="text-4xl">
        {icon}
      </div>
      <h2 className="mt-3 text-lg font-semibold text-slate-800">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{children}</p>
      {action}
    </div>
  );
}

const buttonClass =
  "mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600";

// Picks the right "nothing to show" message for the current situation.
export default function EmptyState() {
  const total = useExplorerStore((s) => s.countries.length);
  const query = useExplorerStore((s) => s.query.trim());
  const region = useExplorerStore((s) => s.region);
  const favoritesOnly = useExplorerStore((s) => s.favoritesOnly);
  const favCount = useExplorerStore((s) => s.favorites.length);
  const { resetFilters, loadCountries, setFavoritesOnly } = useExplorerStore.getState();

  // 1. the API answered but sent back zero countries
  if (total === 0) {
    return (
      <Shell
        icon="📭"
        title="No countries came back"
        action={
          <button type="button" onClick={() => loadCountries()} className={buttonClass}>
            Reload data
          </button>
        }
      >
        The API responded, but the list was empty. This is usually temporary.
      </Shell>
    );
  }

  // 2. favourites view, but nothing has been starred yet
  if (favoritesOnly && favCount === 0) {
    return (
      <Shell
        icon="⭐"
        title="No favourites yet"
        action={
          <button type="button" onClick={() => setFavoritesOnly(false)} className={buttonClass}>
            Browse all countries
          </button>
        }
      >
        Tap the ☆ on any country card to save it here. Your favourites are kept on this device.
      </Shell>
    );
  }

  // 3. search / filters don't match anything
  return (
    <Shell
      icon="🗺️"
      title="No countries found"
      action={
        <button type="button" onClick={resetFilters} className={buttonClass}>
          Clear filters
        </button>
      }
    >
      Nothing matches
      {query ? <> &ldquo;<strong className="text-slate-700">{query}</strong>&rdquo;</> : null}
      {region !== "All" ? <> in <strong className="text-slate-700">{region}</strong></> : null}
      {favoritesOnly ? <> among your favourites</> : null}. Try a different search or continent.
    </Shell>
  );
}
