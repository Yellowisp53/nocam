import { ChevronRight, Inbox } from "lucide-react";
import { categoryById, isOverdue, useStore, userById } from "../data/store";
import type { Task } from "../data/types";
import { ago, deadlineLabel, deadlineState, HOUR } from "../lib/format";
import { useNav } from "../lib/nav";
import { TaskCover } from "../components/TaskCard";
import { Avatar, Card, Empty, GroupTitle, Screen } from "../components/ui";

/** Вкладка админа «Задачи» — то, что требует внимания */
export function Attention() {
  const { state } = useStore();
  const tasks = state.tasks;
  const review = tasks.filter((t) => t.column === "review").sort((a, b) => a.deadline - b.deadline);
  const overdue = tasks.filter((t) => isOverdue(t) && t.column !== "review").sort((a, b) => a.deadline - b.deadline);
  const soon = tasks.filter(
    (t) => !isOverdue(t) && deadlineState(t.deadline) === "soon" && ["todo", "doing", "revisions"].includes(t.column),
  );
  const feedback = tasks
    .filter((t) => t.clientFeedback && Date.now() - t.clientFeedback.at < 72 * HOUR)
    .sort((a, b) => b.clientFeedback!.at - a.clientFeedback!.at);
  const nothing = !review.length && !overdue.length && !soon.length && !feedback.length;

  return (
    <Screen title="Требуют внимания">
      <div className="px-4 pb-28">
        {nothing && (
          <Card className="mt-2">
            <Empty icon={<Inbox className="h-7 w-7" strokeWidth={1.5} />} title="Всё спокойно" text="Нет роликов на проверке и просроченных задач" />
          </Card>
        )}
        <Group title="На проверке" tasks={review} meta={(t) => `v${t.versions.length} · сдано ${ago(t.versions[t.versions.length - 1]?.at ?? t.createdAt)}`} />
        <Group title="Просрочено" tasks={overdue} danger meta={(t) => deadlineLabel(t.deadline)} />
        <Group title="Горит — меньше суток" tasks={soon} meta={(t) => deadlineLabel(t.deadline)} />
        <Group
          title="Ответы клиентов"
          tasks={feedback}
          meta={(t) => `${t.clientFeedback!.liked ? "Нравится" : "Есть правки"}${t.clientFeedback!.comment ? ` · «${t.clientFeedback!.comment}»` : ""}`}
        />
      </div>
    </Screen>
  );
}

function Group({ title, tasks, meta, danger }: { title: string; tasks: Task[]; meta: (t: Task) => string; danger?: boolean }) {
  const { state } = useStore();
  const nav = useNav();
  if (!tasks.length) return null;
  return (
    <>
      <GroupTitle>
        {title} · {tasks.length}
      </GroupTitle>
      <Card className="divide-y divide-line">
        {tasks.map((t) => (
          <button key={t.id} type="button" onClick={() => nav.push({ name: "task", id: t.id })} className="flex w-full items-center gap-3 px-3 py-2.5 text-left active:bg-soft">
            <TaskCover task={t} className="h-12 w-9 shrink-0 rounded-[8px]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium">{t.title}</span>
              <span className={`block truncate text-[12px] ${danger ? "text-danger" : "text-hint"}`}>
                {categoryById(state, t.categoryId)?.name} · {meta(t)}
              </span>
            </span>
            <Avatar user={userById(state, t.assigneeId)} size={24} />
            <ChevronRight className="h-4 w-4 text-hint" strokeWidth={1.75} />
          </button>
        ))}
      </Card>
    </>
  );
}
