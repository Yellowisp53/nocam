/**
 * Загрузка видео во фронтенд-версии: файл живёт как blob:-ссылка до перезагрузки страницы.
 * Постер (кадр на 0.5 c) сохраняем как маленький JPEG data URL — он переживает перезагрузку.
 * На этапе бэкенда здесь будет загрузка в хранилище.
 */
export async function fileToVideo(file: File): Promise<{ url: string; poster?: string; name: string }> {
  const url = URL.createObjectURL(file);
  const poster = await capturePoster(url).catch(() => undefined);
  return { url, poster, name: file.name };
}

function capturePoster(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.src = url;
    const timeout = window.setTimeout(() => reject(new Error("timeout")), 6000);
    v.addEventListener("loadeddata", () => {
      v.currentTime = Math.min(0.5, (v.duration || 1) / 2);
    });
    v.addEventListener("seeked", () => {
      try {
        const w = 180;
        const h = Math.round((v.videoHeight / v.videoWidth) * w) || 320;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d")!.drawImage(v, 0, 0, w, h);
        window.clearTimeout(timeout);
        resolve(c.toDataURL("image/jpeg", 0.7));
      } catch (e) {
        reject(e);
      }
    });
    v.addEventListener("error", () => reject(new Error("video error")));
  });
}

export const isUrl = (s: string) => /^https?:\/\/\S+\.\S+/.test(s.trim());
