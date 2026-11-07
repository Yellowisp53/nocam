import { ArrowRight } from "lucide-react";
import { hero, works } from "@/data/content";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

const byId = (id: string) => works.find((w) => w.id === id) ?? works[0];

export function Hero() {
  const reel = byId(hero.showreelId);
  const [left, right] = hero.sideIds.map(byId);

  return (
    <section id="top" className="bg-bg pt-28 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8">
        <Reveal className="flex flex-col items-center text-center">
          <a
            href="#services"
            className="group inline-flex h-9 items-center gap-2 rounded-full bg-surface px-4 text-[14px] text-ink-2 transition-colors hover:bg-surface-2"
          >
            {hero.badge}
            <ArrowRight className="h-3.5 w-3.5 text-muted transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} />
          </a>

          <h1 className="heading mt-7 text-[44px] tracking-[-0.045em] sm:text-[56px] md:text-[72px] lg:text-[80px]">
            {hero.titleLine1}
            <br />
            <span className="text-muted">{hero.titleLine2}</span>
          </h1>

          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.6] text-muted md:text-[18px]">{hero.subtitle}</p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ButtonLink href="#contact" size="lg">
              {hero.primaryCta}
            </ButtonLink>
            <ButtonLink href="#works" size="lg" variant="secondary">
              {hero.secondaryCta}
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-14 md:mt-20">
          <div className="relative flex items-end justify-center gap-5 overflow-hidden rounded-[28px] bg-surface px-6 pt-10 pb-0 md:gap-8 md:px-10 md:pt-14">
            <VideoPlayer
              media={{ ...left, title: left.client }}
              autoPlay
              rounded="rounded-t-[20px]"
              className="hidden aspect-[9/16] w-[220px] lg:block"
            />
            <VideoPlayer
              media={{ ...reel, title: "Шоурил nocam" }}
              autoPlay
              rounded="rounded-t-[22px]"
              className="aspect-[9/16] w-full max-w-[300px] md:max-w-[320px]"
            />
            <VideoPlayer
              media={{ ...right, title: right.client }}
              autoPlay
              rounded="rounded-t-[20px]"
              className="hidden aspect-[9/16] w-[220px] lg:block"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
