import { Clock, MessageSquare, ThumbsUp } from "lucide-react";
import { categoryById, canSeePrice, isOverdue, useStore, userById } from "../data/store";
import type { Task } from "../data/types";
import { deadlineLabel, deadlineState, formatRub } from "../lib/format";
import { Avatar } from "./ui";

export function TaskCover({ task, className = "" }: { task: Task; className?: string }) {
  const last = task.versions[task.versions.length - 1];
  const poster = last?.poster ?? task.cover;
  const src = last?.url ?? task.sources.find((s) => s.kind === "file")?.url;
  return (
    <div className={`relative overflow-hidden bg-soft-2 ${className}`}>
      {poster ? (
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : src ? (
        <video src={`${src}#t=0.5`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

export function TaskCard({ task, dragging = false }: { task: Task; dragging?: boolean }) {
  const { state, me } = useStore();
  const assignee = userById(state, task.assigneeId);
  const category = categoryById(state, task.categoryId);
  const overdue = isOverdue(task);
  const dl = deadlineState(task.deadline);
  const lastVersion = task.versions[task.versions.length - 1];
  const openRevisions = task.revisions.filter((r) => !r.resolved && r.versionId === lastVersion?.id).length;
  const finished = task.column === "ready" || task.column === "published";

  return (
    <div
      className={`select-none overflow-hidden rounded-[16px] bg-card transition-shadow ${
        dragging ? "rotate-[1.5deg] shadow-[0_16px_40px_rgba(0,0,0,0.18)]" : ""
      }`}
    >
      <div className="flex gap-3 p-3">
        <TaskCover task={task} className="h-[76px] w-[54px] shrink-0 rounded-[10px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] text-hint">{category?.name ?? "Без категории"}</p>
          <p className="mt-0.5 line-clamp-2 text-[15px] font-medium leading-snug">{task.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]">
            {!finished && (
              <span
                className={`inline-flex items-center gap-1 ${
                  overdue ? "font-medium text-danger" : dl === "soon" ? "font-medium text-ink" : "text-hint"
                }`}
              >
                <Clock className="h-3 w-3" strokeWidth={2} />
                {deadlineLabel(task.deadline)}
              </span>
            )}
            {lastVersion && (
              <span className="rounded-[6px] bg-soft px-1.5 py-px font-medium tabular-nums">v{lastVersion.n}</span>
            )}
            {openRevisions > 0 && <span className="font-medium text-danger">{openRevisions} правк{openRevisions === 1 ? "а" : "и"}</span>}
            {task.comments.length > 0 && (
              <span className="inline-flex items-center gap-1 text-hint">
                <MessageSquare className="h-3 w-3" strokeWidth={2} />
                {task.comments.length}
              </span>
            )}
            {task.clientFeedback?.liked && <ThumbsUp className="h-3 w-3 text-success" strokeWidth={2} />}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-3 py-2">
        <span className="flex items-center gap-2 text-[13px]">
          <Avatar user={assignee} size={22} />
          {assignee?.name}
        </span>
        {canSeePrice(me, task) && <span className="text-[13px] font-medium tabular-nums">{formatRub(task.price)}</span>}
      </div>
    </div>
  );
}
