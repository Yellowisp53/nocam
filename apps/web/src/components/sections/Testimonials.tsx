"use client";

import { Loader2, PenLine, Star } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";
import { reviews as cfg, testimonials } from "@/data/content";
import { openAuth, useAccount } from "@/lib/auth";
import { addReview, useReviews, validateReview, type ReviewErrors, type ReviewInput } from "@/lib/reviews";
import { Button } from "@/components/ui/Button";
import { Field, Modal, inputClass } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

type Card = { id: string; quote: string; name: string; role: string; rating?: number; mine?: boolean };

export function Testimonials() {
  const account = useAccount();
  const userReviews = useReviews();
  const [formOpen, setFormOpen] = useState(false);
  const closeForm = useCallback(() => setFormOpen(false), []);

  const cards: Card[] = [
    ...userReviews.map((r) => ({
      id: r.id,
      quote: r.text,
      name: r.name,
      role: r.role,
      rating: r.rating,
      mine: r.accountId === account?.id,
    })),
    ...testimonials.map((t) => ({ id: t.name, ...t })),
  ];

  const write = () => {
    if (account) setFormOpen(true);
    else openAuth({ hint: cfg.loginHint, onSuccess: () => setFormOpen(true) });
  };

  return (
    <Section id="reviews" className="!pt-0">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <SectionHeader title={cfg.title} subtitle={cfg.subtitle} />
        </Reveal>
        <Reveal delay={0.05} className="shrink-0">
          <Button variant="secondary" size="lg" onClick={write}>
            <PenLine className="h-4 w-4" strokeWidth={1.75} />
            {cfg.cta}
          </Button>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {cards.map((t, i) => (
          <Reveal key={t.id} delay={Math.min(i, 5) * 0.06}>
            <figure className="flex h-full flex-col rounded-[20px] bg-surface p-6 sm:p-8">
              {(t.rating || t.mine) && (
                <div className="mb-5 flex items-center justify-between gap-3">
                  {t.rating ? <Stars value={t.rating} /> : <span />}
                  {t.mine && <span className="rounded-full bg-bg px-3 py-1 text-[12px] text-muted">Ваш отзыв</span>}
                </div>
              )}
              <blockquote className="flex-1 whitespace-pre-line break-words text-[17px] leading-[1.6] text-ink">
                «{t.quote}»
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-[16px] font-semibold uppercase text-white">
                  {t.name[0]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium">{t.name}</span>
                  <span className="block text-[14px] text-muted">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <ReviewForm open={formOpen} onClose={closeForm} />
    </Section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${n <= value ? "fill-ink text-ink" : "text-line"}`} strokeWidth={1.5} />
      ))}
    </span>
  );
}

const emptyReview: ReviewInput = { role: "", text: "", rating: 5 };

function ReviewForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const account = useAccount();
  const [input, setInput] = useState<ReviewInput>(emptyReview);
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [sending, setSending] = useState(false);

  const update = <K extends keyof ReviewInput>(key: K, value: ReviewInput[K]) => setInput((r) => ({ ...r, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!account) return;
    const errs = validateReview(input);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);
    await addReview(account, input);
    setSending(false);
    setInput(emptyReview);
    onClose();
    requestAnimationFrame(() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Отзыв">
      <h2 className="heading pr-10 text-[28px]">Ваш отзыв</h2>
      {account && <p className="mt-2 text-[15px] text-muted">Опубликуем от имени «{account.name}»</p>}

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        <fieldset>
          <legend className="mb-2 block text-[14px] font-medium">Оценка</legend>
          <div className="flex gap-1" role="radiogroup">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={input.rating === n}
                aria-label={`${n} из 5`}
                onClick={() => update("rating", n)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
              >
                <Star className={`h-6 w-6 ${n <= input.rating ? "fill-ink text-ink" : "text-line"}`} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Кто вы" error={errors.role} htmlFor="review-role">
          <input
            id="review-role"
            value={input.role}
            onChange={(e) => update("role", e.target.value)}
            className={inputClass(!!errors.role)}
            placeholder="Например: стоматологическая клиника, Минск"
          />
        </Field>
        <Field label="Отзыв" error={errors.text} htmlFor="review-text">
          <textarea
            id="review-text"
            rows={5}
            value={input.text}
            onChange={(e) => update("text", e.target.value)}
            className={`${inputClass(!!errors.text)} h-auto resize-none py-3 leading-[1.5]`}
            placeholder="Как прошла работа и что изменилось"
          />
        </Field>
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={sending}>
          {sending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          Опубликовать
        </Button>
      </form>
    </Modal>
  );
}
