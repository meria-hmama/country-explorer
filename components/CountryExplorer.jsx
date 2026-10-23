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

export default function CountryExplorer() {
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
          {results.map((c) => (
            <CountryCard key={c.id} country={c} />
          ))}
        </div>
      )}
    </section>
  );
}
