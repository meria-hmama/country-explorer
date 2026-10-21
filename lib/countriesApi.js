const API_URL =
  "https://restcountries.com/v3.1/all?fields=name,cca3,flags,population,region,subregion,capital";

// wrong on purpose - used by the "Simulate API failure" button
const BROKEN_URL = "https://restcountries.com/v3.1/this-endpoint-does-not-exist";

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
    return "We couldn't find the country data (404). The service may have changed.";
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
      id: c.cca3,
      name: c.name?.common ?? "Unknown",
      officialName: c.name?.official ?? "",
      flag: c.flags?.svg || c.flags?.png || "",
      flagAlt: c.flags?.alt || `Flag of ${c.name?.common ?? "country"}`,
      population: c.population ?? 0,
      region: c.region || "Other",
      subregion: c.subregion || "",
      capital: c.capital?.[0] || "—",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCountries({ simulateError = false, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  // also stop if the component unmounts
  signal?.addEventListener("abort", () => controller.abort());

  let status;
  try {
    const res = await fetch(simulateError ? BROKEN_URL : API_URL, {
      signal: controller.signal,
    });
    status = res.status;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Unexpected response shape");
    return normalise(data);
  } catch (err) {
    const friendly = new Error(toFriendlyError(err, status));
    friendly.cause = err;
    friendly.aborted = signal?.aborted ?? false;
    throw friendly;
  } finally {
    clearTimeout(timer);
  }
}
