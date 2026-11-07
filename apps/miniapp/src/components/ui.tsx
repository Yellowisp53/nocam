import { ChevronLeft, X } from "lucide-react";
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { columnById } from "../data/config";
import type { ColumnId, User } from "../data/types";
import { initials } from "../lib/format";
import { useBackButton, useMainButton, type MainButtonOptions } from "../lib/telegram";

// ───────────────── Логотип (один компонент — заменить здесь)

export function Logo({ className = "" }: { className?: string }) {
  const w = "0.065em";
  const c = "absolute h-[0.36em] w-[0.36em] border-current";
  return (
    <span
      role="img"
      aria-label="nocam"
      className={`relative inline-flex items-center px-[0.34em] py-[0.16em] font-display text-[18px] font-bold leading-none tracking-[-0.045em] ${className}`}
    >
      <span aria-hidden className={`${c} left-0 top-0 rounded-tl-[0.1em]`} style={{ borderLeftWidth: w, borderTopWidth: w }} />
      <span aria-hidden className={`${c} right-0 top-0 rounded-tr-[0.1em]`} style={{ borderRightWidth: w, borderTopWidth: w }} />
      <span aria-hidden className={`${c} bottom-0 left-0 rounded-bl-[0.1em]`} style={{ borderLeftWidth: w, borderBottomWidth: w }} />
      <span aria-hidden className={`${c} bottom-0 right-0 rounded-br-[0.1em]`} style={{ borderRightWidth: w, borderBottomWidth: w }} />
      <span aria-hidden className="inline-flex items-center">
        N
        <svg viewBox="0 0 24 24" className="mx-[0.03em] h-[0.72em] w-[0.72em]">
          <circle cx="12" cy="12" r="11" fill="currentColor" />
          <path
            d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83m13.79-4-5.74 9.94"
            stroke="var(--app-card)"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        Cam
      </span>
    </span>
  );
}

// ───────────────── Кнопки

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-ink text-card active:opacity-85",
  secondary: "bg-soft text-ink active:bg-soft-2",
  ghost: "text-ink active:bg-soft",
  danger: "bg-soft text-danger active:bg-soft-2",
};

export function Btn({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-9 px-3.5 text-[14px]", md: "h-11 px-4 text-[15px]", lg: "h-12 px-5 text-[16px]" };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[opacity,background-color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${sizes[size]} ${btnVariants[variant]} ${className}`}
      {...rest}
    />
  );
}

export function IconBtn({ className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-soft ${className}`}
      {...rest}
    />
  );
}

// ───────────────── Аватар-инициалы

export function Avatar({ user, size = 28 }: { user?: User; size?: number }) {
  if (!user) return null;
  const light = ["#9a9a9a", "#b5b5b5"].includes(user.color);
  return (
    <span
      title={user.name}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: user.color,
        color: light ? "#0d0d0d" : "#ffffff",
      }}
    >
      {initials(user.name)}
    </span>
  );
}

// ───────────────── Статус столбца

export function StatusPill({ column }: { column: ColumnId }) {
  const col = columnById(column);
  const Icon = col.icon;
  const tone =
    column === "revisions"
      ? "bg-[color-mix(in_srgb,var(--app-danger)_12%,transparent)] text-danger"
      : column === "ready"
        ? "bg-[color-mix(in_srgb,#1f9d55_12%,transparent)] text-success"
        : "bg-soft text-ink";
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium ${tone}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {col.title}
    </span>
  );
}

// ───────────────── Группа / карточка

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-[16px] bg-card ${className}`}>{children}</div>;
}

export function GroupTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-1 pb-2 pt-5">
      <h3 className="text-[13px] font-medium text-hint">{children}</h3>
      {action}
    </div>
  );
}

export function Empty({ icon, title, text }: { icon?: ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      {icon && <div className="mb-3 text-hint">{icon}</div>}
      <p className="text-[15px] font-medium">{title}</p>
      {text && <p className="mt-1 text-[14px] text-hint">{text}</p>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: { id: T; label: ReactNode }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={`no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-soft p-1 ${className}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`h-8 shrink-0 grow rounded-full px-3 text-[13px] font-medium transition-colors ${
            value === o.id ? "bg-card text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "text-hint"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-hint">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[12px] text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-hint">{hint}</span>
      ) : null}
    </label>
  );
}

// ───────────────── Нижняя шторка

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-sheet relative flex max-h-[88vh] w-full max-w-[560px] flex-col rounded-t-[22px] bg-app">
        <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-soft-2" />
        <div className="flex items-center justify-between px-4 pb-1 pt-2">
          <h2 className="heading text-[19px]">{title}</h2>
          <IconBtn onClick={onClose} aria-label="Закрыть" className="-mr-2">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </IconBtn>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <div className="border-t border-line bg-app px-4 pb-[calc(12px+var(--safe-bottom))] pt-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

// ───────────────── Экран: заголовок + назад + главная кнопка

export function Screen({
  title,
  subtitle,
  onBack,
  right,
  main,
  children,
  bare,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  main?: MainButtonOptions | null;
  children: ReactNode;
  /** без шапки (свой хедер внутри) */
  bare?: boolean;
}) {
  const ownBack = useBackButton(onBack ?? null);
  const ownMain = useMainButton(main ?? null);

  return (
    <div className="animate-screen flex min-h-full flex-col">
      {!bare && (
        <header className="sticky top-0 z-30 flex min-h-[52px] items-center gap-1 bg-app/95 px-2 backdrop-blur-md">
          {ownBack ? (
            <IconBtn onClick={onBack} aria-label="Назад">
              <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
            </IconBtn>
          ) : (
            <span className="w-2" />
          )}
          <div className="min-w-0 flex-1">
            {title && <h1 className="heading truncate text-[20px]">{title}</h1>}
            {subtitle && <p className="truncate text-[12px] text-hint">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className={`flex-1 ${ownMain ? "pb-24" : ""}`}>{children}</div>
      {ownMain && main && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[560px] bg-gradient-to-t from-app via-app to-transparent px-4 pb-[calc(12px+var(--safe-bottom))] pt-4">
          <Btn size="lg" className="w-full" disabled={main.disabled || main.loading} onClick={main.onClick}>
            {main.loading ? "…" : main.text}
          </Btn>
        </div>
      )}
    </div>
  );
}
