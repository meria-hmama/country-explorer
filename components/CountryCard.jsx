"use client";

import { useState } from "react";
import Link from "next/link";
import { useExplorerStore } from "@/store/useExplorerStore";

export default function CountryCard({ country, priority = false }) {
  const languages = country.languages.length ? country.languages.join(", ") : "—";
  const isFavorite = useExplorerStore((s) => s.favorites.includes(country.id));
  const toggleFavorite = useExplorerStore((s) => s.toggleFavorite);
  const [flagFailed, setFlagFailed] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
        {/* shimmer sits behind the flag, the flag simply covers it once it has loaded.
            (in week 3 the image was hidden with opacity until onLoad fired. lighthouse
            didn't like that: the biggest image on the page stayed invisible for an extra
            second, and with server rendering onLoad can even fire before react is ready).
            the first row of flags loads right away, the other ~246 only when you scroll. */}
        {!flagFailed && (
          <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-slate-200" />
        )}
        {flagFailed ? (
          <div className="grid h-full place-items-center text-xs text-slate-500">
            Flag unavailable
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={country.flag}
            alt={`Flag of ${country.name}`}
            width={320}
            height={213}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            onError={() => setFlagFailed(true)}
            className="relative h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => toggleFavorite(country.id)}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Remove ${country.name} from favourites` : `Add ${country.name} to favourites`}
        className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border bg-white/90 text-lg shadow-sm backdrop-blur transition hover:scale-110 ${
          isFavorite ? "border-amber-300 text-amber-500" : "border-slate-200 text-slate-500"
        }`}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <div className="space-y-3 p-4">
        <div>
          <h2 className="truncate text-base font-semibold text-slate-900" title={country.name}>
            {country.name}
          </h2>
          <p className="truncate text-xs text-slate-500" title={country.nativeName}>
            {country.nativeName || " "}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Capital</dt>
            <dd className="truncate font-medium text-slate-700" title={country.capital}>
              {country.capital}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Currency</dt>
            <dd className="truncate font-medium text-slate-700" title={country.currency}>
              {country.currency}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Languages</dt>
            <dd className="truncate font-medium text-slate-700" title={languages}>
              {languages}
            </dd>
          </div>
        </dl>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {country.continent}
          </span>
          <Link
            href={`/plan?country=${country.id}`}
            aria-label={`Plan a trip to ${country.name}`}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Plan a trip →
          </Link>
        </div>
      </div>
    </article>
  );
}
