# Country Explorer

A small app I built for my frontend internship at Zenvio Solutions. In week 2 the goal was to work with a real public API, so I made something that loads every country in the world and lets you search and filter through them. In week 3 I moved its state into a global Zustand store and added favourites, and in week 4 I added a "Plan a trip" page with a proper form (both explained below).

Live version: https://country-explorer-meria.vercel.app

## What it does

- Loads all 250 countries and shows them as cards with the flag, native name, capital, currency, languages and continent
- You can search by country name, native name or capital, filter by continent, and sort the list
- While the data is loading you see placeholder cards instead of a blank page
- If the request fails you get a short explanation and a "Try again" button
- If your search doesn't match anything, it tells you and lets you clear the filters
- You can star countries as favourites; they stay saved when you come back
- You can plan a trip to any country with a form that checks everything as you type

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

## Week 4: forms and validation

This week was about forms, so I added a second page, `/plan`, where you can plan a trip to a country. You can get there from the new nav in the header, or from the "Plan a trip →" link on any country card (that one fills in the country for you).

The form has 10 fields:

| Field | Type | What's checked |
| --- | --- | --- |
| Full name | text | required, 2 to 60 characters, only letters, spaces, `-` and `'` |
| Email | email | required, has to look like an email |
| Where to? | dropdown | required. The list comes from the same Zustand store as the home page, and your favourites are shown at the top |
| Leaving on | date | required, can't be in the past |
| Coming back on | date | required, after the departure date, and the trip can't be longer than 60 days |
| Travellers | number | whole number between 1 and 10 |
| Travel style | radio buttons | pick one |
| Trip photo | file | required, JPG / PNG / WebP only, max 2 MB, with a preview |
| Notes | textarea | optional, max 300 characters (with a counter) |
| Checkbox | checkbox | has to be ticked |

### How the validation works

I didn't use a form library this time. I wanted to understand what they actually do for you first, so I wrote it by hand. All the rules are in `lib/tripValidation.js`, and each one returns either an error message or an empty string. The form component only decides *when* to show them:

- nothing is red while you're still typing in a field for the first time. A field only shows its error after you leave it (on blur), or after you press "Save my trip"
- once a field has been touched, its message updates live as you type, so it disappears as soon as you fix it
- when you submit with mistakes, a banner at the top tells you how many fields need fixing, and the page jumps to the first one and puts the cursor in it

I tried to make the messages specific, so not just "invalid field". For example the photo says "That image is 3.4 MB. The limit is 2 MB." and the return date tells you it has to be after you leave.

Two things were trickier than I expected:

1. **Dates and time zones.** The usual trick to get today's date, `new Date().toISOString()`, gives the date in UTC. Tunisia is UTC+1, so between midnight and 1am it would think "today" is still yesterday and let you pick a past date. So I build the `YYYY-MM-DD` string from the local date instead (`todayString()`).
2. **The file input can't be controlled** like a normal input in React (you can't set its value). So I keep the `File` in state, show a preview with `URL.createObjectURL`, and clear the input by hand when you press "Remove". I also revoke the preview URL when the photo changes so it doesn't leak memory.

The picker accepts any image on purpose (`accept="image/*"`), so you can actually choose a GIF and see the "only JPG, PNG or WebP" error.

### Submitting

There's no backend in this project, so `lib/tripApi.js` pretends to be one. It builds a real `FormData` object (so it would be easy to swap in a real `fetch` later), waits about 2 seconds, and returns a trip id.

While it's "sending":

- the submit button is disabled and shows a spinner with "Saving your trip…"
- the whole form is inside a `<fieldset disabled>`, so you can't change anything halfway through
- pressing Enter again doesn't send it twice

After that you get a toast (bottom of the screen on phones, top right on desktop):

- ✅ on success, plus a summary card of your trip with your photo
- ⛔ if it fails, plus a red banner above the form. Your answers stay filled in so you can just try again

To see the error case there's a "Make the server fail (for testing)" checkbox next to the button. It's the same idea as the "Simulate API failure" button on the home page.

The toasts have their own little Zustand store (`store/useToastStore.js`), so any component can show one with `toast.success(...)` or `toast.error(...)` without passing anything around. They close by themselves after a few seconds, or with the ✕.

### Other small changes

- `Header`, `StoreHydration` and the footer moved into `app/layout.jsx`, since there are two pages now
- the header got a nav (Explore / Plan a trip) and the favourites button only shows on the home page, where it does something
- inputs have `aria-invalid` and `aria-describedby` pointing at their error message, so screen readers read the error too
- after a successful submit, focus moves to the summary heading

## How it's organised

```
app/              layout, global styles, the home page and plan/page.jsx
store/            the Zustand stores (countries + filters + favourites, and toasts)
components/       the UI pieces (header, toolbar, cards, loading / error / empty states, trip form, toasts)
components/form/  reusable form bits (Field, CountrySelect, PhotoInput)
hooks/            useVisibleCountries (filtered + sorted list) and useDebounce (for the search box)
lib/              the countries API call, the fake trip API and the form validation rules
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
