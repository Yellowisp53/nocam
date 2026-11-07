import { CheckCircle2, Eye, Inbox, Megaphone, RotateCcw, Scissors, type LucideIcon } from "lucide-react";
import type { ColumnId, VideoFormat } from "./types";

/** TODO: Столбцы доски — названия можно поменять здесь */
export const COLUMNS: { id: ColumnId; title: string; short: string; icon: LucideIcon; hint: string }[] = [
  { id: "todo", title: "Задачи", short: "Задачи", icon: Inbox, hint: "Исходник и ТЗ от админа" },
  { id: "doing", title: "В работе", short: "В работе", icon: Scissors, hint: "Монтажёр монтирует" },
  { id: "review", title: "Готово к проверке", short: "Проверка", icon: Eye, hint: "Сдана новая версия" },
  { id: "revisions", title: "На правках", short: "Правки", icon: RotateCcw, hint: "Вернули с комментариями" },
  { id: "ready", title: "К выкладке", short: "Выкладка", icon: CheckCircle2, hint: "Принято · оплата начислена" },
  { id: "published", title: "Опубликовано", short: "Архив", icon: Megaphone, hint: "Ролик выложен" },
];

export const columnById = (id: ColumnId) => COLUMNS.find((c) => c.id === id)!;

/** Столбцы, в которые переводит только админ */
export const ADMIN_ONLY_COLUMNS: ColumnId[] = ["revisions", "ready", "published"];

/** Куда монтажёр может двигать свою карточку */
export const EDITOR_FLOW: Record<ColumnId, ColumnId[]> = {
  todo: ["doing"],
  doing: ["review"],
  revisions: ["review"],
  review: [],
  ready: [],
  published: [],
};

/** После принятия (К выкладке / Опубликовано) начисляется оплата */
export const ACCEPTED_COLUMNS: ColumnId[] = ["ready", "published"];

export const FORMATS: VideoFormat[] = ["9:16", "1:1", "16:9"];

/** TODO: Цены за ролик монтажёру по умолчанию (меняются во вкладке «Команда») */
export const DEFAULT_PRICES: Record<VideoFormat, number> = {
  "9:16": 1500,
  "1:1": 1200,
  "16:9": 2500,
};
