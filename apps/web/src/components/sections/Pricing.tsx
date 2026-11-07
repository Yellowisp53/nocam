"use client";

import { Check } from "lucide-react";
import { plans } from "@/data/content";
import { formatRub } from "@/lib/format";
import { prefillLead } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

export function Pricing() {
  return (
    <Section id="pricing">
      <Reveal>
        <SectionHeader title="Тарифы" subtitle="Разовый проект или регулярный контент — выберите удобный формат." />
      </Reveal>

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-3 lg:gap-5">
        {plans.map((p, i) => {
          const dark = p.featured;
          return (
            <Reveal key={p.id} delay={i * 0.06}>
              <div
                className={`flex h-full flex-col rounded-[20px] p-6 sm:p-8 ${dark ? "bg-ink text-white" : "bg-surface text-ink"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="heading text-[24px]">{p.name}</h3>
                  {dark && (
                    <span className="inline-flex h-7 items-center rounded-full bg-white/10 px-3 text-[12px] text-white/80">
                      Чаще выбирают
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-[15px] ${dark ? "text-white/60" : "text-muted"}`}>{p.text}</p>
                <p className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                    {formatRub(p.price)}
                  </span>
                  <span className={`text-[15px] ${dark ? "text-white/50" : "text-muted"}`}>{p.period}</span>
                </p>
                <ul className={`mt-8 flex-1 space-y-3 border-t pt-6 text-[15px] ${dark ? "border-white/10" : "border-line"}`}>
                  {p.features.map((f) => (
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
                  onClick={() => prefillLead(`Интересует тариф «${p.name}» (${formatRub(p.price)} ${p.period}).`)}
                >
                  Выбрать «{p.name}»
                </Button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
