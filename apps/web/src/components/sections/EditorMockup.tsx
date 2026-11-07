"use client";

import { useEffect, useState } from "react";
import { howWeWork } from "@/data/content";

const LOOP_SEC = 8;
const tones = ["bg-white/35", "bg-white/22", "bg-white/16", "bg-white/10"];

/** Ч/б макет редактора: превью 9:16 с субтитрами (текущее слово подсвечено) и таймлайн с плейхедом */
export function EditorMockup() {
  const words = howWeWork.subtitleWords;
  const [active, setActive] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const t = ((performance.now() - started) / 1000) % LOOP_SEC;
      setTime(t);
      setActive(Math.floor((t / LOOP_SEC) * words.length * 2) % words.length);
    }, 100);
    return () => window.clearInterval(id);
  }, [words.length]);

  const tc = `00:${String(Math.floor(time)).padStart(2, "0")}:${String(Math.floor((time % 1) * 25)).padStart(2, "0")}`;

  return (
    <div className="rounded-[20px] border border-white/10 bg-[#151515] p-3 md:p-4" aria-hidden>
      {/* верхняя панель */}
      <div className="flex items-center justify-between px-1 pb-3 text-[12px] text-white/45">
        <span>Стоматология · ролик 03 · v2</span>
        <span className="tabular-nums">{tc}</span>
      </div>

      <div className="grid grid-cols-[1fr] gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
        {/* превью */}
        <div className="flex justify-center rounded-[14px] bg-black/40 py-4">
          <div className="relative aspect-[9/16] h-[280px] overflow-hidden rounded-[12px] bg-ink-2 md:h-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/editor-frame.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-x-3 bottom-[22%] flex flex-wrap justify-center gap-x-1.5 gap-y-1 text-center">
              {words.map((w, i) => (
                <span
                  key={w}
                  className={`rounded-[6px] px-1.5 py-0.5 font-display text-[15px] font-bold leading-tight tracking-[-0.02em] transition-colors duration-150 ${
                    i === active ? "bg-white text-ink" : "text-white"
                  }`}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* панель свойств */}
        <div className="hidden flex-col gap-3 rounded-[14px] bg-black/40 p-3 text-[11px] text-white/45 sm:flex">
          {["Формат", "Субтитры", "Голос", "Цвет"].map((label, i) => (
            <div key={label}>
              <div>{label}</div>
              <div className="mt-1.5 h-6 rounded-md bg-white/[0.07] px-2 leading-6 text-white/70">
                {["9:16 · 1080p", "Слово за словом", "Аватар · RU", "Нейтральный"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* таймлайн */}
      <div className="mt-3 rounded-[14px] bg-black/40 p-3">
        <div className="relative">
          <div className="ml-[76px] flex justify-between pb-2 text-[10px] tabular-nums text-white/30">
            {[0, 2, 4, 6, 8].map((s) => (
              <span key={s}>0:0{s}</span>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            {howWeWork.tracks.map((track, ti) => (
              <div key={track.name} className="flex items-center gap-2">
                <span className="w-[68px] shrink-0 truncate text-[11px] text-white/50">{track.name}</span>
                <div className="relative h-6 flex-1 rounded-md bg-white/[0.04]">
                  {track.clips.map(([from, to]) => (
                    <span
                      key={`${from}-${to}`}
                      className={`absolute inset-y-0.5 rounded-[5px] ${tones[ti]}`}
                      style={{ left: `${from}%`, width: `${to - from}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* плейхед */}
          <div className="pointer-events-none absolute inset-y-0 left-[76px] right-0">
            <span
              className="absolute top-0 bottom-0 w-px bg-white"
              style={{ left: `${(time / LOOP_SEC) * 100}%` }}
            >
              <span className="absolute -left-[4px] -top-0.5 h-2.5 w-[9px] rounded-[2px] bg-white" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
