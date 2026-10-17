"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { uiActions, useUI } from "@/lib/ui";

const STYLES = {
  success: { icon: CheckCircle2, color: "text-emerald-500" },
  error: { icon: XCircle, color: "text-rose-500" },
  info: { icon: Info, color: "text-sky-500" },
};

export default function Toaster() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
      {toasts.map((t) => {
        const { icon: Icon, color } = STYLES[t.type] || STYLES.info;
        return (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl animate-pop dark:border-slate-700 dark:bg-slate-800">
            <Icon size={20} className={`shrink-0 ${color}`} />
            <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{t.message}</p>
            {t.action && (
              <button
                onClick={() => {
                  t.action.onClick();
                  uiActions.dismissToast(t.id);
                }}
                className="cursor-pointer text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                {t.action.label}
              </button>
            )}
            <button aria-label="Dismiss" onClick={() => uiActions.dismissToast(t.id)} className="cursor-pointer text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
