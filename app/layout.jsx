import { Inter } from "next/font/google";
import Header from "@/components/Header";
import StoreHydration from "@/components/StoreHydration";
import Toaster from "@/components/Toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Country Explorer",
  description:
    "Search and filter every country in the world using live data from a public countries API.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        {/* moved here from page.jsx in week 4 so both pages share them */}
        <StoreHydration />
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
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
