"use client";

import { AnimatePresence, motion } from "motion/react";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav } from "@/data/content";
import { logout, openAuth, useAccount } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const account = useAccount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md transition-[border-color] duration-300 border-b ${
        scrolled || open ? "border-line" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6 md:px-8">
        <a href="#top" aria-label="nocam — на главную" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Основное меню">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-[15px] text-muted transition-colors duration-200 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AccountButton className="max-lg:hidden" />
          <ButtonLink href="#contact" className="max-sm:hidden" size="md">
            Обсудить проект
          </ButtonLink>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface lg:hidden"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-0 top-16 bottom-0 bg-white lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="flex flex-col px-4 pt-4" aria-label="Мобильное меню">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="heading border-b border-line py-5 text-[28px]"
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (account) logout();
                  else openAuth();
                }}
                className="heading flex items-center justify-between border-b border-line py-5 text-left text-[28px]"
              >
                {account ? `Выйти (${account.name})` : "Войти"}
                {account ? <LogOut className="h-6 w-6" strokeWidth={1.5} /> : <UserRound className="h-6 w-6" strokeWidth={1.5} />}
              </button>
              <ButtonLink href="#contact" size="lg" className="mt-8 w-full" onClick={() => setOpen(false)}>
                Обсудить проект
              </ButtonLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function AccountButton({ className = "" }: { className?: string }) {
  const account = useAccount();
  const [menu, setMenu] = useState(false);

  if (!account)
    return (
      <button
        type="button"
        onClick={() => openAuth()}
        className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] text-muted transition-colors hover:bg-surface hover:text-ink ${className}`}
      >
        <UserRound className="h-4 w-4" strokeWidth={1.75} />
        Войти
      </button>
    );

  return (
    <div className={`relative ${className}`} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setMenu(false)}>
      <button
        type="button"
        onClick={() => setMenu((v) => !v)}
        aria-expanded={menu}
        aria-label={`Аккаунт: ${account.name}`}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface font-display text-[16px] font-semibold uppercase transition-colors hover:bg-surface-2"
      >
        {account.name[0]}
      </button>
      {menu && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[240px] rounded-[16px] border border-line bg-bg p-2 shadow-lg">
          <div className="px-3 py-2">
            <p className="truncate text-[15px] font-medium">{account.name}</p>
            <p className="truncate text-[13px] text-muted">{account.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              logout();
            }}
            className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-surface"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
