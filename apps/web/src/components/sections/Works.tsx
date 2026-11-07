"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import { workFilters, works, type WorkCategory } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

export function Works() {
  const [filter, setFilter] = useState<"all" | WorkCategory>("all");
  const list = useMemo(() => (filter === "all" ? works : works.filter((w) => w.category === filter)), [filter]);
  const available = new Set(works.map((w) => w.category));

  return (
    <Section id="works">
      <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="Работы"
          subtitle="Ролики, которые мы сделали для клиентов. Наведите, чтобы посмотреть превью, нажмите — со звуком."
        />
      </Reveal>

      <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
        {workFilters
          .filter((f) => f.id === "all" || available.has(f.id))
          .map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={`h-10 shrink-0 rounded-full px-4 text-[14px] transition-colors duration-200 ${
                  active ? "bg-ink text-white" : "bg-surface text-ink-2 hover:bg-surface-2"
                }`}
              >
                {f.label}
              </button>
            );
          })}
      </div>

      <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {list.map((w, i) => (
          <Reveal key={w.id} delay={i * 0.05} className="w-[78vw] max-w-[340px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <article>
              <VideoPlayer media={{ ...w, title: `${w.niche} · ${w.client}` }} className="aspect-[9/16] w-full">
                <span className="pointer-events-none absolute right-3 top-3 z-20 inline-flex h-7 items-center rounded-full bg-white/90 px-3 text-[12px] text-ink backdrop-blur">
                  {w.format}
                </span>
              </VideoPlayer>
              <div className="mt-5">
                <p className="text-[14px] text-muted">
                  {w.niche} · {w.client}
                </p>
                <p className="mt-2 text-[16px] leading-[1.55] text-ink">{w.description}</p>
                <span className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-3 text-[13px] text-ink-2">
                  <Check className="h-3.5 w-3.5 text-ink" strokeWidth={2} />
                  {w.service}
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
