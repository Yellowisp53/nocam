# nocam

Дипломный проект — Петюшик Филипп Егорович.

**nocam** — видеопродакшен «без съёмок»: ролики и AI-аватары для бизнеса. Проект состоит из двух независимых продуктов:

| | Для кого | Стек | Ссылка |
|---|---|---|---|
| **Сайт** `apps/web` | Клиенты: работы, цены, калькулятор, заявка | Next.js 16, React 19, Tailwind CSS 4, Motion | https://nocam-web.vercel.app |
| **Telegram Mini App** `apps/miniapp` | Админ и монтажёры: задачи, правки, оплата | Vite 8, React 19, Tailwind CSS 4, dnd-kit | бот [@NoCam53_bot](https://t.me/NoCam53_bot) → «Студия» |

Сейчас готов фронтенд. Данные демонстрационные (сайт — `apps/web/src/data/content.ts`, Mini App — `localStorage`), отправка заявок и загрузка файлов имитируются. Бот отвечает на `/start`, `/app`, `/help` через Vercel Function `apps/miniapp/api/telegram.ts`.

## Запуск

Нужен Node.js 20+.

```bash
npm install
npm run dev:web        # сайт → http://localhost:3000
npm run dev:miniapp    # Mini App → http://localhost:5173
```

Сборка:

```bash
npm run build:web      # статический сайт → apps/web/out/
npm run build:miniapp  # → apps/miniapp/dist/
```

## OpenServer

Сайт собирается в обычные HTML-файлы, поэтому его можно открыть в OpenServer 6:

1. Положить проект в `C:\OSPanel\home\nocam.local`.
2. Создать файл `.osp\project.ini`:
   ```ini
   [nocam.local]

   http_engine = Apache
   php_engine  = PHP-8.4
   web_root    = {base_dir}\apps\web\out
   ```
3. `npm install` и `npm run build:web`, перезапустить OpenServer, открыть http://nocam.local.

## Telegram-бот

Скопировать `.env.example` в `.env` и заполнить `BOT_TOKEN`, `MINIAPP_URL`, `TELEGRAM_WEBHOOK_SECRET`.
Затем `npm run telegram:setup` — скрипт ставит кнопку меню «Студия», описание, команды и вебхук.

## Структура

```
apps/
  web/                 сайт для клиентов
    src/data/content.ts  все тексты, цены, тарифы, работы, FAQ
    src/components/      ui · layout · sections
    public/videos/       ролики, превью и постеры
  miniapp/             Telegram Mini App
    src/data/store.tsx   данные, действия и права доступа
    src/screens/         доска, задача, кабинет, команда, профиль…
    api/telegram.ts      вебхук бота
scripts/
  prepare-videos.sh    сжатие роликов FFmpeg (H.264, постер, превью)
  telegram-setup.mjs   настройка бота через Bot API
```

## Сценарий Mini App

Админ создаёт категорию и задачу монтажёру (видео, ТЗ, цена) → монтажёр берёт в работу и сдаёт v1 →
админ оставляет правку по таймкоду и возвращает на правки → монтажёр сдаёт v2 → админ принимает,
монтажёру начисляется оплата → админ отмечает выплату → ролик «Опубликовано».
Вне Telegram сверху есть переключатель «Демо в браузере» — можно войти как админ или любой монтажёр.
