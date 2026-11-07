import { CheckCircle2, Eye, Inbox, Megaphone, RotateCcw, Scissors, type LucideIcon } from "lucide-react";
import type { ColumnId, VideoFormat } from "./types";

/** TODO: Столбцы доски — названия можно поменять здесь */
export const COLUMNS: { id: ColumnId; title: string; short: string; icon: LucideIcon; hint: string }[] = [
  { id: "todo", title: "Задачи", short: "Задачи", icon: Inbox, hint: "Исходник и ТЗ от админа" },
  { id: "doing", title: "В работе", short: "В работе", icon: Scissors, hint: "Монтажёр монтирует" },
  { id: "review", title: "Готово к проверке", short: "Проверка", icon: Eye, hint: "Видео загружено — админ смотрит" },
  { id: "revisions", title: "На правках", short: "Правки", icon: RotateCcw, hint: "Вернули с комментариями" },
  { id: "ready", title: "К выкладке", short: "Выкладка", icon: CheckCircle2, hint: "Принято админом · ждёт выкладки" },
  { id: "published", title: "Опубликовано", short: "Архив", icon: Megaphone, hint: "Ролик выложен · оплата к выплате" },
];

export const columnById = (id: ColumnId) => COLUMNS.find((c) => c.id === id)!;

/**
 * Монтажёр свободно двигает свою карточку между «Задачи», «В работе» и «Готово к проверке»
 * (взял по ошибке — вернул в задачи, забыл правку — забрал с проверки).
 * «На правках» ставит админ (с комментарием), «К выкладке» и «Опубликовано» — тоже только админ;
 * оттуда монтажёр карточку уже не двигает.
 */
export const EDITOR_COLUMNS: ColumnId[] = ["todo", "doing", "review"];
export const ADMIN_ONLY_COLUMNS: ColumnId[] = ["revisions", "ready", "published"];
/** Ролик одобрен админом — монтажёр его больше не трогает */
export const LOCKED_COLUMNS: ColumnId[] = ["ready", "published"];

/** Ролик в «Опубликовано» — оплата стоит «к выплате». Очистка опубликованных убирает и её */
export const PAYABLE_COLUMN: ColumnId = "published";

export const FORMATS: VideoFormat[] = ["9:16", "1:1", "16:9"];

/** TODO: Цены за ролик монтажёру по умолчанию (меняются во вкладке «Команда») */
export const DEFAULT_PRICES: Record<VideoFormat, number> = {
  "9:16": 1500,
  "1:1": 1200,
  "16:9": 2500,
};
