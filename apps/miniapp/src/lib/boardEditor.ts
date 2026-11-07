/**
 * Какого монтажёра админ сейчас ведёт на доске. Админ не видит общую кучу задач:
 * выбирает человека, смотрит его доску, подтягивает или оттягивает его карточки и раздаёт задачи ему.
 * Выбор запоминается (экран доски пересоздаётся при переходах).
 */
import { useSyncExternalStore } from "react";

const KEY = "nocam-miniapp:board-editor";
const EVENT = "nocam-miniapp:board-editor";

let cached: string | null | undefined;

const read = () => {
  if (cached === undefined) {
    try {
      cached = localStorage.getItem(KEY);
    } catch {
      cached = null;
    }
  }
  return cached;
};

export function setBoardEditor(id: string) {
  cached = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* приватный режим */
  }
  window.dispatchEvent(new Event(EVENT));
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

/** id выбранного монтажёра; если сохранённого нет среди editorIds — первый из списка */
export function useBoardEditor(editorIds: string[]): string | undefined {
  const saved = useSyncExternalStore(subscribe, read, () => null);
  return saved && editorIds.includes(saved) ? saved : editorIds[0];
}
