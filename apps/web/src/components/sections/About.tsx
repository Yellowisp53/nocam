import { about } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Reveal>
          <h2 className="heading text-[36px] md:text-[56px]">{about.title}</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="heading text-[24px] leading-[1.25] md:text-[32px]">{about.lead}</p>
          {about.text.map((t) => (
            <p key={t} className="mt-5 text-[17px] leading-[1.65] text-muted md:text-[18px]">
              {t}
            </p>
          ))}
        </Reveal>
      </div>

      <dl className="mt-14 grid grid-cols-2 gap-4 md:mt-20 lg:grid-cols-4 lg:gap-5">
        {about.facts.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.05} className="flex flex-col-reverse justify-end rounded-[20px] bg-surface p-6 md:p-7">
            <dt className="mt-3 text-[14px] leading-[1.5] text-muted md:text-[15px]">{f.label}</dt>
            <dd className="font-display text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums md:text-[52px]">
              {f.value}
            </dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
