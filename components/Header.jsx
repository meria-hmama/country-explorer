export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-lg font-bold text-white"
          >
            🌍
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Country Explorer
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Live data from the Countries GraphQL API
            </p>
          </div>
        </div>
        <a
          href="https://github.com/trevorblades/countries"
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600 sm:inline-block"
        >
          API docs ↗
        </a>
      </div>
    </header>
  );
}
