export default function CountryCard({ country }) {
  const languages = country.languages.length ? country.languages.join(", ") : "—";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[3/2] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={country.flag}
          alt={`Flag of ${country.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h2 className="truncate text-base font-semibold text-slate-900" title={country.name}>
            {country.name}
          </h2>
          <p className="truncate text-xs text-slate-500" title={country.nativeName}>
            {country.nativeName || " "}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Capital</dt>
            <dd className="truncate font-medium text-slate-700" title={country.capital}>
              {country.capital}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Currency</dt>
            <dd className="truncate font-medium text-slate-700" title={country.currency}>
              {country.currency}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">Languages</dt>
            <dd className="truncate font-medium text-slate-700" title={languages}>
              {languages}
            </dd>
          </div>
        </dl>
        <span className="inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
          {country.continent}
        </span>
      </div>
    </article>
  );
}
