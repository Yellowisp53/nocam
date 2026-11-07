import { ArrowUpRight, Check } from "lucide-react";
import { cases } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

export function Cases() {
  return (
    <Section id="cases" dark>
      <Reveal>
        <SectionHeader title={cases.title} subtitle={cases.subtitle} dark />
      </Reveal>

      <div className="mt-12 space-y-4 md:mt-16 md:space-y-5">
        {cases.items.map((c, i) => {
          const url = `https://www.instagram.com/${c.handle}/`;
          return (
            <Reveal key={c.id} delay={i * 0.06}>
              <article className="grid gap-8 rounded-[20px] bg-white/[0.06] p-5 sm:p-7 md:p-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
                <div className="flex flex-col">
                  <a href={url} target="_blank" rel="noreferrer" className="group flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.avatar} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                    <span className="min-w-0">
                      <span className="heading block text-[24px] md:text-[28px]">{c.name}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[14px] text-white/50 transition-colors group-hover:text-white">
                        @{c.handle}
                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </span>
                    </span>
                  </a>

                  <p className="mt-6 text-[14px] text-white/50">{c.niche}</p>
                  <p className="mt-2 text-[16px] leading-[1.6] text-white/80">{c.about}</p>

                  <span className="mt-5 inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 text-[13px] text-white/85">
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    {c.service}
                  </span>

                  <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 lg:mt-auto">
                    {c.stats.map((s) => (
                      <div key={s.label} className="flex flex-col-reverse">
                        <dt className="mt-2 text-[14px] text-white/50">{s.label}</dt>
                        <dd className="font-display text-[32px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[40px]">
                          {s.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <a href={url} target="_blank" rel="noreferrer" className="grid grid-cols-3 gap-2 sm:gap-3" aria-label={`Instagram @${c.handle}`}>
                  {c.images.map((src) => (
                    <span key={src} className="relative aspect-[9/16] overflow-hidden rounded-[12px] bg-white/5 md:rounded-[14px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-soft hover:scale-[1.03]"
                      />
                    </span>
                  ))}
                </a>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
