import { Inter } from "next/font/google";
import Header from "@/components/Header";
import StoreHydration from "@/components/StoreHydration";
import Toaster from "@/components/Toaster";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });


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
  themeColor: "#2f6fed",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
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
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          Built with Next.js &amp; Tailwind CSS · Data from{" "}
          <a href="https://github.com/trevorblades/countries" className="underline hover:text-brand-600">
            Countries GraphQL API
          </a>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
