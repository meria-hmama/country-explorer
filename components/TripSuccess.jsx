"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TRAVEL_STYLES, daysBetween } from "@/lib/tripValidation";

const formatDate = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function TripSuccess({ trip, onPlanAnother }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(trip.photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [trip.photo]);

  // move focus here so screen readers announce that it worked
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const nights = daysBetween(trip.startDate, trip.endDate);
  const style = TRAVEL_STYLES.find((s) => s.value === trip.style)?.label;

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="relative h-48 bg-slate-100 sm:h-60">
        {photoUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photoUrl} alt={`Your photo for the trip to ${trip.countryName}`} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">Trip {trip.id}</p>
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-white outline-none">
            {trip.countryName} ✈️
          </h2>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          All saved, {trip.fullName.trim().split(" ")[0]}! (Well, pretend-saved. There&apos;s no real backend yet.)
        </p>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Dates</dt>
            <dd className="font-medium text-slate-700">
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)} ({nights} night{nights === 1 ? "" : "s"})
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Travellers</dt>
            <dd className="font-medium text-slate-700">
              {trip.travellers} {Number(trip.travellers) === 1 ? "person" : "people"} · {style}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Summary sent to</dt>
            <dd className="truncate font-medium text-slate-700">{trip.email.trim()}</dd>
          </div>
          {trip.notes.trim() && (
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Notes</dt>
              <dd className="whitespace-pre-line text-slate-700">{trip.notes.trim()}</dd>
            </div>
          )}
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlanAnother}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            Plan another trip
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
          >
            Back to the explorer
          </Link>
        </div>
      </div>
    </div>
  );
}
