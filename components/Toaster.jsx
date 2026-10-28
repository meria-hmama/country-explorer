"use client";

import { useToastStore } from "@/store/useToastStore";

const styles = {
  success: { box: "border-emerald-200 bg-emerald-50", title: "text-emerald-800", text: "text-emerald-700", icon: "✅" },
  error: { box: "border-red-200 bg-red-50", title: "text-red-800", text: "text-red-700", icon: "⛔" },
  info: { box: "border-slate-200 bg-white", title: "text-slate-800", text: "text-slate-600", icon: "ℹ️" },
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    // bottom on phones (easier to reach), top-right on bigger screens
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-3 px-4 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:items-end"
    >
      {toasts.map((t) => {
        const s = styles[t.type] ?? styles.info;
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lg ${s.box}`}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${s.title}`}>{t.title}</p>
              {t.message && <p className={`mt-1 text-sm ${s.text}`}>{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Close notification"
              className="-m-1 rounded-lg p-1 text-slate-400 transition hover:bg-black/5 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
