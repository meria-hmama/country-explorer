import { Quicksand } from "next/font/google";
import Header from "@/components/Header";
import StoreHydration from "@/components/StoreHydration";
import Toaster from "@/components/Toaster";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// rounder, softer font for the pink redesign
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: "swap" });


const description =
  "Search, filter and favourite all 250 countries of the world, with their flags, capitals, currencies and languages, then plan a trip to one of them.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Country Explorer – search every country in the world",
    template: "%s · Country Explorer",
  },
  description,
  applicationName: "Country Explorer",
  authors: [{ name: "Meria Hmama" }],
  keywords: ["countries", "flags", "capitals", "currencies", "languages", "travel", "next.js"],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Country Explorer",
    title: "Country Explorer",
    description,
  },
  twitter: { card: "summary", title: "Country Explorer", description },
};

export const viewport = {
  themeColor: "#db2777",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={quicksand.variable}>
      <head>
        {/* lighthouse said connecting to these two early saves ~300 ms */}
        <link rel="preconnect" href="https://countries.trevorblades.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://flagcdn.com" />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        {/* moved here from page.jsx in week 4 so both pages share them */}
        <StoreHydration />
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-brand-100 bg-white/60 py-6 text-center text-xs text-slate-600">
          Made with 💕 by Meria · Next.js &amp; Tailwind CSS · Data from{" "}
          <a href="https://github.com/trevorblades/countries" className="underline hover:text-brand-600">
            Countries GraphQL API
          </a>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
