"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { fetchCountries } from "@/lib/countriesApi";

// whole app state in one place: countries, filters, favourites

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
      // loaded in StoreHydration instead, otherwise next complains about hydration
      skipHydration: true,
    }
  )
);
