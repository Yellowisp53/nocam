"use client";

import { AnimatePresence, motion } from "motion/react";
import { Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Media = {
  video: string;
  preview: string;
  poster: string;
  title: string;
};

/**
 * Карточка-видео: постер → на hover (или когда карточка в кадре на телефоне) играет беззвучное превью;
 * по клику — полноэкранный просмотр со звуком.
 */
export function VideoPlayer({
  media,
  className = "",
  autoPlay = false,
  rounded = "rounded-[20px]",
  children,
}: {
  media: Media;
  className?: string;
  /** играть превью сразу (для шоурила) */
  autoPlay?: boolean;
  rounded?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setPlaying(true)).catch(() => {});
  }, []);
  const pause = useCallback(() => {
    videoRef.current?.pause();
    setPlaying(false);
  }, []);

  // На тач-устройствах нет hover — играем превью, пока карточка видна. Шоурил — всегда, когда виден.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const touch = window.matchMedia("(hover: none)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ((!touch && !autoPlay) || reduce) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : pause()),
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlay, play, pause]);

  return (
    <>
      <div
        ref={ref}
        className={`group relative overflow-hidden bg-ink-2 ${rounded} ${className}`}
        onMouseEnter={autoPlay ? undefined : play}
        onMouseLeave={autoPlay ? undefined : pause}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label={`Смотреть со звуком: ${media.title}`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.poster}
          alt=""
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
        />
        <video
          ref={videoRef}
          src={media.preview}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute bottom-3 left-3 z-20 inline-flex h-9 items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-[13px] font-medium text-ink backdrop-blur transition-transform duration-300 ease-soft group-hover:scale-[1.04]">
          <Play className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
          Смотреть
        </span>
        {children}
      </div>
      <VideoLightbox open={open} onClose={() => setOpen(false)} media={media} />
    </>
  );
}

export function VideoLightbox({ open, onClose, media }: { open: boolean; onClose: () => void; media: Media }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- портал доступен только на клиенте
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={media.title}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <motion.video
            key={media.video}
            src={media.video}
            poster={media.poster}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-auto max-w-full rounded-2xl bg-black"
            style={{ aspectRatio: "9 / 16" }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
