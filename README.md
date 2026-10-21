# Country Explorer

A small app I built for week 2 of my frontend internship at Zenvio Solutions. The goal this week was to work with a real public API, so I made something that loads every country in the world and lets you search and filter through them.

Live version: https://country-explorer-wheat-phi.vercel.app

## What it does

- Loads all 250 countries and shows them as cards with the flag, native name, capital, currency, languages and continent
- You can search by country name, native name or capital, filter by continent, and sort the list
- While the data is loading you see placeholder cards instead of a blank page
- If the request fails you get a short explanation and a "Try again" button
- If your search doesn't match anything, it tells you and lets you clear the filters

There's also a "Simulate API failure" button above the grid. It calls an endpoint that doesn't exist, which was the easiest way I found to show the error screen without unplugging my internet. (Switching the Network tab in DevTools to "Offline" and hitting Refresh works too.)

## The API

Data comes from the [Countries GraphQL API](https://github.com/trevorblades/countries) by Trevor Blades. It's free and doesn't need a key. Flag images come from [flagcdn.com](https://flagcdn.com).

I actually started with REST Countries, but halfway through the week their old endpoints (v1 to v4) were shut down and the new v5 needs an account and an API key. Since this is a frontend-only app, any key I put in the code would be visible to everyone, so I switched APIs instead. Funnily enough that was a pretty good real-world test of the error state.

It was also my first time calling a GraphQL API with plain `fetch`. The main surprise was that GraphQL can return a `200 OK` and still have an `errors` array in the body, so I check for that too instead of only looking at the status code.

## How it's organised

```
app/           layout, page and global styles
components/    the UI pieces (cards, toolbar, loading / error / empty states)
hooks/         useCountries (fetching) and useDebounce (for the search box)
lib/           the actual API call and error handling
```

I tried to keep the fetching logic out of the components. `lib/countriesApi.js` does the request, turns errors into readable messages and cleans up the data. `hooks/useCountries.js` keeps track of whether we're loading, done, or failed. The components just render whatever state they're given, which made the loading/error/empty screens a lot easier to reason about.

A couple of other small things:

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
