import { ChevronRight, FolderOpen, Wallet } from "lucide-react";
import { useState } from "react";
import { FORMATS } from "../data/config";
import { balanceOf, editors, editorStats, isOverdue, useStore } from "../data/store";
import type { VideoFormat } from "../data/types";
import { formatRub, isThisMonth, plural } from "../lib/format";
import { useNav } from "../lib/nav";
import { useToast } from "../components/Toast";
import { Avatar, Btn, Card, Field, GroupTitle, Screen, Sheet } from "../components/ui";

/** Вкладка админа «Команда»: финансы, монтажёры, категории, цены по умолчанию */
export function Team() {
  const { state } = useStore();
  const nav = useNav();
  const [priceFormat, setPriceFormat] = useState<VideoFormat | null>(null);

  const team = editors(state);
  const acceptedThisMonth = state.tasks.filter((t) => t.acceptedAt && isThisMonth(t.acceptedAt));
  const totalDue = team.reduce((s, u) => s + balanceOf(state, u.id).due, 0);
  const overdue = state.tasks.filter((t) => isOverdue(t)).length;

  return (
    <Screen title="Команда">
      <div className="px-4 pb-28">
        <div className="rounded-[18px] bg-ink p-5 text-card">
          <p className="text-[13px] opacity-60">К выплате всей команде</p>
          <p className="heading mt-1 text-[36px] tabular-nums">{formatRub(totalDue)}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[color-mix(in_srgb,var(--app-card)_15%,transparent)] pt-4 text-[13px]">
            <Stat value={acceptedThisMonth.length} label={`${plural(acceptedThisMonth.length, ["ролик", "ролика", "роликов"])} принято за месяц`} />
            <Stat value={formatRub(acceptedThisMonth.reduce((s, t) => s + t.price, 0))} label="начислено за месяц" />
            <Stat value={overdue} label="просрочено" danger={overdue > 0} />
          </div>
        </div>

        <GroupTitle>Монтажёры</GroupTitle>
        <Card className="divide-y divide-line">
          {team.map((u) => {
            const b = balanceOf(state, u.id);
            const st = editorStats(state, u.id);
            return (
              <button key={u.id} type="button" onClick={() => nav.push({ name: "member", id: u.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-soft">
                <Avatar user={u} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{u.name}</span>
                  <span className="block text-[12px] text-hint">
                    в работе {st.active} · сдано за месяц {st.acceptedThisMonth}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[15px] font-semibold tabular-nums">{formatRub(b.due)}</span>
                  <span className="block text-[11px] text-hint">к выплате</span>
                </span>
                <ChevronRight className="h-4 w-4 text-hint" strokeWidth={1.75} />
              </button>
            );
          })}
        </Card>

        <GroupTitle>Настройки</GroupTitle>
        <Card className="divide-y divide-line">
          <button type="button" onClick={() => nav.push({ name: "categories" })} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-soft">
            <FolderOpen className="h-5 w-5" strokeWidth={1.75} />
            <span className="flex-1 text-[15px]">Категории</span>
            <span className="text-[13px] text-hint">{state.categories.length}</span>
            <ChevronRight className="h-4 w-4 text-hint" strokeWidth={1.75} />
          </button>
        </Card>

        <GroupTitle>Цены за ролик по умолчанию</GroupTitle>
        <Card className="divide-y divide-line">
          {FORMATS.map((f) => (
            <button key={f} type="button" onClick={() => setPriceFormat(f)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-soft">
              <Wallet className="h-5 w-5" strokeWidth={1.75} />
              <span className="flex-1 text-[15px]">Формат {f}</span>
              <span className="text-[15px] font-medium tabular-nums">{formatRub(state.defaultPrices[f])}</span>
            </button>
          ))}
        </Card>
      </div>
      {priceFormat && <DefaultPriceSheet format={priceFormat} onClose={() => setPriceFormat(null)} />}
    </Screen>
  );
}

function Stat({ value, label, danger }: { value: number | string; label: string; danger?: boolean }) {
  return (
    <div>
      <p className={`font-display text-[18px] font-semibold tabular-nums ${danger ? "text-[#ff6b60]" : ""}`}>{value}</p>
      <p className="mt-0.5 leading-tight opacity-60">{label}</p>
    </div>
  );
}

function DefaultPriceSheet({ format, onClose }: { format: VideoFormat; onClose: () => void }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [v, setV] = useState(String(state.defaultPrices[format]));
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Цена для ${format}`}
      footer={
        <Btn
          size="lg"
          className="w-full"
          onClick={() => {
            actions.setDefaultPrice(format, Number(v));
            toast("Цена по умолчанию сохранена");
            onClose();
          }}
        >
          Сохранить
        </Btn>
      }
    >
      <Field label="Сколько получает монтажёр за ролик, ₽" hint="Подставляется в новые задачи. Уже созданные не меняются.">
        <input autoFocus className="field text-[18px] tabular-nums" inputMode="numeric" value={v} onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))} />
      </Field>
    </Sheet>
  );
}
