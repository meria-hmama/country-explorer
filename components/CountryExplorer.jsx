"use client";

import { useEffect } from "react";
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

export default function CountryExplorer({ initialCountries }) {
  const status = useExplorerStore((s) => s.status);
  const results = useVisibleCountries();

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

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Toolbar />
      <StatusBar initialCount={usingServerData ? initialCountries.length : null} />

      {isLoading && <SkeletonGrid />}

      {status === "error" && <ErrorState />}

      {status === "success" && results.length === 0 && <EmptyState />}

      {(usingServerData || status === "success") && cards.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((c, i) => (
            // the first row is visible straight away, so those flags load first
            <CountryCard key={c.id} country={c} priority={i < 4} />
          ))}
        </div>
      )}
    </section>
  );
}
