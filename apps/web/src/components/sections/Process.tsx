import { workflow } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

export function Process() {
  return (
    <Section id="process">
      <Reveal>
        <SectionHeader title={workflow.title} subtitle={workflow.subtitle} />
      </Reveal>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-4 lg:gap-5">
        {workflow.steps.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 0.06} className="flex h-full flex-col rounded-[20px] bg-surface p-6 md:p-7">
              <span className="font-display text-[15px] tabular-nums text-muted">{s.n}</span>
              <h3 className="heading mt-10 text-[24px] md:mt-14">{s.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-[1.6] text-muted">{s.text}</p>
              <span className="mt-6 inline-flex h-8 w-fit items-center rounded-full bg-bg px-3 text-[13px] text-ink-2">
                {s.time}
              </span>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
