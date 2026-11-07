/**
 * Обёртка над Telegram WebApp API. Вне Telegram всё работает в «браузерном» режиме:
 * вибрация молчит, подтверждения — через window.confirm, кнопки «Назад»/главная — свои.
 */
import { useEffect, useRef } from "react";

type HapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotifyType = "error" | "success" | "warning";

type BottomButton = {
  setParams(p: {
    text?: string;
    color?: string;
    text_color?: string;
    is_active?: boolean;
    is_visible?: boolean;
    has_shine_effect?: boolean;
  }): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
  show(): void;
  hide(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe: {
    user?: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string };
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  ready(): void;
  expand(): void;
  isVersionAtLeast(v: string): boolean;
  setHeaderColor(c: string): void;
  setBackgroundColor(c: string): void;
  setBottomBarColor?(c: string): void;
  disableVerticalSwipes?(): void;
  showConfirm(message: string, cb: (ok: boolean) => void): void;
  showAlert(message: string, cb?: () => void): void;
  openLink(url: string): void;
  HapticFeedback: {
    impactOccurred(style: HapticStyle): void;
    notificationOccurred(type: NotifyType): void;
    selectionChanged(): void;
  };
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  MainButton: BottomButton;
  SecondaryButton?: BottomButton & { setParams(p: { position?: "left" | "right" | "top" | "bottom" }): void };
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export const tg: TelegramWebApp | undefined = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
export const isTelegram = Boolean(tg?.initData);
export const tgUser = isTelegram ? tg?.initDataUnsafe.user : undefined;

const atLeast = (v: string) => Boolean(isTelegram && tg?.isVersionAtLeast?.(v));

export function initTelegram() {
  if (!tg || !isTelegram) return;
  tg.ready();
  tg.expand();
  try {
    if (atLeast("6.1")) {
      tg.setHeaderColor("secondary_bg_color");
      tg.setBackgroundColor("secondary_bg_color");
    }
    if (atLeast("7.10")) tg.setBottomBarColor?.("secondary_bg_color");
    // вертикальный свайп закрывает приложение — мешает перетаскиванию карточек
    if (atLeast("7.7")) tg.disableVerticalSwipes?.();
  } catch {
    /* старые клиенты */
  }
}

export const haptic = {
  impact(style: HapticStyle = "light") {
    if (atLeast("6.1")) tg!.HapticFeedback.impactOccurred(style);
  },
  notify(type: NotifyType) {
    if (atLeast("6.1")) tg!.HapticFeedback.notificationOccurred(type);
  },
  select() {
    if (atLeast("6.1")) tg!.HapticFeedback.selectionChanged();
  },
};

export function confirmDialog(message: string): Promise<boolean> {
  if (atLeast("6.2")) return new Promise((resolve) => tg!.showConfirm(message, resolve));
  return Promise.resolve(window.confirm(message));
}

/** Нативная кнопка «Назад» в Telegram. Возвращает true, если нужно рисовать свою (в браузере). */
export function useBackButton(onBack: (() => void) | null) {
  const cb = useRef(onBack);
  cb.current = onBack;
  const native = atLeast("6.1");
  const enabled = Boolean(onBack);

  useEffect(() => {
    if (!native || !enabled) return;
    const handler = () => cb.current?.();
    tg!.BackButton.onClick(handler);
    tg!.BackButton.show();
    return () => {
      tg!.BackButton.offClick(handler);
      tg!.BackButton.hide();
    };
  }, [native, enabled]);

  return !native && enabled;
}

export type MainButtonOptions = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
};

/** Нативная большая кнопка снизу. Возвращает true, если нужно рисовать свою (в браузере). */
export function useMainButton(opts: MainButtonOptions | null) {
  const cb = useRef(opts?.onClick);
  cb.current = opts?.onClick;
  const native = atLeast("6.1");
  const visible = Boolean(opts && opts.visible !== false);
  const text = opts?.text ?? "";
  const disabled = Boolean(opts?.disabled);
  const loading = Boolean(opts?.loading);

  useEffect(() => {
    if (!native) return;
    const mb = tg!.MainButton;
    if (!visible) {
      mb.hide();
      return;
    }
    const dark = tg!.colorScheme === "dark";
    mb.setParams({
      text,
      color: dark ? "#ffffff" : "#0d0d0d",
      text_color: dark ? "#0d0d0d" : "#ffffff",
      is_active: !disabled,
      is_visible: true,
    });
    if (loading) mb.showProgress(false);
    else mb.hideProgress();
    const handler = () => cb.current?.();
    mb.onClick(handler);
    return () => {
      mb.offClick(handler);
      mb.hide();
    };
  }, [native, visible, text, disabled, loading]);

  return !native && visible;
}

export function openLink(url: string) {
  if (isTelegram && tg) tg.openLink(url);
  else window.open(url, "_blank", "noopener");
}
