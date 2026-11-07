import { Plus, Send } from "lucide-react";
import { faq, telegramUrl } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export function Faq() {
  return (
    <Section id="faq" className="border-t border-line">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="heading text-[36px] md:text-[56px]">{faq.title}</h2>
            <p className="mt-5 text-[17px] text-muted">{faq.aside}</p>
            <ButtonLink href={telegramUrl()} target="_blank" rel="noreferrer" variant="secondary" className="mt-5">
              <Send className="h-4 w-4" strokeWidth={1.75} />
              {faq.asideCta}
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.06} className="lg:col-span-8">
          <div className="border-t border-line">
            {faq.items.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[18px] font-medium md:text-[20px]">
                  <span className="font-display tracking-[-0.02em]">{item.q}</span>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface transition-colors group-hover:bg-surface-2">
                    <Plus className="h-4 w-4 transition-transform duration-300 ease-soft group-open:rotate-45" strokeWidth={1.75} />
                  </span>
                </summary>
                <p className="max-w-[640px] pb-7 pr-12 text-[16px] leading-[1.65] text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
