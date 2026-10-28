// there's no real backend for this project, so this pretends to be one.
// it waits like a real request would, and can fail on purpose so the
// error toast can be tested (same idea as "Simulate API failure" on the home page).

const FAKE_DELAY_MS = 1800;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function submitTrip(values, { simulateError = false } = {}) {
  // build it like a real multipart upload, so swapping in a real API later
  // is just a fetch(url, { method: "POST", body }) away
  const body = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== "") body.append(key, value);
  }

  await wait(FAKE_DELAY_MS);

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("You seem to be offline, so your trip wasn't sent. Check your connection and try again.");
  }
  if (simulateError) {
    throw new Error("Our server couldn't save your trip right now (error 503). Your answers are still here, just try again.");
  }

  return {
    id: `TRIP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    savedAt: new Date().toISOString(),
  };
}
