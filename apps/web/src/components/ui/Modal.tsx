"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/** Модальное окно: затемнение, закрытие по Esc и клику мимо, блокировка прокрутки */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // фокус на первое поле
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("input, textarea, button")?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-t-[24px] bg-bg p-6 text-ink sm:rounded-[24px] sm:p-8"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const inputClass = (error: boolean) =>
  `h-12 w-full rounded-[12px] border bg-bg px-4 text-[16px] text-ink outline-none transition-colors duration-200 placeholder:text-[#a3a3a3] focus:border-ink ${
    error ? "border-danger" : "border-line hover:border-[#d4d4d4]"
  }`;

export function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[14px] font-medium">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[13px] text-danger">{error}</p>}
    </div>
  );
}
