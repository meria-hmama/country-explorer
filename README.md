# Country Explorer

A small app I built for my frontend internship at Zenvio Solutions. In week 2 the goal was to work with a real public API, so I made something that loads every country in the world and lets you search and filter through them. In week 3 I moved its state into a global Zustand store and added favourites (see below).

Live version: https://country-explorer-wheat-phi.vercel.app

## What it does

- Loads all 250 countries and shows them as cards with the flag, native name, capital, currency, languages and continent
- You can search by country name, native name or capital, filter by continent, and sort the list
- While the data is loading you see placeholder cards instead of a blank page
- If the request fails you get a short explanation and a "Try again" button
- If your search doesn't match anything, it tells you and lets you clear the filters
- You can star countries as favourites; they stay saved when you come back

There's also a "Simulate API failure" button above the grid. It calls an endpoint that doesn't exist, which was the easiest way I found to show the error screen without unplugging my internet. (Switching the Network tab in DevTools to "Offline" and hitting Refresh works too.)

## The API

Data comes from the [Countries GraphQL API](https://github.com/trevorblades/countries) by Trevor Blades. It's free and doesn't need a key. Flag images come from [flagcdn.com](https://flagcdn.com).

I actually started with REST Countries, but halfway through the week their old endpoints (v1 to v4) were shut down and the new v5 needs an account and an API key. Since this is a frontend-only app, any key I put in the code would be visible to everyone, so I switched APIs instead. Funnily enough that was a pretty good real-world test of the error state.

It was also my first time calling a GraphQL API with plain `fetch`. The main surprise was that GraphQL can return a `200 OK` and still have an `errors` array in the body, so I check for that too instead of only looking at the status code.

## Week 3: global state

In week 2 pretty much everything lived inside `CountryExplorer`: the countries, the search text, the continent, the sort. It then passed around ten props down to the toolbar and the empty/error screens. It worked, but every time I wanted to add something I had to pass yet another prop through, and the header couldn't see any of it because it's outside that component.

So this week I moved all of that into a Zustand store (`store/useExplorerStore.js`). I went with Zustand instead of Redux mostly because the app is small and I didn't want a provider plus actions plus reducers for three pieces of state. Each component just grabs the bit it needs, like `useExplorerStore((s) => s.region)`, and only re-renders when that changes.

The store has three parts:

- the countries: the data from the API, whether it's loading or failed, and `loadCountries()`
- the filters: search, continent, sort and the "favourites only" toggle
- the favourites: the ids of the countries you starred

What I changed:

1. Fetching. I deleted my old `useCountries` hook. Loading the data is now a store action, so Refresh, "Try again" on the error screen and "Simulate API failure" all go through the same `loadCountries()`. If you spam Refresh it cancels the previous request.
2. Search/filter/sort. `Toolbar` and `EmptyState` don't get any props anymore, they read the filters from the store. The filtered list is worked out in `hooks/useVisibleCountries.js`.
3. New: favourites. There's a star on every card, a counter in the header, and a button to only show your favourites. The card and the header are in completely different places in the tree, which is exactly the case where prop drilling gets annoying, and with the store they just stay in sync. Favourites (and your sort choice) are saved in localStorage so they're still there when you come back.

One thing that tripped me up: Next.js renders the page on the server first, where there's no localStorage, so loading favourites straight away caused a hydration mismatch (server says 0 favourites, browser says 3). I fixed it by telling the store to skip hydration and loading the saved data in a `useEffect` after the first render (`StoreHydration.jsx`).

I also went through the loading and empty states again:

- skeleton cards while the data loads, plus a little spinner in the status line and on the Refresh button
- each flag has a grey shimmer until the image actually loads, and says "Flag unavailable" if it fails
- three different empty messages depending on why there's nothing to show: your search matched nothing, you turned on favourites but haven't starred anything, or the API came back with an empty list

## How it's organised

```
app/           layout, page and global styles
store/         the Zustand store (data, filters, favourites)
components/    the UI pieces (header, toolbar, status bar, cards, loading / error / empty states)
hooks/         useVisibleCountries (filtered + sorted list) and useDebounce (for the search box)
lib/           the actual API call and error handling
```

I tried to keep the fetching logic out of the components. `lib/countriesApi.js` does the request, turns errors into readable messages and cleans up the data. The store keeps track of whether we're loading, done, or failed. The components just render whatever is in the store, which made the loading/error/empty screens a lot easier to reason about.

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

Next.js 14, React 18, Zustand and Tailwind CSS. Deployed on Vercel.
