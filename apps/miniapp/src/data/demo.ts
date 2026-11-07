/**
 * Демо-данные. Дедлайны и даты считаются относительно текущего времени —
 * поэтому всегда есть «горящие» и просроченные задачи.
 * TODO: Реальную команду и категории впишите здесь (или создайте в приложении).
 */
import { DEFAULT_PRICES } from "./config";
import type { Brief, ColumnId, HistoryEntry, State, Task, User } from "./types";

const H = 3_600_000;
const D = 24 * H;

export const ADMIN_ID = "u-filipp";

export const demoUsers: User[] = [
  { id: ADMIN_ID, name: "Филипп", role: "admin", color: "#0d0d0d", username: "filipp" },
  { id: "u-max", name: "Максим", role: "editor", color: "#3d3d3d", username: "maxim_edit" },
  { id: "u-egor", name: "Егор", role: "editor", color: "#6b6b6b", username: "egor_cut" },
  { id: "u-kirill", name: "Кирилл", role: "editor", color: "#9a9a9a", username: "kirill_motion" },
];

const clip = {
  clothing: { url: "/demo/01-clothing.mp4", poster: "/demo/01-clothing.jpg" },
  dentist: { url: "/demo/02-dentist.mp4", poster: "/demo/02-dentist.jpg" },
  realty: { url: "/demo/04-realty.mp4", poster: "/demo/04-realty.jpg" },
};

const brief = (b: Partial<Brief>): Brief => ({
  script: "",
  notes: "",
  references: [],
  format: "9:16",
  duration: "30–45 сек",
  ...b,
});

let seq = 0;
const id = (p: string) => `${p}-${++seq}`;

function story(createdAt: number, assigneeId: string, steps: [ColumnId, number, string?][]): HistoryEntry[] {
  const h: HistoryEntry[] = [{ id: id("h"), byId: ADMIN_ID, at: createdAt, text: "создал задачу", to: "todo" }];
  let from: ColumnId = "todo";
  for (const [to, at, by] of steps) {
    h.push({ id: id("h"), byId: by ?? assigneeId, at, text: "переместил", from, to });
    from = to;
  }
  return h;
}

