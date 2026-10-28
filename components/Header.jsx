"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExplorerStore } from "@/store/useExplorerStore";

const LINKS = [
  { href: "/", label: "Explore" },
  { href: "/plan", label: "Plan a trip" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const favCount = useExplorerStore((s) => s.favorites.length);
  const favoritesOnly = useExplorerStore((s) => s.favoritesOnly);
  const setFavoritesOnly = useExplorerStore((s) => s.setFavoritesOnly);

  // the plan page has its own <h1>, so the app name is only the h1 on the home page
  const Title = isHome ? "h1" : "p";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white"
          >
            🌍
          </span>
          <div>
            <Title className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Country Explorer
            </Title>
            <p className="text-xs text-slate-500 sm:text-sm">
              Live data from the Countries GraphQL API
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* the favourites filter only makes sense next to the country grid */}
          {isHome && (
            <button
              type="button"
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              aria-pressed={favoritesOnly}
              aria-label={`Show favourites only (${favCount})`}
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
          )}
        </div>
      </div>
    </header>
  );
}
