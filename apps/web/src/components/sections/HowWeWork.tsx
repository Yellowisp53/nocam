import { howWeWork } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { EditorMockup } from "./EditorMockup";

export function HowWeWork() {
  return (
    <Section id="how" dark>
      <Reveal>
        <SectionHeader dark title={howWeWork.title} subtitle={howWeWork.subtitle} />
      </Reveal>

      <div className="mt-14 grid items-start gap-12 md:mt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <ol className="flex flex-col">
          {howWeWork.steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 0.06}
              className="flex gap-5 border-t border-white/10 py-6 first:border-t-0 first:pt-0 md:gap-6 md:py-7"
            >
                <span className="w-7 shrink-0 pt-1 font-display text-[15px] tabular-nums text-white/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="heading text-[22px] md:text-[24px]">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-white/60 md:text-[16px]">{step.text}</p>
                </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1}>
          <EditorMockup />
        </Reveal>
      </div>

      <Reveal>
        <p className="mt-16 border-t border-white/10 pt-8 text-[15px] text-white/50 md:mt-20">
          Работаем на профессиональном стеке:{" "}
          <span className="text-white/85">{howWeWork.stack.join(" · ")}</span>
        </p>
      </Reveal>
    </Section>
  );
}