export function createDemoState(now = Date.now()): State {
  seq = 0;
  const t = (offset: number) => now + offset;

  const tasks: Task[] = [
    // ── Задачи
    {
      id: "t-1",
      categoryId: "c-smile",
      title: "Миф о коронках — часть 2",
      assigneeId: "u-kirill",
      column: "todo",
      createdAt: t(-5 * H),
      deadline: t(2 * D),
      price: 1500,
      cover: clip.dentist.poster,
      brief: brief({
        script:
          "Хук: «Если врач говорит, что зуб под коронку нужно сточить почти полностью — это вторая ложь».\nДалее 3 тезиса с 3D-визуализацией. Финал — запись на консультацию.",
        notes: "Субтитры слово за словом, акцент на ключевых словах. Музыка спокойная, без вокала.",
        references: ["https://www.instagram.com/reel/example1", "https://www.youtube.com/shorts/example2"],
        duration: "35–40 сек",
      }),
      sources: [
        { id: id("s"), kind: "file", name: "avatar_doctor_take3.mp4", ...clip.dentist },
        { id: id("s"), kind: "link", name: "Исходники на Яндекс Диске", url: "https://disk.yandex.ru/d/example" },
      ],
      versions: [],
      revisions: [],
      comments: [],
      history: story(t(-5 * H), "u-kirill", []),
    },
    {
      id: "t-2",
      categoryId: "c-brand",
      title: "Термобалаклавы — креатив для таргета",
      assigneeId: "u-max",
      column: "todo",
      createdAt: t(-2 * H),
      deadline: t(3 * D),
      price: 1200,
      cover: clip.clothing.poster,
      brief: brief({
        script: "Три коротких варианта по 15 сек под тест гипотез: «тепло», «стиль», «цена».",
        notes: "Формат 1:1 для ленты. Крупные надписи, в конце — оффер −15%.",
        format: "1:1",
        duration: "15 сек × 3",
      }),
      sources: [{ id: id("s"), kind: "file", name: "lookbook_raw.mp4", ...clip.clothing }],
      versions: [],
      revisions: [],
      comments: [],
      history: story(t(-2 * H), "u-max", []),
    },
    // ── В работе
    {
      id: "t-3",
      categoryId: "c-realty",
      title: "Обзор ЖК в Хамовниках",
      assigneeId: "u-egor",
      column: "doing",
      createdAt: t(-2 * D),
      deadline: t(1 * D + 3 * H),
      price: 2000,
      cover: clip.realty.poster,
      brief: brief({
        script: "Ведущая у дома → локация → инфраструктура → планировки → рассрочка. Призыв: записаться на просмотр.",
        notes: "Рендеры чередовать с картой. Шрифт — как в прошлых роликах риелтора.",
        duration: "40 сек",
      }),
      sources: [
        { id: id("s"), kind: "file", name: "presenter.mp4", ...clip.realty },
        { id: id("s"), kind: "link", name: "Рендеры от застройщика (Google Drive)", url: "https://drive.google.com/drive/folders/example" },
      ],
      versions: [],
      revisions: [],
      comments: [
        { id: id("m"), byId: "u-egor", text: "Взял. Рендеров хватает, карту сделаю сам.", at: t(-40 * H) },
        { id: id("m"), byId: ADMIN_ID, text: "Отлично, главное — рассрочку крупно в конце.", at: t(-39 * H) },
      ],
      history: story(t(-2 * D), "u-egor", [["doing", t(-40 * H)]]),
    },
    {
      id: "t-4",
      categoryId: "c-brand",
      title: "Лукбук осень — Reels",
      assigneeId: "u-kirill",
      column: "doing",
      createdAt: t(-4 * D),
      deadline: t(-20 * H),
      price: 1500,
      cover: clip.clothing.poster,
      brief: brief({ script: "Смена образов под бит, на каждом — название модели.", notes: "Монтаж в ритм, 2–3 перехода." }),
      sources: [{ id: id("s"), kind: "file", name: "fall_lookbook.mp4", ...clip.clothing }],
      versions: [],
      revisions: [],
      comments: [],
      history: story(t(-4 * D), "u-kirill", [["doing", t(-3 * D)]]),
    },
    {
      id: "t-5",
      categoryId: "c-smile",
      title: "Отбеливание: правда и мифы",
      assigneeId: "u-max",
      column: "doing",
      createdAt: t(-1 * D),
      deadline: t(5 * H),
      price: 1500,
      cover: clip.dentist.poster,
      brief: brief({ script: "5 мифов об отбеливании за 40 секунд.", notes: "Аватар врача + 3D." }),
      sources: [{ id: id("s"), kind: "file", name: "avatar_whitening.mp4", ...clip.dentist }],
      versions: [],
      revisions: [],
      comments: [],
      history: story(t(-1 * D), "u-max", [["doing", t(-20 * H)]]),
    },
    // ── Готово к проверке
    {
      id: "t-6",
      categoryId: "c-brand",
      title: "История swag — серия 1",
      assigneeId: "u-egor",
      column: "review",
      createdAt: t(-3 * D),
      deadline: t(1 * D),
      price: 1800,
      cover: clip.clothing.poster,
      brief: brief({ script: "Эпоха swag: от джаза до стритвира.", notes: "Архивные кадры, типографика.", duration: "60 сек" }),
      sources: [{ id: id("s"), kind: "link", name: "Архив кадров", url: "https://disk.yandex.ru/d/archive" }],
      versions: [{ id: "v-6-1", n: 1, url: clip.clothing.url, poster: clip.clothing.poster, at: t(-3 * H), byId: "u-egor", note: "Первая версия" }],
      revisions: [],
      comments: [],
      history: story(t(-3 * D), "u-egor", [
        ["doing", t(-2 * D)],
        ["review", t(-3 * H)],
      ]),
    },
    {
      id: "t-7",
      categoryId: "c-clinic",
      title: "Эмаль после отбеливания",
      assigneeId: "u-kirill",
      column: "review",
      createdAt: t(-5 * D),
      deadline: t(2 * D),
      price: 1500,
      cover: clip.dentist.poster,
      brief: brief({ script: "Почему эмаль временно становится чувствительной и что делать.", notes: "Врач в кадре, 3D эмали." }),
      sources: [{ id: id("s"), kind: "file", name: "doctor_enamel.mp4", ...clip.dentist }],
      versions: [
        { id: "v-7-1", n: 1, url: clip.dentist.url, poster: clip.dentist.poster, at: t(-3 * D), byId: "u-kirill" },
        { id: "v-7-2", n: 2, url: clip.dentist.url, poster: clip.dentist.poster, at: t(-6 * H), byId: "u-kirill", note: "Исправил паузу и субтитры" },
      ],
      revisions: [
        { id: id("r"), versionId: "v-7-1", atSec: 1, text: "Убрать паузу в начале — сразу хук", byId: ADMIN_ID, at: t(-2.5 * D), resolved: true },
        { id: id("r"), versionId: "v-7-1", atSec: 4, text: "Субтитры крупнее, сейчас не читаются", byId: ADMIN_ID, at: t(-2.5 * D), resolved: true },
      ],
      comments: [{ id: id("m"), byId: "u-kirill", text: "Сдал v2, обе правки поправил.", at: t(-6 * H) }],
      history: story(t(-5 * D), "u-kirill", [
        ["doing", t(-4 * D)],
        ["review", t(-3 * D)],
        ["revisions", t(-2.5 * D), ADMIN_ID],
        ["review", t(-6 * H)],
      ]),
    },
    // ── На правках
    {
      id: "t-8",
      categoryId: "c-realty",
      title: "Клубный дом — тизер 15 сек",
      assigneeId: "u-max",
      column: "revisions",
      createdAt: t(-3 * D),
      deadline: t(-3 * H),
      price: 1000,
      cover: clip.realty.poster,
      brief: brief({ script: "Тизер: фасад, лобби, вид из окна, «скоро старт продаж».", duration: "15 сек" }),
      sources: [{ id: id("s"), kind: "file", name: "renders_pack.mp4", ...clip.realty }],
      versions: [{ id: "v-8-1", n: 1, url: clip.realty.url, poster: clip.realty.poster, at: t(-1 * D), byId: "u-max" }],
      revisions: [
        { id: id("r"), versionId: "v-8-1", atSec: 2, text: "Логотип застройщика — в правый верхний угол", byId: ADMIN_ID, at: t(-20 * H), resolved: false },
        { id: id("r"), versionId: "v-8-1", atSec: 5, text: "Музыку тише под голос", byId: ADMIN_ID, at: t(-20 * H), resolved: false },
      ],
      comments: [{ id: id("m"), byId: ADMIN_ID, text: "Две правки по таймкодам, остальное огонь.", at: t(-20 * H) }],
      history: story(t(-3 * D), "u-max", [
        ["doing", t(-2 * D)],
        ["review", t(-1 * D)],
        ["revisions", t(-20 * H), ADMIN_ID],
      ]),
    },
    // ── К выкладке
    {
      id: "t-9",
      categoryId: "c-smile",
      title: "Зуб мудрости: удалять или нет",
      assigneeId: "u-egor",
      column: "ready",
      createdAt: t(-7 * D),
      deadline: t(-3 * D),
      price: 1500,
      cover: clip.dentist.poster,
      brief: brief({ script: "Когда удалять зуб мудрости, а когда — нет." }),
      sources: [{ id: id("s"), kind: "file", name: "wisdom_tooth.mp4", ...clip.dentist }],
      versions: [{ id: "v-9-1", n: 1, url: clip.dentist.url, poster: clip.dentist.poster, at: t(-4 * D), byId: "u-egor" }],
      revisions: [],
      comments: [],
      acceptedAt: t(-3 * D),
      history: story(t(-7 * D), "u-egor", [
        ["doing", t(-6 * D)],
        ["review", t(-4 * D)],
        ["ready", t(-3 * D), ADMIN_ID],
      ]),
    },
    {
      id: "t-10",
      categoryId: "c-brand",
      title: "Балаклавы — ролик 2",
      assigneeId: "u-max",
      column: "ready",
      createdAt: t(-6 * D),
      deadline: t(-1 * D),
      price: 1500,
      cover: clip.clothing.poster,
      brief: brief({ script: "Продолжение ролика про термобалаклавы." }),
      sources: [{ id: id("s"), kind: "file", name: "balaclava_2.mp4", ...clip.clothing }],
      versions: [{ id: "v-10-1", n: 1, url: clip.clothing.url, poster: clip.clothing.poster, at: t(-2 * D), byId: "u-max" }],
      revisions: [],
      comments: [],
      acceptedAt: t(-1 * D),
      clientFeedback: { liked: true, comment: "Супер, выкладываем в пятницу!", at: t(-20 * H), versionId: "v-10-1" },
      history: story(t(-6 * D), "u-max", [
        ["doing", t(-5 * D)],
        ["review", t(-2 * D)],
        ["ready", t(-1 * D), ADMIN_ID],
      ]),
    },
    // ── Опубликовано
    {
      id: "t-11",
      categoryId: "c-clinic",
      title: "Чистка зубов: как часто",
      assigneeId: "u-max",
      column: "published",
      createdAt: t(-14 * D),
      deadline: t(-10 * D),
      price: 1500,
      cover: clip.dentist.poster,
      brief: brief({ script: "Как часто нужна профессиональная чистка." }),
      sources: [],
      versions: [{ id: "v-11-1", n: 1, url: clip.dentist.url, poster: clip.dentist.poster, at: t(-11 * D), byId: "u-max" }],
      revisions: [],
      comments: [],
      acceptedAt: t(-10 * D),
      publishedAt: t(-8 * D),
      history: story(t(-14 * D), "u-max", [
        ["doing", t(-13 * D)],
        ["review", t(-11 * D)],
        ["ready", t(-10 * D), ADMIN_ID],
        ["published", t(-8 * D), ADMIN_ID],
      ]),
    },
    {
      id: "t-12",
      categoryId: "c-realty",
      title: "Квартира в рассрочку",
      assigneeId: "u-egor",
      column: "published",
      createdAt: t(-18 * D),
      deadline: t(-15 * D),
      price: 2000,
      cover: clip.realty.poster,
      brief: brief({ script: "Как купить квартиру в рассрочку без переплат." }),
      sources: [],
      versions: [{ id: "v-12-1", n: 1, url: clip.realty.url, poster: clip.realty.poster, at: t(-16 * D), byId: "u-egor" }],
      revisions: [],
      comments: [],
      acceptedAt: t(-15 * D),
      publishedAt: t(-12 * D),
      history: story(t(-18 * D), "u-egor", [
        ["doing", t(-17 * D)],
        ["review", t(-16 * D)],
        ["ready", t(-15 * D), ADMIN_ID],
        ["published", t(-12 * D), ADMIN_ID],
      ]),
    },
    {
      id: "t-13",
      categoryId: "c-smile",
      title: "Брекеты или элайнеры",
      assigneeId: "u-kirill",
      column: "published",
      createdAt: t(-24 * D),
      deadline: t(-20 * D),
      price: 1500,
      cover: clip.dentist.poster,
      brief: brief({ script: "Сравнение брекетов и элайнеров." }),
      sources: [],
      versions: [{ id: "v-13-1", n: 1, url: clip.dentist.url, poster: clip.dentist.poster, at: t(-21 * D), byId: "u-kirill" }],
      revisions: [],
      comments: [],
      acceptedAt: t(-20 * D),
      publishedAt: t(-18 * D),
      history: story(t(-24 * D), "u-kirill", [
        ["doing", t(-23 * D)],
        ["review", t(-21 * D)],
        ["ready", t(-20 * D), ADMIN_ID],
        ["published", t(-18 * D), ADMIN_ID],
      ]),
    },
  ];

  return {
    version: 1,
    currentUserId: ADMIN_ID,
    users: demoUsers,
    categories: [
      { id: "c-smile", name: "Стоматология Smile", description: "Экспертные ролики врачей, 3D-визуализация" },
      { id: "c-brand", name: "Бренд одежды", description: "Термобалаклавы и стритвир, Reels и таргет" },
      { id: "c-realty", name: "Риелтор Иванов", description: "Обзоры ЖК в Москве, ведущая + рендеры" },
      { id: "c-clinic", name: "Клиника «Эмаль»", description: "Серия роликов от лица врача" },
    ],
    tasks,
    payouts: [
      { id: "p-1", userId: "u-egor", amount: 2000, at: t(-11 * D), note: "Перевод на карту" },
      { id: "p-2", userId: "u-kirill", amount: 1500, at: t(-17 * D), note: "Перевод на карту" },
      { id: "p-3", userId: "u-max", amount: 1500, at: t(-7 * D), note: "За «Чистку зубов»" },
    ],
    defaultPrices: { ...DEFAULT_PRICES },
  };
}
