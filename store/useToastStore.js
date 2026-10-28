"use client";

import { create } from "zustand";

// small toast system. any component can call
// useToastStore.getState().show({ type: "success", title: "Saved!" })
// and <Toaster /> in the layout renders them.

let nextId = 1;
const timers = new Map();

export const useToastStore = create((set, get) => ({
  toasts: [],

  show: ({ type = "info", title, message = "", duration = 5000 }) => {
    const id = nextId++;
    // keep max 3 on screen so they don't pile up
    set((s) => ({ toasts: [...s.toasts, { id, type, title, message }].slice(-3) }));
    if (duration) timers.set(id, setTimeout(() => get().dismiss(id), duration));
    return id;
  },

  dismiss: (id) => {
    clearTimeout(timers.get(id));
    timers.delete(id);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

// shortcut so components don't need the hook just to fire a toast
export const toast = {
  success: (title, message) => useToastStore.getState().show({ type: "success", title, message }),
  error: (title, message) =>
    useToastStore.getState().show({ type: "error", title, message, duration: 8000 }),
};
