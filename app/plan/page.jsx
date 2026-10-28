import TripForm from "@/components/TripForm";

export const metadata = {
  title: "Plan a trip · Country Explorer",
  description: "Pick a country, choose your dates and save a trip plan.",
};

// ?country=FR comes from the "Plan a trip" link on each country card
export default function PlanPage({ searchParams }) {
  const initialCountry = typeof searchParams?.country === "string" ? searchParams.country.toUpperCase() : "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Plan a trip</h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Found a country you like? Fill this in and we&apos;ll save the plan for you. Every field
          is checked as you go, so you&apos;ll know right away if something&apos;s off.
        </p>
      </div>
      <TripForm initialCountry={initialCountry} />
    </main>
  );
}
