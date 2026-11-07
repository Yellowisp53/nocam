/**
 * Отправка заявки. Сейчас — имитация (задержка + сохранение в localStorage).
 * Когда появится бэкенд: заменить тело submitLead на fetch(API_URL, …) — компоненты менять не нужно.
 */
export type Lead = {
  name: string;
  contact: string;
  task: string;
};

const STORAGE_KEY = "nocam:leads";

export async function submitLead(lead: Lead): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 900));
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    all.push({ ...lead, at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage недоступен — не страшно */
  }
  return { ok: true };
}

export type LeadErrors = Partial<Record<keyof Lead, string>>;

export function validateLead(lead: Lead): LeadErrors {
  const errors: LeadErrors = {};
  if (lead.name.trim().length < 2) errors.name = "Как к вам обращаться?";
  const c = lead.contact.trim();
  const digits = c.replace(/\D/g, "");
  const isPhone = digits.length >= 10 && digits.length <= 15 && /^[+\d\s()-]+$/.test(c);
  const isTelegram = /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(c) || /t\.me\/[a-zA-Z0-9_]{5,}/.test(c);
  if (!c) errors.contact = "Оставьте телефон или Telegram";
  else if (!isPhone && !isTelegram) errors.contact = "Например: +7 900 000-00-00 или @username";
  if (lead.task.trim().length < 10) errors.task = "Опишите задачу хотя бы в паре слов";
  return errors;
}

/** Калькулятор → форма: подставить расчёт в поле «Задача» */
export const PREFILL_EVENT = "nocam:prefill";

export function prefillLead(task: string) {
  window.dispatchEvent(new CustomEvent<string>(PREFILL_EVENT, { detail: task }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}
