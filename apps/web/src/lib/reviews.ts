/**
 * Отзывы посетителей. Сейчас — только фронтенд: отзывы хранятся в localStorage этого браузера.
 * Когда появится бэкенд: addReview станет POST-запросом (с модерацией), useReviews — загрузкой списка с сервера.
 */
import { useSyncExternalStore } from "react";
import type { Account } from "./auth";

export type Review = {
  id: string;
  accountId: string;
  name: string;
  /** кто автор: бизнес, должность, город */
  role: string;
  text: string;
  rating: number;
  at: string;
};

const KEY = "nocam:reviews";
const CHANGE_EVENT = "nocam:reviews-change";
const EMPTY: Review[] = [];

let cached: Review[] | undefined;

const read = (): Review[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Review[]) : EMPTY;
  } catch {
    return EMPTY;
  }
};

export type ReviewInput = { role: string; text: string; rating: number };
export type ReviewErrors = Partial<Record<keyof ReviewInput, string>>;

export function validateReview(r: ReviewInput): ReviewErrors {
  const errors: ReviewErrors = {};
  if (r.rating < 1 || r.rating > 5) errors.rating = "Поставьте оценку";
  if (r.role.trim().length < 3) errors.role = "Например: стоматологическая клиника, Минск";
  if (r.text.trim().length < 20) errors.text = "Напишите хотя бы пару предложений";
  return errors;
}

export async function addReview(account: Account, input: ReviewInput): Promise<Review> {
  await new Promise((r) => setTimeout(r, 600));
  const review: Review = {
    id: `r_${Date.now().toString(36)}`,
    accountId: account.id,
    name: account.name,
    role: input.role.trim(),
    text: input.text.trim(),
    rating: input.rating,
    at: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([review, ...read()]));
  } catch {
    /* переполнение или приватный режим */
  }
  cached = undefined;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return review;
}

const subscribe = (cb: () => void) => {
  const onChange = () => {
    cached = undefined;
    cb();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const getSnapshot = () => {
  if (cached === undefined) cached = read();
  return cached;
};

export function useReviews(): Review[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
