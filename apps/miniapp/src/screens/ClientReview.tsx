/**
 * Экран «для клиента»: только ролик и две кнопки. Сейчас открывается внутри приложения (демо),
 * на этапе бэкенда станет отдельной ссылкой без входа.
 */
import { CheckCircle2, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useState } from "react";
import { categoryById, useStore } from "../data/store";
import { useNav } from "../lib/nav";
import { haptic, useBackButton } from "../lib/telegram";
import { VideoBox } from "../components/VideoBox";
import { Btn, Logo } from "../components/ui";

export function ClientReview({ id }: { id: string }) {
  const { state, getTask, actions } = useStore();
  const nav = useNav();
  const task = getTask(id);
  const [mode, setMode] = useState<"view" | "comment" | "done">("view");
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(true);
  const ownBack = useBackButton(nav.pop);

  if (!task) return null;
  const version = task.versions[task.versions.length - 1];

  const send = (isLiked: boolean, text: string) => {
    actions.setClientFeedback(task.id, { liked: isLiked, comment: text.trim(), versionId: version?.id });
    haptic.notify("success");
    setLiked(isLiked);
    setMode("done");
  };

  return (
    <div className="animate-fade fixed inset-0 z-50 flex flex-col bg-[#0d0d0d] text-white [--app-card:#0d0d0d]">
      <header className="flex h-14 items-center justify-between px-4">
        <span className="text-white">
          <Logo />
        </span>
        <span className="text-[12px] text-white/50">Предпросмотр для клиента</span>
        {ownBack ? (
          <button type="button" onClick={nav.pop} aria-label="Закрыть" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        ) : (
          <span className="w-10" />
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pb-[calc(16px+var(--safe-bottom))]">
        <p className="text-[13px] text-white/50">{categoryById(state, task.categoryId)?.name}</p>
        <h1 className="heading mt-1 text-center text-[22px]">{task.title}</h1>
        <VideoBox
          src={version?.url}
          poster={version?.poster}
          format={task.brief.format}
          className="mt-4 w-full max-w-[320px]"
        />

        <div className="mt-5 w-full max-w-[420px]">
          {mode === "view" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => send(true, "")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-[15px] font-medium text-[#0d0d0d] active:opacity-85"
              >
                <ThumbsUp className="h-4 w-4" strokeWidth={2} />
                Нравится
              </button>
              <button
                type="button"
                onClick={() => setMode("comment")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 text-[15px] font-medium active:bg-white/10"
              >
                <ThumbsDown className="h-4 w-4" strokeWidth={2} />
                Есть правки
              </button>
            </div>
          )}

          {mode === "comment" && (
            <div className="animate-fade">
              <textarea
                autoFocus
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Что хотелось бы изменить?"
                className="min-h-[110px] w-full resize-none rounded-[14px] border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/40 focus:border-white/40"
              />
              <div className="mt-2 grid grid-cols-[auto_1fr] gap-2">
                <button type="button" onClick={() => setMode("view")} className="h-12 rounded-full px-5 text-[15px] text-white/70">
                  Назад
                </button>
                <button
                  type="button"
                  disabled={!comment.trim()}
                  onClick={() => send(false, comment)}
                  className="h-12 rounded-full bg-white text-[15px] font-medium text-[#0d0d0d] disabled:opacity-40"
                >
                  Отправить правки
                </button>
              </div>
            </div>
          )}

          {mode === "done" && (
            <div className="animate-fade flex flex-col items-center text-center">
              <CheckCircle2 className="h-10 w-10 text-[#3ccf7d]" strokeWidth={1.5} />
              <p className="mt-3 text-[17px] font-medium">{liked ? "Спасибо! Передали команде" : "Правки отправлены команде"}</p>
              <p className="mt-1 text-[13px] text-white/50">Ответ клиента сохранён в карточке задачи</p>
              <Btn variant="secondary" className="mt-5 !bg-white/10 !text-white" onClick={nav.pop}>
                Вернуться в студию
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
