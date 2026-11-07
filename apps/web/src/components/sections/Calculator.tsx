"use client";

import { Check, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { calculator as cfg, plans, system, videosPerMonth, type PerDay, type PlanId } from "@/data/content";
import { formatUsd, perDayLabel, videosLabel } from "@/lib/format";
import { prefillLead } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { PerDayPicker } from "@/components/ui/PerDayPicker";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

type NeedId = (typeof cfg.needs)[number]["id"];

/** Сценарии и продвижение → «Под ключ» (аватары там уже есть); аватар → «Монтаж + ИИ-аватар»; иначе «Монтаж» */
export function pickPlan(needs: NeedId[]): PlanId {
  if (needs.includes("turnkey")) return "turnkey";
  if (needs.includes("avatar")) return "avatar";
  return "edit";
}

export function calculate(needs: NeedId[], perDay: PerDay) {
  const plan = plans.find((p) => p.id === pickPlan(needs))!;
  const videos = videosPerMonth(perDay);
  const price = plan.prices[perDay];
  return { plan, videos, price, perVideo: price / videos };
}

export function Calculator() {
  const [needs, setNeeds] = useState<NeedId[]>(["edit", "avatar"]);
  const [perDay, setPerDay] = useState<PerDay>(system.defaultPerDay);

  const r = useMemo(() => calculate(needs, perDay), [needs, perDay]);
  // «Под ключ» уже включает ИИ-аватаров
  const included = (id: NeedId) => needs.includes(id) || (id === "avatar" && needs.includes("turnkey"));

  const toggle = (id: NeedId) => setNeeds((n) => (n.includes(id) ? n.filter((x) => x !== id) : [...n, id]));

  const send = () =>
    prefillLead({
      plan: r.plan.id,
      task: `Подбор тарифа с сайта: «${r.plan.name}», ${perDayLabel(perDay)} (${videosLabel(r.videos)} в месяц) — ${formatUsd(r.price)} в месяц.`,
    });

  return (
    <Section id="calculator" surface>
      <Reveal>
        <SectionHeader title={cfg.title} subtitle={cfg.subtitle} />
      </Reveal>

      <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Reveal className="rounded-[20px] bg-bg p-5 sm:p-7 md:p-9">
          <fieldset>
            <legend className="text-[15px] font-medium">Что вам нужно</legend>
            <div className="mt-4 grid gap-2">
              {cfg.needs.map((n) => {
                const on = included(n.id);
                const auto = n.id === "avatar" && needs.includes("turnkey");
                return (
                  <button
                    key={n.id}
                    type="button"
                    aria-pressed={on}
                    disabled={n.locked || auto}
                    onClick={() => toggle(n.id)}
                    className={`flex items-center justify-between gap-4 rounded-[14px] border px-4 py-3.5 text-left transition-colors duration-200 disabled:cursor-default ${
                      on ? "border-ink" : "border-line hover:bg-surface"
                    }`}
                  >
                    <span>
                      <span className="block text-[15px] font-medium leading-tight">{n.label}</span>
                      <span className="mt-1 block text-[13px] text-muted">
                        {n.locked ? `${n.text} · есть всегда` : auto ? "Уже входит в «Под ключ»" : n.text}
                      </span>
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                        on ? "bg-ink text-white" : "border border-line"
                      }`}
                    >
                      {n.locked ? (
                        <Lock className="h-3 w-3" strokeWidth={2} />
                      ) : on ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-9">
            <p className="text-[15px] font-medium">Сколько роликов в день</p>
            <PerDayPicker value={perDay} onChange={setPerDay} className="mt-4" />
            <p className="mt-3 text-[14px] text-muted">
              {perDayLabel(perDay)} — {videosLabel(r.videos)} в месяц. Объём можно поменять со следующего месяца.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[20px] bg-ink p-6 text-white sm:p-8 md:p-9">
            <p className="text-[15px] text-white/60">Ваш тариф</p>
            <p className="heading mt-2 text-[28px] md:text-[32px]">{r.plan.name}</p>
            <p className="mt-6 font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[52px]">
              {formatUsd(r.price)}
            </p>
            <p className="mt-3 text-[15px] text-white/60">в месяц</p>

            <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-[15px]">
              <Row label="Роликов в день" value={String(perDay)} />
              <Row label="Роликов в месяц" value={String(r.videos)} />
              <Row label="Цена ролика" value={`≈ ${formatUsd(r.perVideo)}`} />
            </dl>

            <Button variant="inverse" size="lg" className="mt-8 w-full" onClick={send}>
              Обсудить тариф
            </Button>
            <p className="mt-4 text-center text-[13px] text-white/45">Подставим расчёт в письмо — останется рассказать о себе</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-white/60">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
