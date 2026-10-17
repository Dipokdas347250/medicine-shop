"use client";

import { useSyncExternalStore } from "react";

// Transient UI state shared across components (never persisted).
const initial = { cartOpen: false, quickViewId: null, toasts: [] };
let ui = initial;
const listeners = new Set();

function set(patch) {
  ui = { ...ui, ...(typeof patch === "function" ? patch(ui) : patch) };
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useUI(selector) {
  const s = useSyncExternalStore(subscribe, () => ui, () => initial);
  return selector ? selector(s) : s;
}

let toastId = 0;

export const uiActions = {
  openCart: () => set({ cartOpen: true, quickViewId: null }),
  closeCart: () => set({ cartOpen: false }),
  openQuickView: (id) => set({ quickViewId: id }),
  closeQuickView: () => set({ quickViewId: null }),
  toast(message, type = "success", action) {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, message, type, action }] }));
    setTimeout(() => uiActions.dismissToast(id), 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
};

export const toast = uiActions.toast;
