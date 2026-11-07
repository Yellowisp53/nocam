const rub = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
export const formatRub = (n: number) => rub.format(Math.round(n));

export function plural(n: number, forms: [string, string, string]) {
  const n10 = Math.abs(n) % 10;
  const n100 = Math.abs(n) % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

/** 75 → «1:15» */
export function formatTimecode(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Дедлайн человеческим языком: «через 5 ч», «завтра», «просрочено на 2 дн» */
export function deadlineLabel(deadline: number, now = Date.now()) {
  const diff = deadline - now;
  if (diff < 0) {
    const late = -diff;
    if (late < HOUR) return "просрочено";
    if (late < DAY) return `просрочено на ${Math.max(1, Math.floor(late / HOUR))} ч`;
    const d = Math.round(late / DAY);
    return `просрочено на ${d} ${plural(d, ["день", "дня", "дней"])}`;
  }
  if (diff < HOUR) return "меньше часа";
  if (diff < DAY) return `через ${Math.max(1, Math.floor(diff / HOUR))} ч`;
  const d = Math.round(diff / DAY);
  if (d === 1) return "завтра";
  return `через ${d} ${plural(d, ["день", "дня", "дней"])}`;
}

export type DeadlineState = "overdue" | "soon" | "ok";
export function deadlineState(deadline: number, now = Date.now()): DeadlineState {
  if (deadline < now) return "overdue";
  if (deadline - now < DAY) return "soon";
  return "ok";
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });
const dateTimeFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" });

export const formatDate = (t: number) => dateFmt.format(t);
export const formatDateTime = (t: number) => dateTimeFmt.format(t);
export const formatTime = (t: number) => timeFmt.format(t);

/** «только что», «12 мин назад», «вчера, 14:20», «3 нояб., 14:20» */
export function ago(t: number, now = Date.now()) {
  const diff = now - t;
  if (diff < 60_000) return "только что";
  if (diff < HOUR) return `${Math.floor(diff / 60_000)} мин назад`;
  if (diff < DAY && new Date(t).getDate() === new Date(now).getDate()) return `сегодня, ${formatTime(t)}`;
  if (diff < 2 * DAY) return `вчера, ${formatTime(t)}`;
  return formatDateTime(t);
}

/** для <input type="datetime-local"> */
export function toLocalInput(t: number) {
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const isThisMonth = (t: number, now = Date.now()) => {
  const a = new Date(t);
  const b = new Date(now);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export { HOUR, DAY };
