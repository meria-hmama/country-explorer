"use client";

import { useRef, useState } from "react";
import {
  EMPTY_TRIP,
  FIELD_ORDER,
  MAX_NOTES,
  MAX_TRIP_DAYS,
  TRAVEL_STYLES,
  daysBetween,
  todayString,
  validateTrip,
} from "@/lib/tripValidation";
import { submitTrip } from "@/lib/tripApi";
import { useExplorerStore } from "@/store/useExplorerStore";
import { toast, useToastStore } from "@/store/useToastStore";
import Field, { describedBy, inputClass } from "./form/Field";
import CountrySelect from "./form/CountrySelect";
import PhotoInput from "./form/PhotoInput";
import TripSuccess from "./TripSuccess";
import Spinner from "./Spinner";

const fieldId = (name) => `trip-${name}`;

export default function TripForm({ initialCountry = "" }) {
  const [values, setValues] = useState({ ...EMPTY_TRIP, country: initialCountry });
  const [touched, setTouched] = useState({});
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [simulateError, setSimulateError] = useState(false);
  const [savedTrip, setSavedTrip] = useState(null);

  const countries = useExplorerStore((s) => s.countries);
  const lastErrorToast = useRef(null);

  const today = todayString();
  const errors = validateTrip(values, today);
  const errorCount = Object.keys(errors).length;

  // only nag about a field once the user has left it, or pressed submit.
  // nobody likes red text before they've even started typing.
  const errorFor = (name) => (touched[name] || triedToSubmit ? errors[name] : "");

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setServerError("");
  };

  const touch = (name) => setTouched((t) => (t[name] ? t : { ...t, [name]: true }));

  // the props every simple input needs
  const bind = (name, hasHint = false) => ({
    id: fieldId(name),
    name,
    value: values[name],
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => touch(name),
    "aria-invalid": !!errorFor(name),
    "aria-describedby": describedBy(fieldId(name), errorFor(name), hasHint),
    className: inputClass(!!errorFor(name)),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // no double submits

    setTriedToSubmit(true);
    setServerError("");

    if (errorCount > 0) {
      // jump to the first problem so the user doesn't have to look for it
      const first = FIELD_ORDER.find((name) => errors[name]);
      const el =
        first === "style"
          ? document.querySelector(`input[name="style"]`)
          : document.getElementById(fieldId(first));
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // an old "couldn't save" toast is confusing next to a new attempt
    if (lastErrorToast.current) useToastStore.getState().dismiss(lastErrorToast.current);

    setSubmitting(true);
    try {
      const result = await submitTrip(values, { simulateError });
      const country = countries.find((c) => c.id === values.country);
      setSavedTrip({ ...values, ...result, countryName: country?.name ?? values.country });
      toast.success("Trip saved!", `Have fun in ${country?.name ?? "your destination"}. A summary is on its way to ${values.email.trim()}.`);
    } catch (err) {
      setServerError(err.message);
      lastErrorToast.current = toast.error("We couldn't save your trip", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    // keep name + email, it's annoying to type them again
    setValues((v) => ({ ...EMPTY_TRIP, fullName: v.fullName, email: v.email }));
    setTouched({});
    setTriedToSubmit(false);
    setSavedTrip(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (savedTrip) return <TripSuccess trip={savedTrip} onPlanAnother={startOver} />;

  const nights =
    values.startDate && values.endDate && !errors.endDate && !errors.startDate
      ? daysBetween(values.startDate, values.endDate)
      : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-busy={submitting}>
      {/* banner after a failed submit: either validation or the server */}
      {triedToSubmit && errorCount > 0 && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold text-red-800">
            {errorCount === 1 ? "1 field needs your attention" : `${errorCount} fields need your attention`}
          </p>
          <p className="mt-1">They&apos;re marked in red below. Fix them and send again.</p>
        </div>
      )}
      {serverError && errorCount === 0 && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold text-red-800">Sending failed</p>
          <p className="mt-1">{serverError}</p>
        </div>
      )}

      {/* disabling the fieldset disables every input inside while we wait */}
      <fieldset disabled={submitting} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">About you</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field id={fieldId("fullName")} label="Full name" error={errorFor("fullName")}>
              <input type="text" autoComplete="name" placeholder="e.g. Amira Ben Salah" {...bind("fullName")} />
            </Field>
            <Field
              id={fieldId("email")}
              label="Email"
              hint="We'll send the trip summary here."
              error={errorFor("email")}
            >
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@mail.com"
                {...bind("email", true)}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">The trip</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field
              id={fieldId("country")}
              label="Where to?"
              hint="Countries you starred on the explorer page show up first."
              error={errorFor("country")}
              className="sm:col-span-2"
            >
              <CountrySelect
                id={fieldId("country")}
                value={values.country}
                error={errorFor("country")}
                disabled={submitting}
                onChange={(v) => setValue("country", v)}
                onBlur={() => touch("country")}
                describedById={describedBy(
                  fieldId("country"),
                  errorFor("country"),
                  "Countries you starred on the explorer page show up first."
                )}
              />
            </Field>

            <Field id={fieldId("startDate")} label="Leaving on" error={errorFor("startDate")}>
              <input type="date" min={today} {...bind("startDate")} />
            </Field>
            <Field
              id={fieldId("endDate")}
              label="Coming back on"
              hint={nights ? `${nights} night${nights === 1 ? "" : "s"}` : `Up to ${MAX_TRIP_DAYS} days.`}
              error={errorFor("endDate")}
            >
              <input type="date" min={values.startDate || today} {...bind("endDate", true)} />
            </Field>

            <Field
              id={fieldId("travellers")}
              label="Number of travellers"
              hint="Including you. Max 10."
              error={errorFor("travellers")}
            >
              <input type="number" min="1" max="10" step="1" inputMode="numeric" {...bind("travellers", true)} />
            </Field>

            <fieldset
              aria-invalid={!!errorFor("style")}
              aria-describedby={errorFor("style") ? `${fieldId("style")}-error` : undefined}
            >
              <legend className="mb-1.5 text-sm font-medium text-slate-700">Travel style</legend>
              <div className="grid grid-cols-3 gap-2">
                {TRAVEL_STYLES.map((s) => (
                  <label
                    key={s.value}
                    title={s.hint}
                    className={`flex cursor-pointer items-center justify-center rounded-xl border px-2 py-3 text-center text-sm font-medium transition focus-within:ring-4 focus-within:ring-brand-100 ${
                      values.style === s.value
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : errorFor("style")
                        ? "border-red-400 bg-white text-slate-600"
                        : "border-slate-200 bg-white text-slate-600 hover:border-brand-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value={s.value}
                      checked={values.style === s.value}
                      onChange={(e) => setValue("style", e.target.value)}
                      onBlur={() => touch("style")}
                      className="sr-only"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
              {errorFor("style") ? (
                <p id={`${fieldId("style")}-error`} className="mt-1.5 flex gap-1.5 text-sm text-red-600">
                  <span aria-hidden="true">⚠</span>
                  {errorFor("style")}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-500">
                  {TRAVEL_STYLES.find((s) => s.value === values.style)?.hint ?? "Pick the one that fits you best."}
                </p>
              )}
            </fieldset>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Extras</h2>
          <div className="mt-4 space-y-5">
            <Field id={fieldId("photo")} label="Trip photo" error={errorFor("photo")}>
              <PhotoInput
                id={fieldId("photo")}
                file={values.photo}
                error={errorFor("photo")}
                disabled={submitting}
                onChange={(file) => {
                  setValue("photo", file);
                  touch("photo"); // show the result straight away, no need to wait for blur
                }}
                onBlur={() => touch("photo")}
                describedById={describedBy(fieldId("photo"), errorFor("photo"))}
              />
            </Field>

            <Field id={fieldId("notes")} label="Anything we should know?" optional error={errorFor("notes")}>
              <textarea
                rows={4}
                placeholder="Must-see places, food allergies, a birthday on the trip…"
                {...bind("notes")}
              />
              <p
                className={`mt-1 text-right text-xs ${
                  values.notes.length > MAX_NOTES ? "font-semibold text-red-600" : "text-slate-500"
                }`}
              >
                {values.notes.length}/{MAX_NOTES}
              </p>
            </Field>

            <div>
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  id={fieldId("terms")}
                  type="checkbox"
                  name="terms"
                  checked={values.terms}
                  onChange={(e) => {
                    setValue("terms", e.target.checked);
                    touch("terms");
                  }}
                  aria-invalid={!!errorFor("terms")}
                  aria-describedby={errorFor("terms") ? `${fieldId("terms")}-error` : undefined}
                  className="mt-0.5 h-4 w-4 accent-brand-500"
                />
                <span>
                  I understand this is a practice project and nothing actually gets booked.
                </span>
              </label>
              {errorFor("terms") && (
                <p id={`${fieldId("terms")}-error`} className="mt-1.5 flex gap-1.5 pl-7 text-sm text-red-600">
                  <span aria-hidden="true">⚠</span>
                  {errorFor("terms")}
                </p>
              )}
            </div>
          </div>
        </section>
      </fieldset>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* testing helper, same idea as "Simulate API failure" on the home page */}
        <label className="inline-flex items-center gap-2 text-sm text-slate-500">
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 accent-red-600"
          />
          Make the server fail (for testing)
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Spinner /> Saving your trip…
            </>
          ) : (
            "Save my trip"
          )}
        </button>
      </div>
    </form>
  );
}
