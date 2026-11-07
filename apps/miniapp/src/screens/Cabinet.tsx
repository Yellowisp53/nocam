import { Banknote, Film } from "lucide-react";
import { useState } from "react";
import { balanceOf, editorStats, useStore, userById } from "../data/store";
import { formatDate, formatRub } from "../lib/format";
import { useNav } from "../lib/nav";
import { useToast } from "../components/Toast";
import { Avatar, Btn, Card, Empty, Field, GroupTitle, Screen, Sheet } from "../components/ui";

/** Кабинет монтажёра (вкладка «Кабинет») */
export function Cabinet() {
  const { me } = useStore();
  return (
    <Screen title="Кабинет">
      <MemberContent userId={me.id} />
    </Screen>
  );
}

/** Карточка монтажёра для админа (из вкладки «Команда») */
export function Member({ id }: { id: string }) {
  const { state } = useStore();
  const nav = useNav();
  const user = userById(state, id);
  const [payout, setPayout] = useState(false);
  const due = balanceOf(state, id).due;
  return (
    <Screen
      title={user?.name}
      subtitle="Монтажёр"
      onBack={nav.pop}
      main={payout ? null : { text: "Отметить выплату", onClick: () => setPayout(true) }}
    >
      <MemberContent userId={id} />
      {payout && <PayoutSheet userId={id} suggested={Math.max(0, due)} onClose={() => setPayout(false)} />}
    </Screen>
  );
}

function MemberContent({ userId }: { userId: string }) {
  const { state } = useStore();
  const nav = useNav();
  const user = userById(state, userId);
  const b = balanceOf(state, userId);
  const st = editorStats(state, userId);

  return (
    <div className="px-4 pb-28">
      <div className="rounded-[18px] bg-ink p-5 text-card">
        <div className="flex items-center gap-2.5">
          <Avatar user={user} size={30} />
          <span className="text-[14px] opacity-70">{user?.name}</span>
        </div>
        <p className="mt-4 text-[13px] opacity-60">К выплате</p>
        <p className="heading mt-0.5 text-[40px] tabular-nums">{formatRub(b.due)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[color-mix(in_srgb,var(--app-card)_15%,transparent)] pt-4 text-[13px]">
          <div>
            <p className="opacity-60">Начислено</p>
            <p className="mt-0.5 text-[16px] font-semibold tabular-nums">{formatRub(b.accrued)}</p>
          </div>
          <div>
            <p className="opacity-60">Выплачено</p>
            <p className="mt-0.5 text-[16px] font-semibold tabular-nums">{formatRub(b.paid)}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat value={String(st.acceptedThisMonth)} label="роликов за месяц" />
        <MiniStat value={st.avgDays ? `${st.avgDays.toFixed(1).replace(".", ",")} дн` : "—"} label="в среднем на ролик" />
        <MiniStat value={st.revisionRounds.toFixed(1).replace(".", ",")} label="кругов правок на ролик" />
      </div>

      <GroupTitle>Принятые ролики · {b.accepted.length}</GroupTitle>
      {b.accepted.length === 0 ? (
        <Card>
          <Empty icon={<Film className="h-7 w-7" strokeWidth={1.5} />} title="Пока нет принятых роликов" text="Оплата начисляется, когда ролик принят" />
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          {b.accepted.map((t) => (
            <button key={t.id} type="button" onClick={() => nav.push({ name: "task", id: t.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-soft">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px]">{t.title}</span>
                <span className="block text-[12px] text-hint">принят {formatDate(t.acceptedAt!)}</span>
              </span>
              <span className="text-[15px] font-medium tabular-nums">+{formatRub(t.price)}</span>
            </button>
          ))}
        </Card>
      )}

      <GroupTitle>История выплат</GroupTitle>
      {b.payouts.length === 0 ? (
        <Card>
          <Empty icon={<Banknote className="h-7 w-7" strokeWidth={1.5} />} title="Выплат пока не было" />
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          {b.payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px]">{p.note || "Выплата"}</span>
                <span className="block text-[12px] text-hint">{formatDate(p.at)}</span>
              </span>
              <span className="text-[15px] font-medium tabular-nums">−{formatRub(p.amount)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[14px] bg-card p-3">
      <p className="font-display text-[18px] font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-hint">{label}</p>
    </div>
  );
}

function PayoutSheet({ userId, suggested, onClose }: { userId: string; suggested: number; onClose: () => void }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [amount, setAmount] = useState(suggested ? String(suggested) : "");
  const [note, setNote] = useState("Перевод на карту");
  const user = userById(state, userId);

  const save = () => {
    const res = actions.addPayout(userId, Number(amount), note);
    if (!res.ok) return toast(res.error, "error");
    toast(`${user?.name}: выплата ${formatRub(Number(amount))} отмечена`);
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Отметить выплату"
      footer={
        <Btn size="lg" className="w-full" disabled={!Number(amount)} onClick={save}>
          Отметить {amount ? formatRub(Number(amount)) : ""}
        </Btn>
      }
    >
      <p className="mb-3 text-[14px] text-hint">
        Деньги переводятся вне приложения — здесь только учёт. К выплате сейчас: {formatRub(suggested)}.
      </p>
      <div className="space-y-3">
        <Field label="Сумма, ₽">
          <input autoFocus className="field text-[18px] tabular-nums" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
        </Field>
        <Field label="Комментарий">
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Sheet>
  );
}
