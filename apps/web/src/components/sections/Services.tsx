import { ArrowRight } from "lucide-react";
import { services } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

const spans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

export function Services() {
  return (
    <Section id="services" className="!pt-0 md:!pt-8">
      <Reveal>
        <SectionHeader
          title="Услуги"
          subtitle="Мы не продаём ролики поштучно — строим систему видеоконтента: от 1 до 3 готовых роликов каждый день. Вот из чего она состоит."
        />
      </Reveal>

      <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12 md:gap-5">
        {services.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.05} className={spans[i]}>
            <a
              href="#pricing"
              className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface transition-colors duration-300 hover:bg-surface-2"
            >
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="heading text-[26px] md:text-[30px]">{s.title}</h3>
                <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-muted md:text-[16px]">{s.text}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-ink">
                  {s.plans}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
                </span>
              </div>
              <div className="relative mx-3 mb-3 h-[220px] overflow-hidden rounded-[14px] md:mx-4 md:mb-4 md:h-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_28%] grayscale transition-[filter,transform] duration-700 ease-soft group-hover:scale-[1.03] group-hover:grayscale-0"
                />
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
