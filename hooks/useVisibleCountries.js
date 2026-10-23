"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useExplorerStore } from "@/store/useExplorerStore";
import { useDebounce } from "./useDebounce";

const sorters = {
  "name-asc": (a, b) => a.name.localeCompare(b.name),
  "name-desc": (a, b) => b.name.localeCompare(a.name),
  "lang-desc": (a, b) => b.languages.length - a.languages.length || a.name.localeCompare(b.name),
};

// Derived data: the list after search, continent, favourites and sort are applied.
// Any component can call this without needing the list passed in as a prop.
export function useVisibleCountries() {
  const { countries, query, region, sort, favoritesOnly, favorites } = useExplorerStore(
    useShallow((s) => ({
      countries: s.countries,
      query: s.query,
      region: s.region,
      sort: s.sort,
      favoritesOnly: s.favoritesOnly,
      favorites: s.favorites,
    }))
  );
  const q = useDebounce(query.trim().toLowerCase());

  return useMemo(() => {
    const favSet = new Set(favorites);
    return countries
      .filter((c) => !favoritesOnly || favSet.has(c.id))
      .filter((c) => region === "All" || c.continent === region)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.nativeName.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) ||
          c.id.toLowerCase() === q
      )
      .sort(sorters[sort] ?? sorters["name-asc"]);
  }, [countries, favorites, favoritesOnly, region, q, sort]);
}
