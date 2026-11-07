import { Check, Globe, RotateCcw, Send } from "lucide-react";
import { useStore } from "../data/store";
import { useNav } from "../lib/nav";
import { confirmDialog, isTelegram, tg, tgUser } from "../lib/telegram";
import { useToast } from "../components/Toast";
import { Avatar, Card, GroupTitle, Logo, Screen } from "../components/ui";

export function Profile() {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const toast = useToast();

  const reset = async () => {
    if (!(await confirmDialog("Сбросить все демо-данные? Ваши изменения пропадут."))) return;
    actions.reset();
    nav.setTab("board");
    toast("Демо-данные сброшены");
  };

  return (
    <Screen title="Профиль">
      <div className="px-4 pb-28">
        <Card className="flex items-center gap-3 p-4">
          {tgUser?.photo_url ? (
            <img src={tgUser.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <Avatar user={me} size={48} />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold">
              {tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") : me.name}
            </p>
            <p className="truncate text-[13px] text-hint">
              {tgUser ? `${tgUser.username ? `@${tgUser.username} · ` : ""}id ${tgUser.id}` : "Открыто в браузере"}
            </p>
          </div>
          {isTelegram ? <Send className="h-5 w-5 text-hint" strokeWidth={1.75} /> : <Globe className="h-5 w-5 text-hint" strokeWidth={1.75} />}
        </Card>

        <GroupTitle>Демо: войти как</GroupTitle>
        <Card className="divide-y divide-line">
          {state.users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                actions.switchUser(u.id);
                toast(`Вы вошли как ${u.name}`, "info");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-soft"
            >
              <Avatar user={u} size={34} />
              <span className="flex-1">
                <span className="block text-[15px] font-medium">{u.name}</span>
                <span className="block text-[12px] text-hint">{u.role === "admin" ? "Администратор" : "Монтажёр"}</span>
              </span>
              {u.id === me.id && <Check className="h-5 w-5" strokeWidth={2} />}
            </button>
          ))}
        </Card>

        <GroupTitle>Данные</GroupTitle>
        <Card>
          <button type="button" onClick={reset} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-danger active:bg-soft">
            <RotateCcw className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[15px]">Сбросить демо-данные</span>
          </button>
        </Card>

        <div className="mt-10 flex flex-col items-center gap-1 text-hint">
          <Logo className="text-ink" />
          <p className="mt-2 text-[12px]">Студия · демо-версия без сервера</p>
          {isTelegram && <p className="text-[11px]">Telegram {tg?.version} · {tg?.platform}</p>}
        </div>
      </div>
    </Screen>
  );
}
