"use client";

import { useEffect, useRef, useState } from "react";
import { useExplorerStore } from "@/store/useExplorerStore";
import { useVisibleCountries } from "@/hooks/useVisibleCountries";
import Toolbar from "./Toolbar";
import StatusBar from "./StatusBar";
import CountryCard from "./CountryCard";
import SkeletonGrid from "./SkeletonGrid";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

// week 5: the server now fetches the countries while building the page and passes
// them in as `initialCountries`, so the cards (and the first flags) are already in
// the HTML instead of only appearing after the JavaScript has loaded and made its
// own request.
//
// my first try was putting them straight into the zustand store during the first
// render. that didn't work: on the server zustand always renders the store's
// *initial* state, so the HTML still only had the skeleton. so now, until the store
// has data, this component simply renders the list it got from the server, and the
// store is filled right after the page becomes interactive.

// rendering all 250 cards at once made the HTML ~540 KB and kept a phone busy for
// a while, so the grid starts with one "page" of cards and adds more as you scroll
const PAGE_SIZE = 24;

export default function CountryExplorer({ initialCountries }) {
  const status = useExplorerStore((s) => s.status);
  const results = useVisibleCountries();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // new search / filter / sort -> start from the top again
  // (not when you star a country, otherwise the list would jump back up)
  const query = useExplorerStore((s) => s.query);
  const region = useExplorerStore((s) => s.region);
  const sort = useExplorerStore((s) => s.sort);
  const favoritesOnly = useExplorerStore((s) => s.favoritesOnly);
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [query, region, sort, favoritesOnly]);

  useEffect(() => {
    const store = useExplorerStore.getState();
    if (initialCountries?.length && store.status === "idle") {
      useExplorerStore.setState({ status: "success", countries: initialCountries, error: null });
    } else {
      store.ensureCountries();
    }
  }, [initialCountries]);

  // server HTML + first render in the browser: use what the server gave us
  const usingServerData = status === "idle" && initialCountries?.length > 0;
  const cards = usingServerData ? initialCountries : results;
  const isLoading = !usingServerData && (status === "idle" || status === "loading");
  const hasMore = cards.length > limit;

  // when the empty div under the grid comes near the screen, show the next page
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setLimit((l) => l + PAGE_SIZE),
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, limit]);

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Toolbar />
      <StatusBar initialCount={usingServerData ? initialCountries.length : null} />

      {isLoading && <SkeletonGrid />}

      {status === "error" && <ErrorState />}

      {status === "success" && results.length === 0 && <EmptyState />}

      {(usingServerData || status === "success") && cards.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.slice(0, limit).map((c, i) => (
              // the first row is visible straight away, so those flags load first
              <CountryCard key={c.id} country={c} priority={i < 4} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center pt-2">
              {/* the observer normally does this by itself, the button is a fallback */}
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                className="rounded-xl border border-brand-100 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600"
              >
                Show more countries ({cards.length - limit} left)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
