"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AUTH_OPEN_EVENT, isEmail, login, register, type AuthOpenDetail } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Field, Modal, inputClass } from "@/components/ui/Modal";

type Mode = "register" | "login";
type Form = { name: string; email: string; password: string };
type Errors = Partial<Record<keyof Form | "form", string>>;

const empty: Form = { name: "", email: "", password: "" };

function validate(mode: Mode, f: Form): Errors {
  const e: Errors = {};
  if (mode === "register" && f.name.trim().length < 2) e.name = "Как к вам обращаться?";
  if (!isEmail(f.email)) e.email = "Проверьте почту";
  if (mode === "register" && f.password.length < 8) e.password = "Минимум 8 символов";
  if (mode === "login" && !f.password) e.password = "Введите пароль";
  return e;
}

/** Регистрация и вход. Открывается через openAuth() из шапки или раздела «Отзывы» */
export function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("register");
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [hint, setHint] = useState<string>();
  const onSuccess = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<AuthOpenDetail>).detail ?? {};
      setHint(d.hint);
      onSuccess.current = d.onSuccess;
      setErrors({});
      setOpen(true);
    };
    window.addEventListener(AUTH_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(AUTH_OPEN_EVENT, onOpen);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
  };

  const update = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(mode, form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);
    const res = mode === "register" ? await register(form) : await login(form);
    setSending(false);
    if (!res.ok) return setErrors({ form: res.error });
    setForm(empty);
    setOpen(false);
    onSuccess.current?.();
  };

  return (
    <Modal open={open} onClose={close} title={mode === "register" ? "Регистрация" : "Вход"}>
      <h2 className="heading pr-10 text-[28px]">{mode === "register" ? "Регистрация" : "Вход"}</h2>
      {hint && <p className="mt-2 text-[15px] text-muted">{hint}</p>}

      <div className="mt-6 grid grid-cols-2 rounded-full bg-surface p-1" role="tablist">
        {(["register", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`h-10 rounded-full text-[15px] font-medium transition-colors ${
              mode === m ? "bg-bg text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {m === "register" ? "Регистрация" : "Вход"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        {mode === "register" && (
          <Field label="Имя" error={errors.name} htmlFor="auth-name">
            <input
              id="auth-name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass(!!errors.name)}
              placeholder="Как к вам обращаться"
            />
          </Field>
        )}
        <Field label="Почта" error={errors.email} htmlFor="auth-email">
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass(!!errors.email)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Пароль" error={errors.password} htmlFor="auth-password">
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClass(!!errors.password)}
            placeholder={mode === "register" ? "Минимум 8 символов" : ""}
          />
        </Field>

        {errors.form && (
          <p className="rounded-[12px] bg-surface px-4 py-3 text-[14px] text-danger" role="alert">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={sending}>
          {sending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
          {mode === "register" ? "Зарегистрироваться" : "Войти"}
        </Button>
      </form>
    </Modal>
  );
}
