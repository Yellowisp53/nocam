import {
  ArrowRightLeft,
  Check,
  Clock,
  ExternalLink,
  FileVideo,
  History as HistoryIcon,
  Link2,
  MessageSquarePlus,
  Pencil,
  Send,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { columnById } from "../data/config";
import { canEditPrice, canSeePrice, categoryById, isOverdue, useStore, userById } from "../data/store";
import type { Task } from "../data/types";
import { ago, deadlineLabel, formatDateTime, formatRub, formatTimecode } from "../lib/format";
import { useNav } from "../lib/nav";
import { haptic, openLink, type MainButtonOptions } from "../lib/telegram";
import { useTaskFlow } from "../components/TaskFlow";
import { useToast } from "../components/Toast";
import { VideoBox } from "../components/VideoBox";
import { Avatar, Btn, Card, Empty, Field, IconBtn, Screen, Segmented, Sheet, StatusPill } from "../components/ui";

type TabId = "brief" | "versions" | "revisions" | "chat" | "history";

export function TaskDetail({ id }: { id: string }) {
  const { state, me, getTask } = useStore();
  const nav = useNav();
  const task = getTask(id);
  if (!task) {
    return (
      <Screen title="Задача" onBack={nav.pop}>
        <Empty title="Задача не найдена" text="Возможно, демо-данные были сброшены" />
      </Screen>
    );
  }
  if (me.role !== "admin" && task.assigneeId !== me.id) {
    return (
      <Screen title="Задача" onBack={nav.pop}>
        <Empty title="Нет доступа" text="Эта задача назначена другому монтажёру" />
      </Screen>
    );
  }
  return <TaskDetailInner task={task} key={`${task.id}-${state.currentUserId}`} />;
}

function TaskDetailInner({ task }: { task: Task }) {
  const { state, me, actions } = useStore();
  const nav = useNav();
  const toast = useToast();
  const flow = useTaskFlow();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [tab, setTab] = useState<TabId>(task.column === "revisions" || task.column === "review" ? "revisions" : "brief");
  const latest = task.versions[task.versions.length - 1];
  const [versionId, setVersionId] = useState<string | undefined>(latest?.id);
  const version = task.versions.find((v) => v.id === versionId) ?? latest;
  const [time, setTime] = useState(0);
  const [revisionAt, setRevisionAt] = useState<number | null>(null);
  const [priceOpen, setPriceOpen] = useState(false);

  // если сдали новую версию — переключаемся на неё
  const [seenLatest, setSeenLatest] = useState(latest?.id);
  if (latest?.id !== seenLatest) {
    setSeenLatest(latest?.id);
    setVersionId(latest?.id);
  }

  const assignee = userById(state, task.assigneeId);
  const category = categoryById(state, task.categoryId);
  const source = task.sources.find((s) => s.kind === "file");
  const isAdmin = me.role === "admin";
  const isMine = task.assigneeId === me.id;
  const overdue = isOverdue(task);
  const finished = task.column === "ready" || task.column === "published";

  const seek = (sec: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = sec;
    v.pause();
    haptic.select();
  };

  const startRevision = () => {
    videoRef.current?.pause();
    setRevisionAt(videoRef.current?.currentTime ?? time);
  };

  // главная кнопка — по роли и столбцу
  const main: MainButtonOptions | null = (() => {
    // пока открыта шторка — нативная кнопка Telegram не должна перекрывать её
    if (flow.isOpen || revisionAt !== null || priceOpen) return null;
    if (!isAdmin && isMine) {
      if (task.column === "todo") return { text: "Взять в работу", onClick: () => flow.requestMove(task, "doing") };
      if (task.column === "doing") return { text: "Сдать ролик", onClick: () => flow.open("submit", task.id) };
      if (task.column === "revisions") return { text: "Сдать исправленный", onClick: () => flow.open("submit", task.id) };
    }
    if (isAdmin) {
      if (task.column === "review") return { text: "Принять ролик", onClick: () => flow.requestMove(task, "ready") };
      if (task.column === "ready") return { text: "Отметить «Опубликовано»", onClick: () => flow.requestMove(task, "published") };
    }
    return null;
  })();

  const tabs = useMemo(() => {
    const open = task.revisions.filter((r) => !r.resolved).length;
    return [
      { id: "brief" as const, label: "ТЗ" },
      { id: "versions" as const, label: `Версии${task.versions.length ? ` ${task.versions.length}` : ""}` },
      { id: "revisions" as const, label: `Правки${open ? ` ${open}` : ""}` },
      { id: "chat" as const, label: `Чат${task.comments.length ? ` ${task.comments.length}` : ""}` },
      { id: "history" as const, label: "История" },
    ];
  }, [task]);

  return (
    <Screen
      title={task.title}
      subtitle={category?.name}
      onBack={nav.pop}
      main={main}
      right={
        <IconBtn aria-label="Переместить в…" onClick={() => flow.open("move", task.id)}>
          <ArrowRightLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </IconBtn>
      }
    >
      <div className="px-4 pb-6">
        {/* шапка */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <StatusPill column={task.column} />
          {!finished && (
            <span
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium ${
                overdue ? "bg-[color-mix(in_srgb,var(--app-danger)_12%,transparent)] text-danger" : "bg-soft"
              }`}
            >
              <Clock className="h-3.5 w-3.5" strokeWidth={2} />
              {deadlineLabel(task.deadline)}
            </span>
          )}
        </div>

        <Card className="mt-3 divide-y divide-line">
          <InfoRow label="Монтажёр">
            <span className="flex items-center gap-2">
              <Avatar user={assignee} size={22} />
              {assignee?.name}
            </span>
          </InfoRow>
          <InfoRow label="Дедлайн">{formatDateTime(task.deadline)}</InfoRow>
          {canSeePrice(me, task) && (
            <InfoRow label="Оплата за ролик">
              <button
                type="button"
                disabled={!canEditPrice(me, task)}
                onClick={() => setPriceOpen(true)}
                className="inline-flex items-center gap-1.5 font-semibold tabular-nums disabled:cursor-default"
              >
                {formatRub(task.price)}
                {canEditPrice(me, task) && <Pencil className="h-3.5 w-3.5 text-hint" strokeWidth={1.75} />}
                {task.acceptedAt && <span className="text-[12px] font-medium text-success">начислено</span>}
              </button>
            </InfoRow>
          )}
        </Card>

        {/* плеер */}
        <div className="mt-4">
          {task.versions.length > 1 && (
            <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
              {[...task.versions].reverse().map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVersionId(v.id)}
                  className={`h-8 shrink-0 rounded-full px-3 text-[13px] font-medium tabular-nums ${
                    v.id === version?.id ? "bg-ink text-card" : "bg-card"
                  }`}
                >
                  v{v.n}
                  {v.id === latest?.id ? " · последняя" : ""}
                </button>
              ))}
            </div>
          )}
          <VideoBox
            ref={videoRef}
            src={version?.url ?? source?.url}
            poster={version?.poster ?? source?.poster}
            format={task.brief.format}
            className="w-full max-w-[340px]"
            onTimeUpdate={setTime}
          />
          <p className="mt-2 text-center text-[12px] text-hint">
            {version ? `Версия v${version.n} · ${ago(version.at)}` : source ? `Исходник · ${source.name}` : "Нет видео"}
          </p>
          {isAdmin && version && !finished && (
            <Btn variant="secondary" className="mt-3 w-full" onClick={startRevision}>
              <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} />
              Правка на {formatTimecode(time)}
            </Btn>
          )}
        </div>

        {/* действия админа */}
        {isAdmin && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {task.column === "review" ? (
              <Btn variant="danger" onClick={() => flow.requestMove(task, "revisions")}>
                Вернуть на правки
              </Btn>
            ) : (
              <Btn variant="secondary" onClick={() => flow.open("move", task.id)}>
                <ArrowRightLeft className="h-4 w-4" strokeWidth={1.75} />
                Переместить
              </Btn>
            )}
            <Btn variant="secondary" disabled={!version} onClick={() => nav.push({ name: "client", id: task.id })}>
              <UserRound className="h-4 w-4" strokeWidth={1.75} />
              Показать клиенту
            </Btn>
          </div>
        )}
        {!isAdmin && !main && (
          <Btn variant="secondary" className="mt-3 w-full" onClick={() => flow.open("move", task.id)}>
            <ArrowRightLeft className="h-4 w-4" strokeWidth={1.75} />
            Переместить в…
          </Btn>
        )}

        <Segmented className="mt-5" value={tab} onChange={setTab} options={tabs} />

        <div className="mt-3">
          {tab === "brief" && <BriefTab task={task} />}
          {tab === "versions" && (
            <VersionsTab
              task={task}
              current={version?.id}
              onPick={(id) => {
                setVersionId(id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
          {tab === "revisions" && <RevisionsTab task={task} versionId={version?.id} onSeek={seek} />}
          {tab === "chat" && <ChatTab task={task} />}
          {tab === "history" && <HistoryTab task={task} />}
        </div>
      </div>

      {/* правка по таймкоду */}
      {revisionAt !== null && version && (
        <RevisionSheet
          atSec={revisionAt}
          onClose={() => setRevisionAt(null)}
          onSave={(text) => {
            const res = actions.addRevision(task.id, version.id, revisionAt, text);
            if (!res.ok) return toast(res.error, "error");
            setRevisionAt(null);
            setTab("revisions");
            toast(`Правка на ${formatTimecode(revisionAt)} добавлена`);
          }}
        />
      )}

      {priceOpen && (
        <PriceSheet
          value={task.price}
          onClose={() => setPriceOpen(false)}
          onSave={(p) => {
            const res = actions.setPrice(task.id, p);
            if (!res.ok) return toast(res.error, "error");
            setPriceOpen(false);
            toast("Цена обновлена");
          }}
        />
      )}

      {flow.sheets}
    </Screen>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[46px] items-center justify-between gap-3 px-4 py-2 text-[15px]">
      <span className="text-hint">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

// ───────────── ТЗ

function BriefTab({ task }: { task: Task }) {
  const b = task.brief;
  return (
    <div className="space-y-3">
      {task.clientFeedback && (
        <Card className="p-4">
          <p className="flex items-center gap-2 text-[14px] font-medium">
            {task.clientFeedback.liked ? (
              <ThumbsUp className="h-4 w-4 text-success" strokeWidth={2} />
            ) : (
              <ThumbsDown className="h-4 w-4 text-danger" strokeWidth={2} />
            )}
            Клиент: {task.clientFeedback.liked ? "нравится" : "есть правки"}
            <span className="ml-auto text-[12px] font-normal text-hint">{ago(task.clientFeedback.at)}</span>
          </p>
          {task.clientFeedback.comment && <p className="mt-2 text-[14px]">«{task.clientFeedback.comment}»</p>}
        </Card>
      )}

      <Card className="divide-y divide-line">
        <InfoRow label="Формат">{b.format}</InfoRow>
        <InfoRow label="Длительность">{b.duration || "—"}</InfoRow>
      </Card>

      <TextBlock title="Сценарий" text={b.script} />
      <TextBlock title="Просьбы по монтажу" text={b.notes} />

      {b.references.length > 0 && (
        <Card className="p-4">
          <h4 className="text-[13px] font-medium text-hint">Референсы</h4>
          <ul className="mt-2 space-y-1">
            {b.references.map((r) => (
              <li key={r}>
                <button type="button" onClick={() => openLink(r)} className="flex w-full items-center gap-2 py-1 text-left text-[14px]">
                  <Link2 className="h-4 w-4 shrink-0 text-hint" strokeWidth={1.75} />
                  <span className="truncate underline decoration-line underline-offset-4">{r.replace(/^https?:\/\//, "")}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4">
        <h4 className="text-[13px] font-medium text-hint">Исходники</h4>
        {task.sources.length === 0 ? (
          <p className="mt-2 text-[14px] text-hint">Не прикреплены</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {task.sources.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => openLink(s.url.startsWith("/") ? new URL(s.url, location.href).href : s.url)}
                  className="flex w-full items-center gap-2 py-1 text-left text-[14px]"
                >
                  {s.kind === "file" ? (
                    <FileVideo className="h-4 w-4 shrink-0 text-hint" strokeWidth={1.75} />
                  ) : (
                    <Link2 className="h-4 w-4 shrink-0 text-hint" strokeWidth={1.75} />
                  )}
                  <span className="flex-1 truncate">{s.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-hint" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <Card className="p-4">
      <h4 className="text-[13px] font-medium text-hint">{title}</h4>
      <p className="mt-1.5 whitespace-pre-line text-[15px] leading-relaxed">{text}</p>
    </Card>
  );
}

// ───────────── Версии

function VersionsTab({ task, current, onPick }: { task: Task; current?: string; onPick: (id: string) => void }) {
  const { state } = useStore();
  if (!task.versions.length) return <Empty title="Версий пока нет" text="Монтажёр сдаст ролик — он появится здесь" />;
  return (
    <Card className="divide-y divide-line">
      {[...task.versions].reverse().map((v) => {
        const by = userById(state, v.byId);
        const revs = task.revisions.filter((r) => r.versionId === v.id);
        return (
          <button key={v.id} type="button" onClick={() => onPick(v.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-soft">
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] font-display text-[15px] font-semibold ${
                v.id === current ? "bg-ink text-card" : "bg-soft"
              }`}
            >
              v{v.n}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium">{v.note || v.name || `Версия ${v.n}`}</span>
              <span className="block text-[12px] text-hint">
                {by?.name} · {ago(v.at)}
                {revs.length ? ` · правок: ${revs.length}` : ""}
              </span>
            </span>
          </button>
        );
      })}
    </Card>
  );
}

