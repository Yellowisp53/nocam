"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { contact, plans, site, telegramUrl } from "@/data/content";
import { PREFILL_EVENT, submitLead, validateLead, type Lead, type LeadErrors, type Prefill } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Modal";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const empty: Lead = { name: "", contact: "", about: "", plan: "", task: "" };

export function Contact() {
  const [lead, setLead] = useState<Lead>(empty);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const f = contact.form;

  // калькулятор и тарифы подставляют тариф и текст в «Задачу»
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const { task, plan } = (e as CustomEvent<Prefill>).detail;
      setStatus("idle");
      setLead((l) => ({ ...l, task, plan: plan ?? l.plan }));
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  const update = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    const next = { ...lead, [key]: value };
    setLead(next);
    if (touched) setErrors(validateLead(next));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validateLead(lead);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus("sending");
    await submitLead(lead);
    setStatus("sent");
    setLead(empty);
    setTouched(false);
  };

  return (
    <Section id="contact" dark>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="heading text-[40px] md:text-[64px]">{contact.title}</h2>
          <p className="mt-5 max-w-[460px] text-[17px] leading-[1.6] text-white/60 md:text-[18px]">{contact.subtitle}</p>

          <ul className="mt-10 space-y-1 border-t border-white/10 pt-6 text-[16px]">
            <ContactRow icon={<Send className="h-4 w-4" strokeWidth={1.5} />} href={telegramUrl()} label={`@${site.contacts.telegram}`} external />
            <ContactRow icon={<Mail className="h-4 w-4" strokeWidth={1.5} />} href={`mailto:${site.contacts.email}`} label={site.contacts.email} />
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative min-h-[460px] rounded-[20px] bg-bg p-6 text-ink sm:p-8 md:p-9">
            <AnimatePresence mode="wait" initial={false}>
              {status === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[400px] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={1.5} />
                  <h3 className="heading mt-6 text-[28px]">{f.successTitle}</h3>
                  <p className="mt-3 max-w-[320px] text-[16px] text-muted">{f.successText}</p>
                  <Button variant="secondary" className="mt-8" onClick={() => setStatus("idle")}>
                    {f.again}
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={onSubmit}
                  noValidate
                  className="flex flex-col gap-5"
                >
                  <h3 className="heading text-[24px]">{f.title}</h3>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={f.name} error={errors.name} htmlFor="lead-name">
                      <input
                        id="lead-name"
                        autoComplete="name"
                        value={lead.name}
                        onChange={(e) => update("name", e.target.value)}
                        className={inputClass(!!errors.name)}
                        placeholder={f.namePlaceholder}
                      />
                    </Field>
                    <Field label={f.contact} error={errors.contact} htmlFor="lead-contact">
                      <input
                        id="lead-contact"
                        autoComplete="tel"
                        value={lead.contact}
                        onChange={(e) => update("contact", e.target.value)}
                        className={inputClass(!!errors.contact)}
                        placeholder="+375 29… или @username"
                      />
                    </Field>
                  </div>
                  <Field label={f.about} error={errors.about} htmlFor="lead-about">
                    <input
                      id="lead-about"
                      autoComplete="organization"
                      value={lead.about}
                      onChange={(e) => update("about", e.target.value)}
                      className={inputClass(!!errors.about)}
                      placeholder={f.aboutPlaceholder}
                    />
                  </Field>
                  <fieldset>
                    <legend className="mb-2 block text-[14px] font-medium">{f.plan}</legend>
                    <div className="flex flex-wrap gap-2">
                      {[...plans.map((p) => ({ id: p.id, name: p.name })), { id: "" as const, name: f.planUnsure }].map((p) => {
                        const on = lead.plan === p.id;
                        return (
                          <button
                            key={p.id || "unsure"}
                            type="button"
                            aria-pressed={on}
                            onClick={() => update("plan", p.id)}
                            className={`h-10 rounded-full border px-4 text-[14px] transition-colors duration-200 ${
                              on ? "border-ink bg-ink text-white" : "border-line hover:bg-surface"
                            }`}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  <Field label={f.task} error={errors.task} htmlFor="lead-task">
                    <textarea
                      id="lead-task"
                      rows={4}
                      value={lead.task}
                      onChange={(e) => update("task", e.target.value)}
                      className={`${inputClass(!!errors.task)} h-auto resize-none py-3 leading-[1.5]`}
                      placeholder={f.taskPlaceholder}
                    />
                  </Field>
                  <Button type="submit" size="lg" className="mt-2 w-full" disabled={status === "sending"}>
                    {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : null}
                    {status === "sending" ? "Отправляем…" : f.submit}
                  </Button>
                  <p className="text-center text-[13px] text-muted">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function ContactRow({
  icon,
  href,
  label,
  external,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="group flex items-center gap-3 py-2 text-white/80 transition-colors hover:text-white"
      >
        <span className="text-white/40">{icon}</span>
        {label}
        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" strokeWidth={1.75} />
      </a>
    </li>
  );
}
