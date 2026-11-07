/**
 * ВСЯ работа с данными — здесь. Context + useReducer + localStorage.
 * Когда появится бэкенд: action-функции ниже станут вызовами API, компоненты менять не придётся.
 * Каждое действие пишет запись в историю задачи. Права — в одном месте: canMove().
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { ADMIN_ONLY_COLUMNS, EDITOR_COLUMNS, LOCKED_COLUMNS, PAYABLE_COLUMN, columnById } from "./config";
import { createDemoState } from "./demo";
import type {
  Brief,
  Category,
  ClientFeedback,
  ColumnId,
  HistoryEntry,
  Source,
  State,
  Task,
  User,
  VideoFormat,
} from "./types";
import { isThisMonth, uid } from "../lib/format";

const STORAGE_KEY = "nocam-miniapp:v1";

// ───────────────────────── права

export type Result = { ok: true } | { ok: false; error: string };
const ok: Result = { ok: true };
const fail = (error: string): Result => ({ ok: false, error });

export function canMove(user: User, task: Task, to: ColumnId): Result {
  if (task.column === to) return fail("Карточка уже в этом столбце");
  if (user.role === "admin") return ok;
  if (task.assigneeId !== user.id) return fail("Это не ваша задача");
  if (LOCKED_COLUMNS.includes(task.column)) return fail("Ролик уже одобрен — двигает только админ");
  if (ADMIN_ONLY_COLUMNS.includes(to)) return fail(`Перевести в «${columnById(to).title}» может только админ`);
  if (!EDITOR_COLUMNS.includes(to)) return fail("Так переместить нельзя");
  return ok;
}

/** Монтажёр отправляет на проверку только вместе со своим видео (новой версией) */
export const needsVersion = (user: User, to: ColumnId) => to === "review" && user.role !== "admin";
/** Перевод в «На правках» — только с комментарием, что исправить */
export const needsComment = (to: ColumnId) => to === "revisions";

export const canEditPrice = (user: User, task: Task) => user.role === "admin" && !task.publishedAt;
export const canSeePrice = (user: User, task: Task) => user.role === "admin" || task.assigneeId === user.id;

// ───────────────────────── редьюсер

type Action =
  | { type: "replace"; state: State }
  | { type: "switchUser"; userId: string }
  | { type: "task"; taskId: string; update: (t: Task) => Task }
  | { type: "createTask"; task: Task }
  | { type: "removeTasks"; ids: string[] }
  | { type: "upsertCategory"; category: Category }
  | { type: "deleteCategory"; categoryId: string }
  | { type: "setDefaultPrice"; format: VideoFormat; price: number };

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "replace":
      return a.state;
    case "switchUser":
      return { ...state, currentUserId: a.userId };
    case "task":
      return { ...state, tasks: state.tasks.map((t) => (t.id === a.taskId ? a.update(t) : t)) };
    case "createTask":
      return { ...state, tasks: [a.task, ...state.tasks] };
    case "removeTasks":
      return { ...state, tasks: state.tasks.filter((t) => !a.ids.includes(t.id)) };
    case "upsertCategory": {
      const exists = state.categories.some((c) => c.id === a.category.id);
      return {
        ...state,
        categories: exists
          ? state.categories.map((c) => (c.id === a.category.id ? a.category : c))
          : [...state.categories, a.category],
      };
    }
    case "deleteCategory":
      return { ...state, categories: state.categories.filter((c) => c.id !== a.categoryId) };
    case "setDefaultPrice":
      return { ...state, defaultPrices: { ...state.defaultPrices, [a.format]: a.price } };
  }
}

const log = (byId: string, text: string, extra?: Partial<HistoryEntry>): HistoryEntry => ({
  id: uid("h"),
  byId,
  at: Date.now(),
  text,
  ...extra,
});

/** Перемещение + дата публикации (с неё оплата стоит «к выплате») */
function applyMove(task: Task, to: ColumnId, byId: string, text = "переместил"): Task {
  return {
    ...task,
    column: to,
    publishedAt: to === PAYABLE_COLUMN ? (task.publishedAt ?? Date.now()) : undefined,
    history: [...task.history, log(byId, text, { from: task.column, to })],
  };
}

// ───────────────────────── загрузка / сохранение

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s.version === 2 && Array.isArray(s.tasks)) return s;
    }
  } catch {
    /* битые данные — начинаем с демо */
  }
  return createDemoState();
}

