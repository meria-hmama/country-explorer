# Country Explorer

A small app I built during my frontend internship at Zenvio Solutions. I started it in week 2 and kept building on the same project every week after that, so this README is kind of a diary of how it grew.

**Live version:** https://country-explorer-wheat-phi.vercel.app

| Week | Task | What I added |
| --- | --- | --- |
| 1 | Responsive landing page | a separate project, [Hasad](https://github.com/meria-hmama/hasad) |
| 2 | Consume a public API | the country list with search, filter, sort, and loading / error / empty states |
| 3 | Global state | a Zustand store, favourites, skeletons and better empty states |
| 4 | Forms and validation | the "Plan a trip" page with a 10-field form, validation and toasts |
| 5 | Performance and deployment | server rendering, faster loading, SEO, environment variables, and a pink redesign 🌸 |

Each week has its own section below. Earlier sections describe the app as it was that week, and where something changed later I added a small note.

## What it does

This is how the app works today:

- It loads all 250 countries and shows them as cards with the flag, native name, capital, currency, languages and continent. The first 24 come with the page and the rest load as you scroll
- You can search by country name, native name or capital, filter by continent, and sort the list
- While the data is loading you see placeholder cards instead of a blank page
- If the request fails you get a short explanation and a "Try again" button
- If your search doesn't match anything, it tells you and lets you clear the filters
- You can heart countries as favourites (♡), and they stay saved when you come back
- On the "Plan a trip" page you can plan a trip to any country, with a form that checks everything as you type

There's also a "Simulate API failure" button above the grid. It calls an endpoint that doesn't exist, which was the easiest way I found to show the error screen without unplugging my internet. (Switching the Network tab in DevTools to "Offline" and hitting Refresh works too.)

## Week 2: the API

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
3. New: favourites. There's a star on every card (it became a heart in the week 5 redesign), a counter in the header, and a button to only show your favourites. The card and the header are in completely different places in the tree, which is exactly the case where prop drilling gets annoying, and with the store they just stay in sync. Favourites (and your sort choice) are saved in localStorage so they're still there when you come back.

One thing that tripped me up: Next.js renders the page on the server first, where there's no localStorage, so loading favourites straight away caused a hydration mismatch (server says 0 favourites, browser says 3). I fixed it by telling the store to skip hydration and loading the saved data in a `useEffect` after the first render (`StoreHydration.jsx`).

I also went through the loading and empty states again:

- skeleton cards while the data loads, plus a little spinner in the status line and on the Refresh button
- each flag has a grey shimmer until the image actually loads, and says "Flag unavailable" if it fails (in week 5 I changed how the shimmer works, see below)
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

## Week 5: performance and deployment

This week was about shipping it properly and then making it fast. I ran [PageSpeed Insights](https://pagespeed.web.dev/) (which is Lighthouse) on the live site on mobile, fixed what it complained about, and ran it again.

| Mobile | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Before | 88 | 97 | 100 | 100 |
| After | **94** | **100** | 100 | 100 |

| Metric (mobile) | Before | After |
| --- | --- | --- |
| First Contentful Paint | 1.7 s | 1.5 s |
| Largest Contentful Paint | 3.3 s | 3.0 s |
| Total Blocking Time | 100 ms | 20 ms |
| Speed Index | 4.4 s | 2.4 s |

Screenshots: [before](docs/lighthouse/before-mobile.png) and [after](docs/lighthouse/after-mobile.png). The numbers move a few points every time you run it (one of my runs said 97, another one 88 for the same version), so I compared runs made a few minutes apart.

### What Lighthouse flagged and what I changed

1. **The countries were only loaded after the JavaScript.** The page arrived as an empty skeleton, then React started, then it asked the API for the countries, and only then could the flags start loading. Lighthouse said the biggest image (the first flag) was discovered 1.6 s late. Now `app/page.jsx` fetches the countries on the server and the page is cached for a day (`revalidate = 86400`), so the cards are already in the HTML.
   - My first try didn't work: I put the data into the Zustand store during the first render, but on the server Zustand always renders the store's *initial* state, so the HTML still only had the skeleton. Now `CountryExplorer` just renders the list it got from the server until the store is filled, which happens right after the page loads.
2. **The first flags were lazy-loaded and hidden.** Every flag had `loading="lazy"` and stayed at `opacity: 0` until its `onLoad` fired. Now the first row of 4 loads straight away with `fetchpriority="high"`, and the flags aren't hidden anymore. The grey shimmer just sits behind the image, so the flag covers it as soon as it arrives. I also added `width` and `height` so the browser knows the size in advance.
3. **Too much HTML.** Once the cards were rendered on the server, the HTML was 540 KB because of all 250 cards. Now it shows 24 at a time and loads more when you scroll near the bottom (`IntersectionObserver`, plus a "Show more" button as a fallback). That brought the HTML down to about 110 KB and Total Blocking Time from 100 ms to 20 ms.
4. **Preconnect.** Lighthouse suggested connecting to `countries.trevorblades.com` early (about 300 ms saved), so `layout.jsx` now has `<link rel="preconnect">` for the API and for flagcdn.com.
5. **Low contrast text (accessibility).** The light grey I used for small labels (`slate-400`) and for the inactive nav link was too light on white. I changed it to `slate-500` (and later `slate-600`, after the pink background went in), and accessibility went from 97 to 100.

Things it still mentions that I left alone: about 12 KB of "legacy JavaScript" (polyfills that Next.js 14 ships itself, like `Array.prototype.at`) and the 6 KB CSS file counting as render-blocking. Fixing those means upgrading Next.js or changing build settings, and that felt too risky for this week.

### A little redesign 🌸

While I was at it I gave the app a softer, pinker look. Honestly the blue felt a bit too "default Tailwind", and I wanted it to feel more like me:

- the `brand` colours in `tailwind.config.js` are now pink, with a lilac accent for gradients. I picked the darker pinks (`#db2777` and up) for anything with text, so it still passes the contrast check
- a soft pink/lilac background, rounded "pill" buttons and inputs, rounder cards, and a pink focus outline
- the font is now Quicksand (rounder than Inter)
- the small grey text went from `slate-500` to `slate-600`, so it stays readable on the pink background

I ran Lighthouse again after the redesign and accessibility was still 100.
- favourites are hearts now (♡ / ♥) with a tiny pop when you click, which is turned off if you have "reduce motion" on
- the header sticks to the top with a blurred background, plus a new gradient favicon

### SEO

- every page has its own `<title>` and meta description (the plan page is "Plan a trip · Country Explorer")
- canonical links, Open Graph and Twitter tags for link previews (`metadataBase` comes from `NEXT_PUBLIC_SITE_URL`)
- `robots.txt` and `sitemap.xml`, generated by `app/robots.js` and `app/sitemap.js`
- a favicon (`app/icon.svg`)
- every flag has alt text ("Flag of France"), and the photo preview in the form has one too. Purely decorative emojis are `aria-hidden`

### Environment variables

The app reads two variables. Both are set in the Vercel project settings for production, and both have defaults in the code so it still runs without a `.env` file:

| Variable | What it's for |
| --- | --- |
| `NEXT_PUBLIC_COUNTRIES_API_URL` | the GraphQL endpoint for the countries |
| `NEXT_PUBLIC_SITE_URL` | the public address, used for canonical links, the sitemap and link previews |

They're `NEXT_PUBLIC_` because the browser needs the API URL too (for Refresh and "Try again"). Neither of them is a secret.

### Checked on mobile and desktop

After deploying I checked the live site again: the cards are now in the HTML that comes from the server (24 of them), scrolling loads the rest, the "Plan a trip →" links still fill in the country, and the plan page has its own title. Lighthouse also runs on an emulated phone (Moto G Power), and its screenshot shows the mobile layout working, with the toolbar stacked and one card per row.

## How it's organised

```
app/              layout, global styles, the home page and plan/page.jsx
store/            the Zustand stores (countries + filters + favourites, and toasts)
components/       the UI pieces (header, toolbar, cards, loading / error / empty states, trip form, toasts)
components/form/  reusable form bits (Field, CountrySelect, PhotoInput)
hooks/            useVisibleCountries (filtered + sorted list) and useDebounce (for the search box)
lib/              the countries API call, the fake trip API, the form validation rules and the site url
docs/lighthouse/  before / after screenshots from week 5
```

I tried to keep the fetching logic out of the components. `lib/countriesApi.js` does the request, turns errors into readable messages and cleans up the data. The store keeps track of whether we're loading, done, or failed. The components just render whatever is in the store, which made the loading/error/empty screens a lot easier to reason about. (Since week 5 there's one exception: before the store is filled, `CountryExplorer` shows the list the server sent with the page.)

A couple of other small things:

- I added a 10 second timeout with `AbortController`, otherwise a slow connection just looks like a stuck loading screen.
- The search is debounced by a quarter of a second so it doesn't re-filter on every single keystroke.

## Running it locally

You need Node.js 18 or newer.

```bash
git clone https://github.com/meria-hmama/country-explorer.git
cd country-explorer
npm install
cp .env.example .env.local   # optional, the defaults work too
npm run dev
```

Then open http://localhost:3000. No API key needed.

To try the production build (that's what Lighthouse should be run on, `npm run dev` is much slower):

```bash
npm run build
npm start
```

## Deploying

It's deployed on Vercel, connected to this GitHub repo, so every push to `main` deploys automatically. If you deploy your own copy, add the two variables from `.env.example` under Project → Settings → Environment Variables (and set `NEXT_PUBLIC_SITE_URL` to your own address).

## Built with

Next.js 14 (App Router), React 18, Zustand and Tailwind CSS. Deployed on Vercel. Data from the [Countries GraphQL API](https://github.com/trevorblades/countries), flags from [flagcdn.com](https://flagcdn.com).
