import { FileVideo } from "lucide-react";
import { forwardRef, useState } from "react";
import type { VideoFormat } from "../data/types";

const ratio: Record<VideoFormat, string> = { "9:16": "9 / 16", "1:1": "1 / 1", "16:9": "16 / 9" };

/** Плеер. Файлы, загруженные в демо (blob:), живут до перезагрузки — тогда показываем заглушку. */
export const VideoBox = forwardRef<
  HTMLVideoElement,
  { src?: string; poster?: string; format?: VideoFormat; className?: string; onTimeUpdate?: (t: number) => void }
>(function VideoBox({ src, poster, format = "9:16", className = "", onTimeUpdate }, ref) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src) && failedSrc === src;

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-[16px] bg-black ${className}`}
      style={{ aspectRatio: ratio[format], maxHeight: "62vh" }}
    >
      {src && !failed ? (
        <video
          ref={ref}
          key={src}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-contain"
          onError={() => setFailedSrc(src)}
          onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-[13px] text-white/60">
          <FileVideo className="h-8 w-8" strokeWidth={1.5} />
          {failed ? "Файл был загружен в демо-режиме и пропал после перезагрузки" : "Видео пока нет"}
        </div>
      )}
    </div>
  );
});