// ───────────────────────── контекст

type NewTaskInput = {
  categoryId: string;
  title: string;
  assigneeId: string;
  deadline: number;
  price: number;
  brief: Brief;
  sources: Source[];
};

function useStoreValue() {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* переполнение или приватный режим */
    }
  }, [state]);

  const me = state.users.find((u) => u.id === state.currentUserId) ?? state.users[0];
  const getTask = useCallback((id: string) => state.tasks.find((t) => t.id === id), [state.tasks]);

  const actions = useMemo(() => {
    const withTask = (taskId: string, fn: (t: Task) => Result | Task): Result => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return fail("Задача не найдена");
      const res = fn(task);
      if ("ok" in res) return res;
      // применяем к самой свежей версии задачи (если несколько действий подряд в одном обработчике)
      dispatch({
        type: "task",
        taskId,
        update: (fresh) => {
          const r = fn(fresh);
          return "ok" in r ? fresh : r;
        },
      });
      return ok;
    };

    return {
      switchUser: (userId: string) => dispatch({ type: "switchUser", userId }),
      reset: () => dispatch({ type: "replace", state: { ...createDemoState(), currentUserId: state.currentUserId } }),

      createTask(input: NewTaskInput): Result & { taskId?: string } {
        if (me.role !== "admin") return fail("Задачи создаёт только админ");
        const now = Date.now();
        const file = input.sources.find((s) => s.kind === "file");
        const task: Task = {
          id: uid("t"),
          ...input,
          column: "todo",
          createdAt: now,
          cover: file?.poster,
          versions: [],
          revisions: [],
          comments: [],
          history: [log(me.id, "создал задачу", { to: "todo" })],
        };
        dispatch({ type: "createTask", task });
        return { ok: true, taskId: task.id };
      },

      /** note — комментарий к переводу (обязателен для «На правках») */
      moveTask(taskId: string, to: ColumnId, note?: string): Result {
        return withTask(taskId, (t) => {
          const allowed = canMove(me, t, to);
          if (!allowed.ok) return allowed;
          if (needsVersion(me, to)) return fail("Чтобы отправить на проверку, загрузите своё видео");
          if (needsComment(to) && !note?.trim()) return fail("Напишите, что исправить");
          let next = applyMove(t, to, me.id);
          if (note?.trim()) next = { ...next, comments: [...next.comments, { id: uid("m"), byId: me.id, text: note.trim(), at: Date.now() }] };
          return next;
        });
      },

      /** На проверку: своё видео (новая версия) + перевод в «Готово к проверке» */
      addVersion(taskId: string, v: { url: string; name?: string; note?: string; poster?: string }): Result {
        return withTask(taskId, (t) => {
          if (me.role !== "admin" && t.assigneeId !== me.id) return fail("Это не ваша задача");
          if (t.column !== "review") {
            const allowed = canMove(me, t, "review");
            if (!allowed.ok) return allowed;
          }
          const n = t.versions.length + 1;
          const version = { id: uid("v"), n, at: Date.now(), byId: me.id, ...v };
          let next: Task = { ...t, versions: [...t.versions, version], cover: v.poster ?? t.cover };
          next =
            t.column === "review"
              ? { ...next, history: [...next.history, log(me.id, `загрузил версию v${n}`)] }
              : applyMove(next, "review", me.id, `сдал версию v${n}`);
          return next;
        });
      },

      addRevision(taskId: string, versionId: string, atSec: number, text: string): Result {
        if (me.role !== "admin") return fail("Правки оставляет админ");
        if (!text.trim()) return fail("Напишите правку");
        return withTask(taskId, (t) => ({
          ...t,
          revisions: [
            ...t.revisions,
            { id: uid("r"), versionId, atSec, text: text.trim(), byId: me.id, at: Date.now(), resolved: false },
          ],
        }));
      },

      toggleRevision(taskId: string, revisionId: string): Result {
        return withTask(taskId, (t) => {
          if (me.role !== "admin" && t.assigneeId !== me.id) return fail("Это не ваша задача");
          return {
            ...t,
            revisions: t.revisions.map((r) => (r.id === revisionId ? { ...r, resolved: !r.resolved } : r)),
          };
        });
      },

      comment(taskId: string, text: string): Result {
        if (!text.trim()) return fail("Пустое сообщение");
        return withTask(taskId, (t) => ({
          ...t,
          comments: [...t.comments, { id: uid("m"), byId: me.id, text: text.trim(), at: Date.now() }],
        }));
      },

      setPrice(taskId: string, price: number): Result {
        return withTask(taskId, (t) => {
          if (!canEditPrice(me, t)) return fail("Цену нельзя менять после принятия ролика");
          if (!Number.isFinite(price) || price < 0) return fail("Некорректная цена");
          return { ...t, price, history: [...t.history, log(me.id, `изменил цену на ${price} ₽`)] };
        });
      },

      setClientFeedback(taskId: string, fb: Omit<ClientFeedback, "at">): Result {
        return withTask(taskId, (t) => ({
          ...t,
          clientFeedback: { ...fb, at: Date.now() },
          history: [...t.history, log(me.id, fb.liked ? "клиенту понравилось" : "клиент прислал правки")],
        }));
      },

      /** Убрать опубликованные ролики (всех или одного монтажёра) — вместе с ними уходит и «к выплате» */
      clearPublished(userId?: string): Result & { count?: number } {
        if (me.role !== "admin") return fail("Очищает только админ");
        const ids = state.tasks
          .filter((t) => t.column === PAYABLE_COLUMN && (!userId || t.assigneeId === userId))
          .map((t) => t.id);
        if (!ids.length) return fail("Опубликованных роликов нет");
        dispatch({ type: "removeTasks", ids });
        return { ok: true, count: ids.length };
      },

      saveCategory(c: { id?: string; name: string; description: string }): Result & { id?: string } {
        if (me.role !== "admin") return fail("Категории создаёт только админ");
        if (!c.name.trim()) return fail("Введите название");
        const id = c.id ?? uid("c");
        dispatch({
          type: "upsertCategory",
          category: { id, name: c.name.trim(), description: c.description.trim() },
        });
        return { ok: true, id };
      },

      deleteCategory(categoryId: string): Result {
        if (state.tasks.some((t) => t.categoryId === categoryId)) return fail("В категории есть задачи");
        dispatch({ type: "deleteCategory", categoryId });
        return ok;
      },

      setDefaultPrice(format: VideoFormat, price: number) {
        if (Number.isFinite(price) && price >= 0) dispatch({ type: "setDefaultPrice", format, price: Math.round(price) });
      },
    };
  }, [state, me]);

  return { state, me, getTask, actions };
}

