"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { avatarStudio as cfg } from "@/data/content";
import { prefillLead } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

type AvatarId = (typeof cfg.avatars)[number]["id"];
type VoiceId = (typeof cfg.voices)[number]["id"];

/** высоты столбиков «звуковой волны» в превью */
const BARS = [0.35, 0.7, 0.5, 0.95, 0.6, 0.8, 0.4, 0.9, 0.55, 0.75, 0.45, 0.65];

export function AvatarStudio() {
  const [avatarId, setAvatarId] = useState<AvatarId>(cfg.avatars[0].id);
  const [voiceId, setVoiceId] = useState<VoiceId>("m-confident");
  const [brand, setBrand] = useState("");

  const avatar = cfg.avatars.find((a) => a.id === avatarId)!;
  const voice = cfg.voices.find((v) => v.id === voiceId)!;
  const brandName = brand.trim() ? `«${brand.trim()}»` : cfg.brandFallback;
  const filled = avatar.line.replace("{brand}", brandName);
  const line = filled.charAt(0).toUpperCase() + filled.slice(1);

  const send = () =>
    prefillLead({
      plan: "avatar",
      task: `Хочу ИИ-аватара: ${avatar.name} (${avatar.style}), голос — ${voice.name.toLowerCase()} (${voice.text.toLowerCase()}).${
        brand.trim() ? ` Бренд: ${brand.trim()}.` : ""
      }`,
    });

  return (
    <Section id="avatars" dark>
      <Reveal>
        <SectionHeader dark title={cfg.title} subtitle={cfg.subtitle} />
      </Reveal>

      <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        {/* превью */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden sm:max-w-[420px] lg:max-w-none rounded-[24px] bg-white/5">
            <AnimatePresence initial={false}>
              <motion.img
                key={avatar.id}
                src={avatar.image}
                alt={`ИИ-аватар ${avatar.name}`}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30" />

            <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/45 px-3 text-[13px] text-white backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                ИИ-аватар
              </span>
              <span className="inline-flex h-8 items-center gap-2 rounded-full bg-black/45 px-3 text-[13px] text-white backdrop-blur-md">
                <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
                  {BARS.slice(0, 5).map((h, i) => (
                    <span
                      key={`${voice.id}-${i}`}
                      className="w-[2px] origin-bottom rounded-full bg-white"
                      style={{ height: `${h * 100}%`, animation: `wave 0.9s ${i * 0.12}s ease-in-out infinite alternate` }}
                    />
                  ))}
                </span>
                {voice.name}
              </span>
            </div>

            <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
              <p className="text-[13px] text-white/60">
                {avatar.name} · {avatar.style}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={line}
                  className="mt-2 text-[20px] font-semibold leading-[1.3] text-white sm:text-[24px]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {line}
                </motion.p>
              </AnimatePresence>
              <div className="mt-4 flex h-6 items-center justify-between" aria-hidden>
                {[...BARS, ...BARS].map((h, i) => (
                  <span
                    key={`${voice.id}-${i}`}
                    className="w-[3px] shrink-0 origin-center rounded-full bg-white/70"
                    style={{ height: `${h * 100}%`, animation: `wave 1.1s ${(i % 7) * 0.09}s ease-in-out infinite alternate` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* выбор */}
        <Reveal delay={0.08} className="flex flex-col gap-10">
          <fieldset>
            <Legend n="01">Аватар</Legend>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup">
              {cfg.avatars.map((a) => {
                const on = a.id === avatarId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`${a.name}, ${a.style}`}
                    onClick={() => setAvatarId(a.id)}
                    className={`group relative aspect-[3/4] overflow-hidden rounded-[14px] text-left outline-none ring-offset-2 ring-offset-ink transition-[box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-white ${
                      on ? "ring-2 ring-white" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.image}
                      alt=""
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover transition-[filter,transform] duration-500 ease-soft group-hover:scale-[1.04] ${
                        on ? "" : "grayscale-[60%]"
                      }`}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute inset-x-2.5 bottom-2.5 sm:inset-x-3 sm:bottom-3">
                      <span className="block text-[14px] font-medium text-white sm:text-[15px]">{a.name}</span>
                      <span className="block truncate text-[11px] text-white/60 sm:text-[12px]">{a.style}</span>
                    </span>
                    {on && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <Legend n="02">Голос</Legend>
            <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup">
              {cfg.voices.map((v) => {
                const on = v.id === voiceId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setVoiceId(v.id)}
                    className={`flex items-center justify-between gap-4 rounded-[14px] border px-4 py-3.5 text-left transition-colors duration-200 ${
                      on ? "border-white bg-white text-ink" : "border-white/15 text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>
                      <span className="block text-[15px] font-medium leading-tight">{v.name}</span>
                      <span className={`mt-1 block text-[13px] ${on ? "text-muted" : "text-white/50"}`}>{v.text}</span>
                    </span>
                    <span className="flex h-5 shrink-0 items-end gap-[2px]" aria-hidden>
                      {BARS.slice(v.name.length % 4, (v.name.length % 4) + 5).map((h, i) => (
                        <span key={i} className={`w-[2px] rounded-full ${on ? "bg-ink" : "bg-white/40"}`} style={{ height: `${h * 100}%` }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="avatar-brand" className={legendClass}>
              <span className={numClass}>03</span>
              Ваш бренд или продукт
            </label>
            <input
              id="avatar-brand"
              value={brand}
              maxLength={40}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Например: клиника Smile"
              className="mt-4 h-12 w-full rounded-[12px] border border-white/15 bg-transparent px-4 text-[16px] text-white outline-none transition-colors placeholder:text-white/35 hover:border-white/30 focus:border-white"
            />
          </div>

          <div className="border-t border-white/10 pt-8">
            <Button variant="inverse" size="lg" className="w-full sm:w-auto" onClick={send}>
              {cfg.cta}
            </Button>
            <p className="mt-4 text-[14px] leading-[1.6] text-white/50">{cfg.note}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

const legendClass = "flex items-baseline gap-3 text-[17px] font-medium";
const numClass = "font-display text-[14px] tabular-nums text-white/40";

function Legend({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <legend className={legendClass}>
      <span className={numClass}>{n}</span>
      {children}
    </legend>
  );
}
