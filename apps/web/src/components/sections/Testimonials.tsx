import { testimonials } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";

export function Testimonials() {
  return (
    <Section id="reviews" className="!pt-0">
      <Reveal>
        <SectionHeader title="Отзывы" />
      </Reveal>
      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-3 lg:gap-5">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.06}>
            <figure className="flex h-full flex-col rounded-[20px] bg-surface p-6 sm:p-8">
              <blockquote className="flex-1 text-[17px] leading-[1.6] text-ink">«{t.quote}»</blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-[16px] font-semibold text-white">
                  {t.name[0]}
                </span>
                <span>
                  <span className="block text-[15px] font-medium">{t.name}</span>
                  <span className="block text-[14px] text-muted">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
