import CountryExplorer from "@/components/CountryExplorer";
import { fetchCountries } from "@/lib/countriesApi";

// the country list barely ever changes, so the page is built once
// and refreshed in the background at most once a day
export const revalidate = 86400;

export const metadata = {
  alternates: { canonical: "/" },
};

async function getInitialCountries() {
  try {
    return await fetchCountries({ next: { revalidate } });
  } catch {
    // if the API is down while building, the browser just loads it like before
    return null;
  }
}

export default async function Home() {
  const initialCountries = await getInitialCountries();

  return (
    <main>
      <CountryExplorer initialCountries={initialCountries} />
    </main>
  );
}
