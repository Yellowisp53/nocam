import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Flame, Plus, SlidersHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { COLUMNS } from "../data/config";
import { canMove, editors, isOverdue, useStore, visibleTasks } from "../data/store";
import type { ColumnId, Task } from "../data/types";
import { useNav } from "../lib/nav";
import { haptic } from "../lib/telegram";
import { TaskCard } from "../components/TaskCard";
import { useTaskFlow } from "../components/TaskFlow";
import { Avatar, IconBtn, Logo, Screen } from "../components/ui";

export function Board() {
  const { state, me } = useStore();
  const nav = useNav();
  const flow = useTaskFlow();
  const [assignee, setAssignee] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const tasks = useMemo(
    () =>
      visibleTasks(state, me)
        .filter((t) => assignee === "all" || t.assigneeId === assignee)
        .filter((t) => category === "all" || t.categoryId === category)
        .filter((t) => !onlyOverdue || isOverdue(t))
        .sort((a, b) => a.deadline - b.deadline),
    [state, me, assignee, category, onlyOverdue],
  );
  const byColumn = (c: ColumnId) => tasks.filter((t) => t.column === c);
  const activeTask = activeId ? state.tasks.find((t) => t.id === activeId) : undefined;
  const filtersOn = assignee !== "all" || category !== "all" || onlyOverdue;

  // мышь — после сдвига на 6px; палец — долгое нажатие (чтобы не мешать прокрутке)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  );

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
    haptic.impact("light");
  };
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const task = state.tasks.find((t) => t.id === e.active.id);
    const to = e.over?.id as ColumnId | undefined;
    if (!task || !to || to === task.column) return;
    flow.requestMove(task, to);
  };

  const scrollToColumn = (i: number) => {
    const el = scroller.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <Screen
      bare
      main={null}
    >
      <header className="sticky top-0 z-30 bg-app/95 backdrop-blur-md">
        <div className="flex h-[52px] items-center gap-2 px-4">
          <Logo />
          <span className="flex-1" />
          <IconBtn
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Фильтры"
            className={filtersOn ? "bg-ink text-card active:bg-ink" : "bg-card"}
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </IconBtn>
          {me.role === "admin" && (
            <button
              type="button"
              onClick={() => nav.push({ name: "newTask" })}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink pl-3 pr-4 text-[14px] font-medium text-card active:opacity-85"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Задача
            </button>
          )}
        </div>

        {/* счётчики по столбцам */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2.5">
          {COLUMNS.map((c, i) => {
            const n = byColumn(c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => scrollToColumn(i)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-card px-3 text-[13px]"
              >
                <span className="text-hint">{c.short}</span>
                <span className={`font-semibold tabular-nums ${c.id === "revisions" && n ? "text-danger" : ""}`}>{n}</span>
              </button>
            );
          })}
        </div>

        {showFilters && (
          <div className="animate-fade space-y-2.5 border-t border-line px-4 py-3">
            {me.role === "admin" && (
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                <FilterChip active={assignee === "all"} onClick={() => setAssignee("all")}>
                  Все монтажёры
                </FilterChip>
                {editors(state).map((u) => (
                  <FilterChip key={u.id} active={assignee === u.id} onClick={() => setAssignee(u.id)}>
                    <Avatar user={u} size={18} />
                    {u.name}
                  </FilterChip>
                ))}
              </div>
            )}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
                Все категории
              </FilterChip>
              {state.categories.map((c) => (
                <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.name}
                </FilterChip>
              ))}
            </div>
            <FilterChip active={onlyOverdue} onClick={() => setOnlyOverdue((v) => !v)}>
              <Flame className="h-3.5 w-3.5" strokeWidth={2} />
              Только просроченные
            </FilterChip>
          </div>
        )}
      </header>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)} autoScroll={{ threshold: { x: 0.18, y: 0.12 } }}>
        <div
          ref={scroller}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-28 pt-2"
        >
          {COLUMNS.map((c) => (
            <Column
              key={c.id}
              id={c.id}
              tasks={byColumn(c.id)}
              activeTask={activeTask}
              onOpen={(t) => nav.push({ name: "task", id: t.id })}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
          {activeTask ? (
            <div className="w-[min(78vw,300px)]">
              <TaskCard task={activeTask} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {flow.sheets}
    </Screen>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors ${
        active ? "bg-ink text-card" : "bg-card text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Column({
  id,
  tasks,
  activeTask,
  onOpen,
}: {
  id: ColumnId;
  tasks: Task[];
  activeTask?: Task;
  onOpen: (t: Task) => void;
}) {
  const { me } = useStore();
  const col = COLUMNS.find((c) => c.id === id)!;
  const Icon = col.icon;
  const { setNodeRef, isOver } = useDroppable({ id });
  const dropAllowed = activeTask ? canMove(me, activeTask, id).ok : false;
  const dragging = Boolean(activeTask);
  const isSource = activeTask?.column === id;

  return (
    <section className="w-[82vw] max-w-[320px] shrink-0 snap-start sm:w-[300px]">
      <div className="flex items-center gap-2 px-1 pb-2.5 pt-1">
        <Icon
          className={`h-4 w-4 ${id === "revisions" ? "text-danger" : id === "ready" ? "text-success" : "text-hint"}`}
          strokeWidth={2}
        />
        <h2 className="text-[14px] font-semibold">{col.title}</h2>
        <span className="text-[13px] tabular-nums text-hint">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[calc(100vh-220px)] flex-col gap-2 rounded-[18px] p-1.5 transition-colors duration-150 ${
          dragging && !isSource
            ? dropAllowed
              ? isOver
                ? "bg-ink/10 outline-2 outline-dashed outline-ink/40"
                : "bg-soft outline-1 outline-dashed outline-line"
              : "opacity-50"
            : "bg-soft"
        }`}
      >
        {tasks.map((t) => (
          <DraggableCard key={t.id} task={t} onOpen={() => onOpen(t)} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-1 items-start justify-center px-4 pt-8 text-center text-[13px] text-hint">{col.hint}</div>
        )}
      </div>
    </section>
  );
}

function DraggableCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      role="button"
      aria-label={`Открыть: ${task.title}`}
      className={`touch-manipulation outline-none ${isDragging ? "opacity-30" : ""}`}
      style={{ WebkitTouchCallout: "none" }}
    >
      <TaskCard task={task} />
    </div>
  );
}
