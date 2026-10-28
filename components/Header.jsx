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
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-300 via-brand-400 to-lilac-300 text-xl shadow-md shadow-brand-200 transition group-hover:rotate-6"
          >
            🌍
          </span>
          <div>
            <Title className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Country Explorer
            </Title>
            <p className="text-xs text-slate-600 sm:text-sm">
              explore the world, one flag at a time ✿
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="flex gap-1 rounded-full bg-brand-50 p-1 text-sm font-semibold">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 transition ${
                    active ? "bg-white text-brand-700 shadow-sm shadow-brand-100" : "text-slate-600 hover:text-slate-900"
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
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                favoritesOnly
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-brand-100 text-slate-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              <span aria-hidden="true">♥</span>
              <span className="hidden sm:inline">Favourites</span>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {favCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
