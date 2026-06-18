import type { ReactNode } from "react";

const toneClasses = {
  neutral: "border-ink-200 bg-ink-50 text-ink-700",
  brand: "border-brand-100 bg-brand-50 text-brand-700",
  amber: "border-amber-200 bg-amber-50 text-amber-500",
  coral: "border-coral-200 bg-coral-50 text-coral-500",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
} as const;

export type BadgeTone = keyof typeof toneClasses;

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
