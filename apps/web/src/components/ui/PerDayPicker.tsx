"use client";

import { system, type PerDay } from "@/data/content";

/** Переключатель «роликов в день»: 1 · 2 · 3 */
export function PerDayPicker({
  value,
  onChange,
  dark,
  className = "",
}: {
  value: PerDay;
  onChange: (v: PerDay) => void;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Роликов в день"
      className={`inline-flex rounded-full p-1 ${dark ? "bg-white/10" : "bg-surface"} ${className}`}
    >
      {system.perDayOptions.map((n) => {
        const on = n === value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(n)}
            className={`h-10 min-w-12 rounded-full px-4 text-[15px] font-medium tabular-nums transition-colors duration-200 ${
              on ? (dark ? "bg-white text-ink" : "bg-ink text-white") : dark ? "text-white/70 hover:text-white" : "text-muted hover:text-ink"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