// ───────────── Правки по таймкоду

function RevisionsTab({ task, versionId, onSeek }: { task: Task; versionId?: string; onSeek: (sec: number) => void }) {
  const { state, me, actions } = useStore();
  const toast = useToast();
  const list = task.revisions.filter((r) => r.versionId === versionId).sort((a, b) => a.atSec - b.atSec);
  const older = task.revisions.filter((r) => r.versionId !== versionId);
  const canResolve = me.role === "admin" || task.assigneeId === me.id;

  if (!versionId) return <Empty title="Правок нет" text="Правки ставятся к сданной версии ролика" />;

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <Card>
          <Empty
            title="К этой версии правок нет"
            text={me.role === "admin" ? "Поставьте видео на паузу и нажмите «Правка на …»" : "Админ ещё не оставил правок"}
          />
        </Card>
      ) : (
        <Card className="divide-y divide-line">
          {list.map((r) => (
            <div key={r.id} className="flex items-start gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => onSeek(r.atSec)}
                className="mt-0.5 inline-flex h-7 shrink-0 items-center rounded-[8px] bg-ink px-2 font-display text-[13px] font-semibold tabular-nums text-card"
                aria-label={`Перемотать на ${formatTimecode(r.atSec)}`}
              >
                {formatTimecode(r.atSec)}
              </button>
              <button type="button" onClick={() => onSeek(r.atSec)} className="min-w-0 flex-1 text-left">
                <span className={`block text-[15px] leading-snug ${r.resolved ? "text-hint line-through" : ""}`}>{r.text}</span>
                <span className="mt-0.5 block text-[12px] text-hint">
                  {userById(state, r.byId)?.name} · {ago(r.at)}
                </span>
              </button>
              <button
                type="button"
                disabled={!canResolve}
                onClick={() => {
                  const res = actions.toggleRevision(task.id, r.id);
                  if (!res.ok) toast(res.error, "error");
                  else haptic.select();
                }}
                aria-label={r.resolved ? "Снять отметку" : "Отметить исправленным"}
                className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  r.resolved ? "border-success bg-success text-white" : "border-line"
                }`}
              >
                {r.resolved && <Check className="h-4 w-4" strokeWidth={2.5} />}
              </button>
            </div>
          ))}
        </Card>
      )}
      {older.length > 0 && (
        <p className="px-1 text-[12px] text-hint">
          В предыдущих версиях правок: {older.length} (исправлено {older.filter((r) => r.resolved).length})
        </p>
      )}
    </div>
  );
}

// ───────────── Чат

function ChatTab({ task }: { task: Task }) {
  const { state, me, actions } = useStore();
  const [text, setText] = useState("");
  const send = () => {
    if (actions.comment(task.id, text).ok) {
      setText("");
      haptic.impact("light");
    }
  };
  return (
    <div>
      {task.comments.length === 0 && <Empty title="Сообщений нет" text="Обсудите здесь детали задачи" />}
      <div className="flex flex-col gap-2">
        {task.comments.map((c) => {
          const mine = c.byId === me.id;
          const by = userById(state, c.byId);
          return (
            <div key={c.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {!mine && <Avatar user={by} size={24} />}
              <div
                className={`max-w-[78%] rounded-[18px] px-3.5 py-2 text-[15px] leading-snug ${
                  mine ? "rounded-br-[6px] bg-ink text-card" : "rounded-bl-[6px] bg-card"
                }`}
              >
                {!mine && <span className="mb-0.5 block text-[12px] font-medium text-hint">{by?.name}</span>}
                <span className="whitespace-pre-line">{c.text}</span>
                <span className={`mt-0.5 block text-right text-[11px] ${mine ? "opacity-60" : "text-hint"}`}>{ago(c.at)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Сообщение"
          className="field max-h-32 min-h-[44px] flex-1 resize-none rounded-[22px] py-2.5"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim()}
          aria-label="Отправить"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-card disabled:opacity-30"
        >
          <Send className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

// ───────────── История

function HistoryTab({ task }: { task: Task }) {
  const { state } = useStore();
  return (
    <Card className="px-4 py-2">
      <ol>
        {[...task.history].reverse().map((h) => (
          <li key={h.id} className="flex gap-3 border-b border-line py-3 last:border-b-0">
            <HistoryIcon className="mt-0.5 h-4 w-4 shrink-0 text-hint" strokeWidth={1.75} />
            <div className="min-w-0 flex-1 text-[14px] leading-snug">
              <span className="font-medium">{userById(state, h.byId)?.name}</span> {h.text}
              {h.from && h.to && (
                <>
                  {" "}
                  <span className="text-hint">«{columnById(h.from).title}»</span> → <span>«{columnById(h.to).title}»</span>
                </>
              )}
              <span className="mt-0.5 block text-[12px] text-hint">{formatDateTime(h.at)}</span>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ───────────── Шторки

function RevisionSheet({ atSec, onClose, onSave }: { atSec: number; onClose: () => void; onSave: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Правка на ${formatTimecode(atSec)}`}
      footer={
        <Btn size="lg" className="w-full" disabled={!text.trim()} onClick={() => onSave(text)}>
          Добавить правку
        </Btn>
      }
    >
      <Field label="Что исправить в этом месте">
        <textarea
          autoFocus
          className="field min-h-[110px] resize-none py-3"
          placeholder="Например: убрать паузу, субтитр крупнее"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>
    </Sheet>
  );
}

function PriceSheet({ value, onClose, onSave }: { value: number; onClose: () => void; onSave: (p: number) => void }) {
  const [v, setV] = useState(String(value));
  return (
    <Sheet
      open
      onClose={onClose}
      title="Оплата за ролик"
      footer={
        <Btn size="lg" className="w-full" onClick={() => onSave(Number(v.replace(/\s/g, "")))}>
          Сохранить
        </Btn>
      }
    >
      <Field label="Сколько получит монтажёр, ₽" hint="Можно менять, пока ролик не принят">
        <input className="field text-[18px] tabular-nums" inputMode="numeric" value={v} onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))} />
      </Field>
    </Sheet>
  );
}
