import { Film } from "lucide-react";
import { dueOf, editorStats, useStore, userById } from "../data/store";
import { formatDate, formatRub, plural } from "../lib/format";
import { useNav } from "../lib/nav";
import { confirmDialog } from "../lib/telegram";
import { useToast } from "../components/Toast";
import { Avatar, Card, Empty, GroupTitle, Screen } from "../components/ui";

const publishedForms: [string, string, string] = ["опубликованный ролик", "опубликованных ролика", "опубликованных роликов"];

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
  const { state, actions } = useStore();
  const nav = useNav();
  const toast = useToast();
  const user = userById(state, id);
  const { tasks } = dueOf(state, id);

  const clear = async () => {
    const n = tasks.length;
    const ok = await confirmDialog(`Убрать ${n} ${plural(n, publishedForms)} (${user?.name ?? ""})? Сумма «к выплате» обнулится.`);
    if (!ok) return;
    const res = actions.clearPublished(id);
    if (!res.ok) return toast(res.error, "error");
    toast(`${user?.name}: опубликованные ролики убраны`);
  };

  return (
    <Screen
      title={user?.name}
      subtitle="Монтажёр"
      onBack={nav.pop}
      main={tasks.length ? { text: "Выплачено — очистить ролики", onClick: clear } : null}
    >
      <MemberContent userId={id} />
    </Screen>
  );
}

function MemberContent({ userId }: { userId: string }) {
  const { state } = useStore();
  const nav = useNav();
  const user = userById(state, userId);
  const { due, tasks } = dueOf(state, userId);
  const st = editorStats(state, userId);

  return (
    <div className="px-4 pb-28">
      <div className="rounded-[18px] bg-ink p-5 text-card">
        <div className="flex items-center gap-2.5">
          <Avatar user={user} size={30} />
          <span className="text-[14px] opacity-70">{user?.name}</span>
        </div>
        <p className="mt-4 text-[13px] opacity-60">К выплате</p>
        <p className="heading mt-0.5 text-[40px] tabular-nums">{formatRub(due)}</p>
        <p className="mt-2 text-[13px] opacity-60">
          {tasks.length ? `За ${tasks.length} ${plural(tasks.length, publishedForms)}` : "Оплата встаёт сюда, когда ролик опубликован"}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat value={String(st.active)} label="в работе сейчас" />
        <MiniStat value={st.avgDays ? `${st.avgDays.toFixed(1).replace(".", ",")} дн` : "—"} label="в среднем на ролик" />
        <MiniStat value={st.revisionRounds.toFixed(1).replace(".", ",")} label="кругов правок на ролик" />
      </div>

      <GroupTitle>К выплате · {tasks.length}</GroupTitle>
      {tasks.length === 0 ? (
        <Card>
          <Empty icon={<Film className="h-7 w-7" strokeWidth={1.5} />} title="Пока пусто" text="Ролик появится здесь, когда админ отметит его опубликованным" />
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          {tasks.map((t) => (
            <button key={t.id} type="button" onClick={() => nav.push({ name: "task", id: t.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-soft">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px]">{t.title}</span>
                <span className="block text-[12px] text-hint">опубликован {formatDate(t.publishedAt!)}</span>
              </span>
              <span className="text-[15px] font-medium tabular-nums">{formatRub(t.price)}</span>
            </button>
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
