"use client";

import { Check, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { calculator as cfg } from "@/data/content";
import { formatRub, plural } from "@/lib/format";
import { prefillLead } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

type OptionId = (typeof cfg.options)[number]["id"];

export function calculate(formatId: string, qty: number, options: OptionId[], urgent: boolean) {
  const format = cfg.formats.find((f) => f.id === formatId) ?? cfg.formats[0];
  const optionsSum = cfg.options.filter((o) => options.includes(o.id)).reduce((s, o) => s + o.price, 0);
  const unit = format.price + optionsSum;
  const subtotal = unit * qty;
  const discountRate = cfg.volumeDiscounts.find((d) => qty >= d.from)?.discount ?? 0;
  const discount = subtotal * discountRate;
  const urgentFee = urgent ? (subtotal - discount) * cfg.urgentMarkup : 0;
  const total = subtotal - discount + urgentFee;
  let days = format.days + Math.ceil((qty - 1) / cfg.perDay) + (options.includes("script") ? 1 : 0);
  if (urgent) days = Math.max(1, Math.ceil(days * 0.6));
  return { format, unit, subtotal, discountRate, discount, urgentFee, total, days };
}

export function Calculator() {
  const [formatId, setFormatId] = useState<string>(cfg.formats[0].id);
  const [qty, setQty] = useState(4);
  const [options, setOptions] = useState<OptionId[]>(["subs"]);
  const [urgent, setUrgent] = useState(false);

  const r = useMemo(() => calculate(formatId, qty, options, urgent), [formatId, qty, options, urgent]);
  const fill = ((qty - cfg.minQty) / (cfg.maxQty - cfg.minQty)) * 100;
  const nextDiscount = [...cfg.volumeDiscounts].reverse().find((d) => qty < d.from);

  const toggle = (id: OptionId) => setOptions((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const send = () => {
    const opts = cfg.options.filter((o) => options.includes(o.id)).map((o) => o.label.toLowerCase());
    const text = [
      `Расчёт с сайта: ${r.format.label} — ${qty} ${plural(qty, ["ролик", "ролика", "роликов"])}`,
      opts.length ? `Опции: ${opts.join(", ")}` : null,
      urgent ? "Срочно" : null,
      `Итого: ${formatRub(r.total)}, срок ~${r.days} ${plural(r.days, ["день", "дня", "дней"])}`,
    ]
      .filter(Boolean)
      .join(". ");
    prefillLead(text);
  };

  return (
    <Section id="calculator" surface>
      <Reveal>
        <SectionHeader title="Калькулятор" subtitle="Прикиньте бюджет за минуту. Точную цену назовём после брифа." />
      </Reveal>

      <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Reveal className="rounded-[20px] bg-bg p-5 sm:p-7 md:p-9">
          {/* формат */}
          <fieldset>
            <legend className="text-[15px] font-medium">Формат</legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {cfg.formats.map((f) => {
                const active = f.id === formatId;
                return (
                  <label
                    key={f.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border px-4 py-3.5 transition-colors duration-200 ${
                      active ? "border-ink bg-bg" : "border-line hover:bg-surface"
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={f.id}
                      checked={active}
                      onChange={() => setFormatId(f.id)}
                      className="sr-only"
                    />
                    <span className="text-[15px] leading-tight">{f.label}</span>
                    <span className="shrink-0 text-[14px] text-muted">{formatRub(f.price)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* количество */}
          <div className="mt-9">
            <div className="flex items-baseline justify-between">
              <label htmlFor="qty" className="text-[15px] font-medium">
                Количество роликов
              </label>
              <span className="font-display text-[28px] font-semibold tabular-nums tracking-[-0.03em]">{qty}</span>
            </div>
            <input
              id="qty"
              type="range"
              min={cfg.minQty}
              max={cfg.maxQty}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="range-ink mt-4 w-full"
              style={{ ["--fill" as string]: `${fill}%` }}
            />
            <p className="mt-3 text-[14px] text-muted">
              {r.discountRate > 0 ? `Скидка за объём ${Math.round(r.discountRate * 100)}%` : "Без скидки"}
              {nextDiscount &&
                ` · от ${nextDiscount.from} ${plural(nextDiscount.from, ["ролика", "роликов", "роликов"])} — ${Math.round(nextDiscount.discount * 100)}%`}
            </p>
          </div>

          {/* опции */}
          <fieldset className="mt-9">
            <legend className="text-[15px] font-medium">Опции к каждому ролику</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {cfg.options.map((o) => {
                const on = options.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(o.id)}
                    className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] transition-colors duration-200 ${
                      on ? "bg-ink text-white" : "bg-surface text-ink-2 hover:bg-surface-2"
                    }`}
                  >
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
                    {o.label}
                    <span className={on ? "text-white/60" : "text-muted"}>+{formatRub(o.price)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* срочно */}
          <label className="mt-9 flex cursor-pointer items-center justify-between gap-4 rounded-[14px] bg-surface px-4 py-4">
            <span className="flex items-center gap-3">
              <Zap className="h-4 w-4" strokeWidth={1.75} />
              <span>
                <span className="block text-[15px] font-medium">Срочно</span>
                <span className="block text-[13px] text-muted">Быстрее примерно в 1,5 раза · +30%</span>
              </span>
            </span>
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="peer sr-only" />
            <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors duration-200 peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
          </label>
        </Reveal>

        {/* итог */}
        <Reveal delay={0.08} className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[20px] bg-ink p-6 text-white sm:p-8 md:p-9">
            <p className="text-[15px] text-white/60">Итого</p>
            <p className="mt-2 font-display text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[52px]">
              {formatRub(r.total)}
            </p>
            <p className="mt-3 text-[15px] text-white/60">
              Срок — около {r.days} {plural(r.days, ["дня", "дней", "дней"])}
            </p>

            <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-[15px]">
              <Row label="Цена за ролик" value={formatRub(r.unit)} />
              <Row label={`${qty} × ${formatRub(r.unit)}`} value={formatRub(r.subtotal)} />
              {r.discount > 0 && (
                <Row label={`Скидка ${Math.round(r.discountRate * 100)}%`} value={`−${formatRub(r.discount)}`} />
              )}
              {r.urgentFee > 0 && <Row label="Срочность +30%" value={`+${formatRub(r.urgentFee)}`} />}
            </dl>

            <Button variant="inverse" size="lg" className="mt-8 w-full" onClick={send}>
              Отправить расчёт
            </Button>
            <p className="mt-4 text-center text-[13px] text-white/45">Подставим расчёт в заявку — останется оставить контакт</p>
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
