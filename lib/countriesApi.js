// set in .env.local / on Vercel, falls back to the public API so it also works without one
export const API_URL =
  process.env.NEXT_PUBLIC_COUNTRIES_API_URL || "https://countries.trevorblades.com/graphql";

// wrong on purpose - used by the "Simulate API failure" button
const BROKEN_URL = new URL("/this-does-not-exist", API_URL).toString();

const QUERY = `{
  countries {
    code
    name
    native
    capital
    currency
    continent { name }
    languages { name }
  }
}`;

const TIMEOUT_MS = 10000;

// map whatever went wrong to something readable
function toFriendlyError(err, status) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You appear to be offline. Check your internet connection and try again.";
  }
  if (err?.name === "AbortError") {
    return "The server took too long to respond. Please try again in a moment.";
  }
  if (status === 404) {
    return "We couldn't reach the countries service (404). It may have moved or be down.";
  }
  if (status === 429) {
    return "Too many requests right now. Please wait a few seconds and retry.";
  }
  if (status >= 500) {
    return "The countries service is having trouble right now. Please try again later.";
  }
  return "Something went wrong while loading countries. Please try again.";
}

// flatten the API response so the components don't have to dig through it
function normalise(raw) {
  return raw
    .map((c) => ({
      id: c.code,
      name: c.name,
      nativeName: c.native && c.native !== c.name ? c.native : "",
      flag: `https://flagcdn.com/w320/${c.code.toLowerCase()}.png`,
      capital: c.capital || "—",
      currency: c.currency ? c.currency.split(",").join(", ") : "—",
      languages: c.languages.map((l) => l.name),
      continent: c.continent?.name || "Other",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// `next` is only used on the server (next.js caching), the browser ignores it
export async function fetchCountries({ simulateError = false, signal, next } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  // also stop if the component unmounts
  signal?.addEventListener("abort", () => controller.abort());

  let status;
  try {
    const res = await fetch(simulateError ? BROKEN_URL : API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY }),
      signal: controller.signal,
      next,
    });
    status = res.status;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // GraphQL can answer 200 and still put errors in the body
    if (json.errors?.length || !Array.isArray(json.data?.countries)) {
      throw new Error(json.errors?.[0]?.message || "Unexpected response");
    }
    return normalise(json.data.countries);
  } catch (err) {
    const friendly = new Error(toFriendlyError(err, status));
    friendly.cause = err;
    friendly.aborted = signal?.aborted ?? false;
    throw friendly;
  } finally {
    clearTimeout(timer);
  }
}
