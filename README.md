# Country Explorer

A small app I built for week 2 of my frontend internship at Zenvio Solutions. The goal this week was to work with a real public API, so I picked [REST Countries](https://restcountries.com) — it's free, doesn't need a key, and has enough data (flags, capitals, population, regions) to make searching and filtering actually interesting.

Live version: _coming soon_

## What it does

- Loads every country from the API and shows them as cards with the flag, capital, population and region
- You can search by country name or capital, filter by region, and sort by name or population
- While the data is loading you see placeholder cards instead of a blank page
- If the request fails you get a short explanation and a "Try again" button
- If your search doesn't match anything, it tells you and lets you clear the filters

There's also a "Simulate API failure" button above the grid. It calls an endpoint that doesn't exist, which was the easiest way I found to show the error screen without unplugging my internet. (Switching the Network tab in DevTools to "Offline" and hitting Refresh works too.)

## How it's organised

```
app/           layout, page and global styles
components/    the UI pieces (cards, toolbar, loading / error / empty states)
hooks/         useCountries (fetching) and useDebounce (for the search box)
lib/           the actual API call and error handling
```

I tried to keep the fetching logic out of the components. `lib/countriesApi.js` does the request, turns errors into readable messages and cleans up the data. `hooks/useCountries.js` keeps track of whether we're loading, done, or failed. The components just render whatever state they're given, which made the loading/error/empty screens a lot easier to reason about.

A few small things I learned along the way:

- The `/all` endpoint now requires a `fields` parameter, so I only ask for the fields I actually use. It also makes the response much smaller.
- I added a 10 second timeout with `AbortController`, otherwise a slow connection just looks like a stuck loading screen.
- The search is debounced by a quarter of a second so it doesn't re-filter on every single keystroke.

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. No API key or `.env` file needed.

## Built with

Next.js 14, React 18 and Tailwind CSS. Deployed on Vercel.
