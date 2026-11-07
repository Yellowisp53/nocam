import type { ReactNode } from "react";

type Props = {
  id?: string;
  dark?: boolean;
  /** светло-серая подложка вместо белой */
  surface?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
};

/** Секция страницы: контент по центру, max-width 1200px, отступы py-20 / md:py-32 */
export function Section({ id, dark, surface, className = "", containerClassName = "", children }: Props) {
  const tone = dark ? "bg-ink text-white [--logo-cut:#0d0d0d]" : surface ? "bg-surface text-ink" : "bg-bg text-ink";
  return (
    <section
      id={id}
      className={`${tone} py-20 md:py-32 ${className}`}
    >
      <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 ${containerClassName}`}>{children}</div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  dark,
  align = "left",
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-[720px] ${className}`}>
      <h2 className="heading text-[36px] md:text-[56px]">{title}</h2>
      {subtitle && (
        <p className={`mt-5 text-[17px] leading-[1.6] md:text-[18px] ${dark ? "text-white/60" : "text-muted"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