type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore вне StoreProvider");
  return s;
}

// ───────────────────────── селекторы

export const userById = (s: State, id: string) => s.users.find((u) => u.id === id);
export const categoryById = (s: State, id: string) => s.categories.find((c) => c.id === id);
export const editors = (s: State) => s.users.filter((u) => u.role === "editor");

/** Монтажёр видит только свои карточки */
export const visibleTasks = (s: State, me: User) =>
  me.role === "admin" ? s.tasks : s.tasks.filter((t) => t.assigneeId === me.id);

export const isOverdue = (t: Task, now = Date.now()) => t.deadline < now && !LOCKED_COLUMNS.includes(t.column);

/** «К выплате» — сумма цен опубликованных роликов монтажёра. Никаких переводов: очистили опубликованные — сумма ушла */
export function dueOf(s: State, userId: string) {
  const tasks = s.tasks
    .filter((t) => t.assigneeId === userId && t.column === PAYABLE_COLUMN)
    .sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
  return { due: tasks.reduce((sum, t) => sum + t.price, 0), tasks };
}

export function editorStats(s: State, userId: string) {
  const mine = s.tasks.filter((t) => t.assigneeId === userId);
  const acceptedThisMonth = mine.filter((t) => t.publishedAt && isThisMonth(t.publishedAt));
  const done = mine.filter((t) => t.publishedAt);
  const avgDays = done.length
    ? done.reduce((sum, t) => sum + (t.publishedAt! - t.createdAt), 0) / done.length / 86_400_000
    : 0;
  const rounds = mine.reduce((sum, t) => sum + t.history.filter((h) => h.to === "revisions").length, 0);
  const active = mine.filter((t) => ["todo", "doing", "review", "revisions"].includes(t.column)).length;
  return {
    acceptedThisMonth: acceptedThisMonth.length,
    earnedThisMonth: acceptedThisMonth.reduce((sum, t) => sum + t.price, 0),
    avgDays,
    revisionRounds: done.length ? rounds / Math.max(1, mine.length) : 0,
    active,
    inWork: mine.filter((t) => t.column === "doing").length,
  };
}
