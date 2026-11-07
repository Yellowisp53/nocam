/**
 * Аккаунты посетителей (нужны, чтобы оставлять отзывы).
 * Сейчас — только фронтенд: аккаунт и сессия хранятся в localStorage этого браузера, пароль никуда не сохраняется.
 * Когда появится бэкенд: register / login / logout станут запросами к API (сервер проверит пароль
 * и выдаст сессию), useAccount — чтением текущей сессии. Компоненты менять не нужно.
 */
import { useSyncExternalStore } from "react";

export type Account = { id: string; name: string; email: string };

type Result = { ok: true; account: Account } | { ok: false; error: string };

const ACCOUNTS_KEY = "nocam:accounts";
const SESSION_KEY = "nocam:session";
const CHANGE_EVENT = "nocam:auth-change";

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим — аккаунт проживёт до перезагрузки */
  }
  cached = undefined;
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

const normEmail = (e: string) => e.trim().toLowerCase();
export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export async function register(input: { name: string; email: string; password: string }): Promise<Result> {
  await new Promise((r) => setTimeout(r, 600));
  const email = normEmail(input.email);
  const accounts = read<Account[]>(ACCOUNTS_KEY, []);
  if (accounts.some((a) => a.email === email)) return { ok: false, error: "Аккаунт с такой почтой уже есть — войдите" };
  const account: Account = { id: `u_${Date.now().toString(36)}`, name: input.name.trim(), email };
  write(ACCOUNTS_KEY, [...accounts, account]);
  write(SESSION_KEY, account);
  return { ok: true, account };
}

export async function login(input: { email: string; password: string }): Promise<Result> {
  await new Promise((r) => setTimeout(r, 600));
  const account = read<Account[]>(ACCOUNTS_KEY, []).find((a) => a.email === normEmail(input.email));
  // TODO(бэкенд): здесь сервер проверит пароль
  if (!account) return { ok: false, error: "Аккаунт не найден — зарегистрируйтесь" };
  write(SESSION_KEY, account);
  return { ok: true, account };
}

export function logout() {
  write(SESSION_KEY, null);
}

// ───────── текущий аккаунт

let cached: Account | null | undefined;

const subscribe = (cb: () => void) => {
  const onStorage = () => {
    cached = undefined;
    cb();
  };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
};

const getSnapshot = () => {
  if (cached === undefined) cached = read<Account | null>(SESSION_KEY, null);
  return cached;
};

export function useAccount(): Account | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

// ───────── окно входа: открывается из любого места сайта

export const AUTH_OPEN_EVENT = "nocam:auth-open";

export type AuthOpenDetail = { hint?: string; onSuccess?: () => void };

export function openAuth(detail: AuthOpenDetail = {}) {
  window.dispatchEvent(new CustomEvent<AuthOpenDetail>(AUTH_OPEN_EVENT, { detail }));
}
