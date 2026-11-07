/** Плашка «Демо в браузере» сверху и вкладки снизу */
import { Check, KanbanSquare, ListTodo, UserRound, Users, Wallet, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useStore } from "../data/store";
import { useNav, type Tab } from "../lib/nav";
import { haptic, isTelegram } from "../lib/telegram";
import { useToast } from "./Toast";
import { Avatar, Sheet } from "./ui";

export function DemoBar() {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  if (isTelegram) return null;
  return (
    <>
      <div className="flex h-8 items-center justify-center gap-1.5 bg-[#0d0d0d] px-3 text-[12px] text-white/70">
        Демо в браузере · вы: <span className="font-medium text-white">{me.name}</span> ·
        <button type="button" onClick={() => setOpen(true)} className="font-medium text-white underline underline-offset-2">
          сменить
        </button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Войти как">
        <div className="overflow-hidden rounded-[16px] bg-card">
          {state.users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                actions.switchUser(u.id);
                setOpen(false);
                toast(`Вы вошли как ${u.name}`, "info");
              }}
              className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-b-0 active:bg-soft"
            >
              <Avatar user={u} size={34} />
              <span className="flex-1">
                <span className="block text-[15px] font-medium">{u.name}</span>
                <span className="block text-[12px] text-hint">{u.role === "admin" ? "Администратор" : "Монтажёр"}</span>
              </span>
              {u.id === me.id && <Check className="h-5 w-5" strokeWidth={2} />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

const ADMIN_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "board", label: "Доска", icon: KanbanSquare },
  { id: "attention", label: "Задачи", icon: ListTodo },
  { id: "team", label: "Команда", icon: Users },
  { id: "profile", label: "Профиль", icon: UserRound },
];
const EDITOR_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "board", label: "Доска", icon: KanbanSquare },
  { id: "cabinet", label: "Кабинет", icon: Wallet },
  { id: "profile", label: "Профиль", icon: UserRound },
];

export const tabsFor = (role: "admin" | "editor") => (role === "admin" ? ADMIN_TABS : EDITOR_TABS);

export function TabBar({ badges }: { badges?: Partial<Record<Tab, number>> }) {
  const { me } = useStore();
  const nav = useNav();
  const tabs = tabsFor(me.role);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-app/95 pb-[var(--safe-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[560px]">
        {tabs.map((t) => {
          const active = nav.tab === t.id;
          const Icon = t.icon;
          const badge = badges?.[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                haptic.select();
                nav.setTab(t.id);
              }}
              className={`relative flex h-[58px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                active ? "text-ink" : "text-hint"
              }`}
            >
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2 : 1.6} />
                {badge ? (
                  <span className="absolute -right-2.5 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                    {badge}
                  </span>
                ) : null}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
