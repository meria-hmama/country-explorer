// all the rules for the "plan a trip" form live here, so the form component
// only has to show the messages. each check returns a message or "" if ok.

export const MAX_PHOTO_MB = 2;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_NOTES = 300;
export const MAX_TRIP_DAYS = 60;

export const TRAVEL_STYLES = [
  { value: "backpacking", label: "Backpacking", hint: "hostels, trains, cheap eats" },
  { value: "comfort", label: "Comfort", hint: "nice hotels, a bit of everything" },
  { value: "luxury", label: "Luxury", hint: "treat yourself" },
];

export const EMPTY_TRIP = {
  fullName: "",
  email: "",
  country: "",
  startDate: "",
  endDate: "",
  travellers: "1",
  style: "",
  photo: null,
  notes: "",
  terms: false,
};

// today as "YYYY-MM-DD" in the user's own timezone
// (toISOString() would give the UTC date, which is wrong late at night)
export function todayString(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// whole days between two "YYYY-MM-DD" strings
function toUTC(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(from, to) {
  return Math.round((toUTC(to) - toUTC(from)) / 86400000);
}

const NAME_RE = /^[\p{L}][\p{L}' .-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  fullName: (v) => {
    const name = v.trim();
    if (!name) return "Please tell us your name.";
    if (name.length < 2) return "Your name needs at least 2 characters.";
    if (name.length > 60) return "That's a long name! Please keep it under 60 characters.";
    if (!NAME_RE.test(name)) return "Names can only use letters, spaces, hyphens and apostrophes.";
    return "";
  },

  email: (v) => {
    const email = v.trim();
    if (!email) return "We need an email to send your trip summary to.";
    if (!EMAIL_RE.test(email)) return "This doesn't look like a valid email (e.g. name@mail.com).";
    return "";
  },

  country: (v) => (v ? "" : "Pick the country you want to visit."),

  startDate: (v, all, today) => {
    if (!v) return "Choose the day you leave.";
    if (v < today) return "The departure date can't be in the past.";
    return "";
  },

  endDate: (v, all) => {
    if (!v) return "Choose the day you come back.";
    // no point comparing to a start date that is missing or broken
    if (!all.startDate) return "";
    if (v <= all.startDate) return "You have to come back after you leave 🙂 Pick a later date.";
    if (daysBetween(all.startDate, v) > MAX_TRIP_DAYS)
      return `Trips can be ${MAX_TRIP_DAYS} days at most.`;
    return "";
  },

  travellers: (v) => {
    if (v === "" || v === null) return "How many people are going?";
    const n = Number(v);
    if (!Number.isInteger(n)) return "Use a whole number of travellers.";
    if (n < 1) return "At least 1 person has to go on the trip.";
    if (n > 10) return "For groups bigger than 10, please contact us directly.";
    return "";
  },

  style: (v) => (v ? "" : "Choose a travel style."),

  photo: (file) => {
    if (!file) return "Add a photo for your trip card.";
    if (!PHOTO_TYPES.includes(file.type)) return "Only JPG, PNG or WebP images are allowed.";
    if (file.size > MAX_PHOTO_MB * 1024 * 1024)
      return `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_PHOTO_MB} MB.`;
    return "";
  },

  notes: (v) =>
    v.length > MAX_NOTES ? `Please keep notes under ${MAX_NOTES} characters (${v.length} now).` : "",

  terms: (v) => (v ? "" : "Please tick this box to continue."),
};

export const FIELD_ORDER = Object.keys(rules);

export function validateField(name, values, today = todayString()) {
  return rules[name](values[name], values, today);
}

// returns { fieldName: "message" } with only the fields that have a problem
export function validateTrip(values, today = todayString()) {
  const errors = {};
  for (const name of FIELD_ORDER) {
    const msg = validateField(name, values, today);
    if (msg) errors[name] = msg;
  }
  return errors;
}
