"use client";

import { useEffect, useState } from "react";
import { useExplorerStore } from "@/store/useExplorerStore";
import { useVisibleCountries } from "@/hooks/useVisibleCountries";
import Toolbar from "./Toolbar";
import StatusBar from "./StatusBar";
import CountryCard from "./CountryCard";
import SkeletonGrid from "./SkeletonGrid";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

// week 5: the server now fetches the countries while building the page, so the
// cards (and the first flags) are already in the HTML instead of appearing only
// after the JavaScript has loaded and made its own request.
function seedStore(initialCountries) {
  if (initialCountries?.length && useExplorerStore.getState().status === "idle") {
    useExplorerStore.setState({ status: "success", countries: initialCountries, error: null });
  }
}

export default function CountryExplorer({ initialCountries }) {
  // runs once, before the first render, so server and browser render the same thing
  useState(() => seedStore(initialCountries));

  const status = useExplorerStore((s) => s.status);
  const ensureCountries = useExplorerStore((s) => s.ensureCountries);
  const results = useVisibleCountries();

  useEffect(() => {
    ensureCountries();
  }, [ensureCountries]);

  const isLoading = status === "idle" || status === "loading";

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Toolbar />
      <StatusBar />

      {isLoading && <SkeletonGrid />}

      {status === "error" && <ErrorState />}

      {status === "success" && results.length === 0 && <EmptyState />}

      {status === "success" && results.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((c, i) => (
            // the first row is visible straight away, so those flags load first
            <CountryCard key={c.id} country={c} priority={i < 4} />
          ))}
        </div>
      )}
    </section>
  );
}
