import Header from "@/components/Header";
import CountryExplorer from "@/components/CountryExplorer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <CountryExplorer />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Built with Next.js &amp; Tailwind CSS · Data from{" "}
        <a href="https://github.com/trevorblades/countries" className="underline hover:text-brand-600">
          Countries GraphQL API
        </a>
      </footer>
    </>
  );
}
