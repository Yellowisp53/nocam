/**
 * Логотип nocam — ОДИН компонент на всё приложение, заменять здесь.
 * Векторная версия знака из public/brand/logo-original.png:
 * рамка видоискателя + «o» в виде диафрагмы. Цвет — currentColor,
 * поэтому знак работает и на белом, и на чёрном фоне.
 */
type Props = { className?: string; size?: "sm" | "md" | "lg" };

const sizes = {
  sm: "text-[18px]",
  md: "text-[21px]",
  lg: "text-[44px]",
};

export function Logo({ className = "", size = "md" }: Props) {
  return (
    <span
      role="img"
      aria-label="nocam"
      className={`relative inline-flex items-center px-[0.34em] py-[0.16em] font-display font-bold leading-none tracking-[-0.045em] select-none ${sizes[size]} ${className}`}
    >
      <Corners />
      <span aria-hidden className="inline-flex items-center">
        N
        <Aperture />
        Cam
      </span>
    </span>
  );
}

/** Диафрагма: залитый круг с «вырезанными» лепестками (цвет вырезов = фон через --logo-cut) */
function Aperture() {
  return (
    <svg viewBox="0 0 24 24" className="mx-[0.03em] h-[0.72em] w-[0.72em] translate-y-[0.02em]" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <g stroke="var(--logo-cut, #fff)" strokeWidth="1.7" strokeLinecap="round" fill="none">
        <path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83m13.79-4-5.74 9.94" />
      </g>
    </svg>
  );
}

function Corners() {
  const c = "absolute h-[0.36em] w-[0.36em] border-current";
  const w = "0.065em";
  return (
    <span aria-hidden className="pointer-events-none">
      <span className={`${c} left-0 top-0 rounded-tl-[0.1em]`} style={{ borderLeftWidth: w, borderTopWidth: w }} />
      <span className={`${c} right-0 top-0 rounded-tr-[0.1em]`} style={{ borderRightWidth: w, borderTopWidth: w }} />
      <span className={`${c} bottom-0 left-0 rounded-bl-[0.1em]`} style={{ borderLeftWidth: w, borderBottomWidth: w }} />
      <span className={`${c} bottom-0 right-0 rounded-br-[0.1em]`} style={{ borderRightWidth: w, borderBottomWidth: w }} />
    </span>
  );
}
