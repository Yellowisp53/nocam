import { niches } from "@/data/content";

export function Niches() {
  return (
    <div className="border-y border-line bg-bg">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-7 sm:px-6 md:px-8">
        <p className="text-center text-[15px] leading-[1.8] text-muted md:text-[16px]">
          <span className="text-ink">Делаем ролики для:</span>{" "}
          {niches.map((n, i) => (
            <span key={n}>
              {n}
              {i < niches.length - 1 && <span className="mx-2.5 text-line">·</span>}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
