"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { plans, system, videosPerMonth, type PerDay } from "@/data/content";
import { formatUsd, perDayLabel, videosLabel } from "@/lib/format";
import { prefillLead } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { PerDayPicker } from "@/components/ui/PerDayPicker";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

export function Pricing() {
  const [perDay, setPerDay] = useState<PerDay>(system.defaultPerDay);
  const videos = videosPerMonth(perDay);

  return (
    <Section id="pricing">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <SectionHeader
            title="Тарифы"
            subtitle="Не ролики поштучно, а система: ролики выходят каждый день. Объём выбираете сами. Цены в долларах — для удобства."
          />
        </Reveal>
        <Reveal delay={0.05} className="shrink-0">
          <p className="mb-3 text-[14px] text-muted">Роликов в день</p>
          <PerDayPicker value={perDay} onChange={setPerDay} />
        </Reveal>
      </div>

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-3 lg:gap-5">
        {plans.map((p, i) => {
          const dark = p.featured;
          const price = p.prices[perDay];
          return (
            <Reveal key={p.id} delay={i * 0.06}>
              <div
                className={`flex h-full flex-col rounded-[20px] p-6 sm:p-8 ${dark ? "bg-ink text-white" : "bg-surface text-ink"}`}
              >
                <div className="flex min-h-7 flex-wrap items-center justify-between gap-3">
                  <h3 className="heading text-[24px]">{p.name}</h3>
                  {p.badge && (
                    <span className="inline-flex h-7 items-center rounded-full bg-white/10 px-3 text-[12px] text-white/80">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-[15px] ${dark ? "text-white/60" : "text-muted"}`}>{p.text}</p>
                <p className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                    {formatUsd(price)}
                  </span>
                  <span className={`text-[15px] ${dark ? "text-white/50" : "text-muted"}`}>в месяц</span>
                </p>
                <p className={`mt-3 text-[14px] ${dark ? "text-white/50" : "text-muted"}`}>
                  ≈ {formatUsd(price / videos)} за ролик
                </p>
                <ul className={`mt-8 flex-1 space-y-3 border-t pt-6 text-[15px] ${dark ? "border-white/10" : "border-line"}`}>
                  {[`${videosLabel(videos)} в месяц — ${perDayLabel(perDay)}`, ...p.features].map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className={`mt-1 h-4 w-4 shrink-0 ${dark ? "text-white/70" : "text-ink"}`} strokeWidth={1.75} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={dark ? "inverse" : "primary"}
                  size="lg"
                  className="mt-8 w-full"
                  onClick={() =>
                    prefillLead({
                      plan: p.id,
                      task: `Интересует тариф «${p.name}»: ${perDayLabel(perDay)}, ${formatUsd(price)} в месяц.`,
                    })
                  }
                >
                  Выбрать тариф
                </Button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
