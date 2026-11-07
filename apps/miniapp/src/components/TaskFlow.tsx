/**
 * Перемещение карточек и связанные шторки: «Переместить в…», «На проверку» (с загрузкой видео), «Вернуть на правки».
 * Используется и доской (перетаскивание), и карточкой задачи — правила одни (canMove в store).
 */
import { Lock, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { COLUMNS, columnById } from "../data/config";
import { canMove, needsComment, needsVersion, useStore, userById } from "../data/store";
import type { ColumnId, Task } from "../data/types";
import { formatRub } from "../lib/format";
import { fileToVideo } from "../lib/media";
import { haptic } from "../lib/telegram";
import { useToast } from "./Toast";
import { Btn, Field, Sheet } from "./ui";

type SheetState = { kind: "move" | "submit" | "return"; taskId: string } | null;

export function useTaskFlow() {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const [sheet, setSheet] = useState<SheetState>(null);

  const notifyMoved = useCallback(
    (task: Task, to: ColumnId) => {
      const who = userById(state, task.assigneeId)?.name ?? "Монтажёр";
      const messages: Partial<Record<ColumnId, string>> = {
        doing:
          me.role === "admin"
            ? "Перемещено в «В работе»"
            : task.column === "review"
              ? "Забрали с проверки — доработайте и отправьте снова"
              : "Задача в работе — удачи с монтажом",
        todo: me.role === "admin" ? "Перемещено в «Задачи»" : "Вернули в задачи",
        ready: "Ролик принят · после публикации оплата встанет к выплате",
        published: `Опубликовано · ${who}у к выплате ${formatRub(task.price)}`,
      };
      toast(messages[to] ?? `Перемещено в «${columnById(to).title}»`);
    },
    [state, me.role, toast],
  );

  const requestMove = useCallback(
    (task: Task, to: ColumnId) => {
      const allowed = canMove(me, task, to);
      if (!allowed.ok) {
        toast(allowed.error, "error");
        return false;
      }
      if (needsVersion(me, to)) {
        setSheet({ kind: "submit", taskId: task.id });
        return false;
      }
      if (needsComment(to)) {
        setSheet({ kind: "return", taskId: task.id });
        return false;
      }
      const res = actions.moveTask(task.id, to);
      if (!res.ok) {
        toast(res.error, "error");
        return false;
      }
      haptic.impact("medium");
      notifyMoved(task, to);
      return true;
    },
    [me, actions, toast, notifyMoved],
  );

  const open = useCallback((kind: "move" | "submit" | "return", taskId: string) => setSheet({ kind, taskId }), []);
  const close = useCallback(() => setSheet(null), []);

  const task = sheet ? state.tasks.find((t) => t.id === sheet.taskId) : undefined;

  const sheets = (
    <>
      {task && sheet?.kind === "move" && (
        <MoveSheet
          task={task}
          onClose={close}
          onPick={(to) => {
            close();
            // откроем нужную шторку после закрытия текущей
            window.setTimeout(() => requestMove(task, to), 0);
          }}
        />
      )}
      {task && sheet?.kind === "submit" && <SubmitSheet task={task} onClose={close} />}
      {task && sheet?.kind === "return" && <ReturnSheet task={task} onClose={close} />}
    </>
  );

  return { requestMove, open, sheets, isOpen: Boolean(sheet) };
}

function MoveSheet({ task, onClose, onPick }: { task: Task; onClose: () => void; onPick: (to: ColumnId) => void }) {
  const { me } = useStore();
  return (
    <Sheet open onClose={onClose} title="Переместить в…">
      <div className="overflow-hidden rounded-[16px] bg-card">
        {COLUMNS.map((c) => {
          const current = c.id === task.column;
          const allowed = canMove(me, task, c.id);
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              disabled={!allowed.ok}
              onClick={() => onPick(c.id)}
              className="flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left last:border-b-0 enabled:active:bg-soft disabled:opacity-45"
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span className="flex-1">
                <span className="block text-[15px] font-medium">{c.title}</span>
                <span className="block text-[12px] text-hint">
                  {current ? "Сейчас здесь" : allowed.ok ? c.hint : allowed.error}
                </span>
              </span>
              {!allowed.ok && !current && <Lock className="h-4 w-4 text-hint" strokeWidth={1.75} />}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function SubmitSheet({ task, onClose }: { task: Task; onClose: () => void }) {
  const { actions } = useStore();
  const toast = useToast();
  const [file, setFile] = useState<{ url: string; poster?: string; name: string } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const n = task.versions.length + 1;
  const unresolved = task.revisions.filter((r) => !r.resolved).length;

  const submit = () => {
    if (!file) return;
    const res = actions.addVersion(task.id, { url: file.url, poster: file.poster, name: file.name, note });
    if (!res.ok) return toast(res.error, "error");
    haptic.impact("medium");
    onClose();
    toast(`Версия v${n} на проверке · админ получит уведомление`);
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={`На проверку · v${n}`}
      footer={
        <Btn size="lg" className="w-full" disabled={!file || busy} onClick={submit}>
          Отправить на проверку
        </Btn>
      }
    >
      <p className="mb-3 text-[14px] text-hint">Загрузите готовый ролик — админ посмотрит его прямо в карточке.</p>
      {unresolved > 0 && (
        <p className="mb-3 rounded-[12px] bg-[color-mix(in_srgb,var(--app-danger)_10%,transparent)] px-3 py-2.5 text-[13px] text-danger">
          Не отмечено исправленными: {unresolved}. Проверьте список правок перед отправкой.
        </p>
      )}

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-line bg-card px-4 py-6 text-center">
        {file ? (
          <>
            {file.poster ? (
              <img src={file.poster} alt="" className="h-28 rounded-[10px] object-cover" />
            ) : (
              <video src={file.url} className="h-28 rounded-[10px]" muted />
            )}
            <span className="max-w-full truncate text-[14px] font-medium">{file.name}</span>
            <span className="text-[12px] text-hint">Нажмите, чтобы выбрать другой</span>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-hint" strokeWidth={1.5} />
            <span className="text-[14px] font-medium">{busy ? "Готовим превью…" : "Загрузить видео"}</span>
            <span className="text-[12px] text-hint">MP4 / MOV · в демо файл живёт до перезагрузки</span>
          </>
        )}
        <input
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            setFile(await fileToVideo(f));
            setBusy(false);
          }}
        />
      </label>

      <div className="mt-4">
        <Field label="Комментарий (необязательно)">
          <textarea
            className="field min-h-[80px] resize-none py-3"
            placeholder="Что изменилось в этой версии"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Sheet>
  );
}

function ReturnSheet({ task, onClose }: { task: Task; onClose: () => void }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const last = task.versions[task.versions.length - 1];
  const timecodes = task.revisions.filter((r) => r.versionId === last?.id && !r.resolved).length;
  const [note, setNote] = useState(timecodes ? `Правки по таймкодам: ${timecodes}. Посмотри список в карточке.` : "");
  const who = userById(state, task.assigneeId)?.name ?? "Монтажёр";

  const submit = () => {
    const res = actions.moveTask(task.id, "revisions", note);
    if (!res.ok) return toast(res.error, "error");
    haptic.impact("medium");
    onClose();
    toast(`Вернули на правки · ${who} получит уведомление`, "info");
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Вернуть на правки"
      footer={
        <Btn size="lg" className="w-full" disabled={!note.trim()} onClick={submit}>
          Вернуть {who}у
        </Btn>
      }
    >
      <p className="mb-3 text-[14px] text-hint">
        Опишите, что исправить. Точечные правки удобнее ставить по таймкоду во вкладке «Правки».
      </p>
      <Field label="Что исправить">
        <textarea
          autoFocus
          className="field min-h-[120px] resize-none py-3"
          placeholder="Например: ускорить начало, заменить музыку"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
    </Sheet>
  );
}
