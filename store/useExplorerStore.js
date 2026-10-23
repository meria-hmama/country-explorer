"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { fetchCountries } from "@/lib/countriesApi";

// One store for the whole app, split into three "slices":
//   countries -> the API data and its loading/error status
//   filters   -> search text, continent, sort order, favourites-only toggle
//   favorites -> ids of starred countries (saved in localStorage)
//
// Components read only the pieces they need with a selector, e.g.
//   const region = useExplorerStore((s) => s.region);
// so they re-render only when that piece changes, and nothing has to be
// passed down through props any more.

const DEFAULT_FILTERS = {
  query: "",
  region: "All",
  sort: "name-asc",
  favoritesOnly: false,
};

// kept outside the store because it isn't UI state
let currentRequest = null;

export const useExplorerStore = create(
  persist(
    (set, get) => ({
      // ---- countries slice ----
      status: "idle", // "idle" | "loading" | "success" | "error"
      countries: [],
      error: null,

      loadCountries: async ({ simulateError = false } = {}) => {
        // cancel a request that is still running (e.g. double-clicking Refresh)
        currentRequest?.abort();
        const controller = new AbortController();
        currentRequest = controller;

        set({ status: "loading", error: null });
        try {
          const countries = await fetchCountries({
            simulateError,
            signal: controller.signal,
          });
          set({ status: "success", countries, error: null });
        } catch (err) {
          if (err.aborted) return; // replaced by a newer request
          set({ status: "error", countries: [], error: err.message });
        } finally {
          if (currentRequest === controller) currentRequest = null;
        }
      },

      // only fetch once, even if several components ask for the data
      ensureCountries: () => {
        if (get().status === "idle") get().loadCountries();
      },

      // ---- filters slice ----
      ...DEFAULT_FILTERS,
      setQuery: (query) => set({ query }),
      setRegion: (region) => set({ region }),
      setSort: (sort) => set({ sort }),
      setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
      resetFilters: () => set({ ...DEFAULT_FILTERS, sort: get().sort }),

      // ---- favorites slice ----
      favorites: [],
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      clearFavorites: () => set({ favorites: [], favoritesOnly: false }),
    }),
    {
      name: "country-explorer",
      storage: createJSONStorage(() => localStorage),
      // don't save the API data, just what the user chose
      partialize: (s) => ({ favorites: s.favorites, sort: s.sort }),
      // the server can't see localStorage, so we load it after the first
      // render (see StoreHydration) to avoid a hydration mismatch
      skipHydration: true,
    }
  )
);
