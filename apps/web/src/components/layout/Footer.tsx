import { footer, nav, site, telegramUrl } from "@/data/content";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:px-8 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[320px]">
            <Logo />
            <p className="mt-4 text-[15px] text-muted">Видео и AI-аватары для бизнеса. Без единой съёмки.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[15px]">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="text-muted transition-colors hover:text-ink">
                {item.label}
              </a>
            ))}
            <a href={telegramUrl()} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-ink">
              Telegram
            </a>
            <a href={`mailto:${site.contacts.email}`} className="text-muted transition-colors hover:text-ink">
              Почта
            </a>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-muted md:flex-row md:justify-between">
          <span>{footer.copyright}</span>
          <span>{footer.consent}</span>
        </div>
      </div>
    </footer>
  );
}
