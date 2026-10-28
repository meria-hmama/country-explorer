// the public address of the site. set NEXT_PUBLIC_SITE_URL on vercel (or in .env.local),
// it's used for the canonical links, the sitemap and the social preview tags
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://country-explorer-wheat-phi.vercel.app"
).replace(/\/$/, "");
