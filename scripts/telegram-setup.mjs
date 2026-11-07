/**
 * Настройка бота @NoCam53_bot через Bot API: кнопка меню «Студия», описание, команды.
 * Запуск из корня проекта:  npm run telegram:setup
 * (= node --env-file=.env scripts/telegram-setup.mjs)
 *
 * В .env нужны: BOT_TOKEN=...   MINIAPP_URL=https://...  (HTTPS-адрес Mini App — Vercel или cloudflared)
 * Токен — только в .env. Никогда не коммитить его в git.
 */
const { BOT_TOKEN, MINIAPP_URL, TELEGRAM_WEBHOOK_SECRET } = process.env;

if (!BOT_TOKEN) {
  console.error("Нет BOT_TOKEN в .env");
  process.exit(1);
}
if (!MINIAPP_URL || !MINIAPP_URL.startsWith("https://") || MINIAPP_URL.includes("your-miniapp")) {
  console.error("Укажите в .env MINIAPP_URL — настоящий HTTPS-адрес Mini App (Vercel или cloudflared).");
  process.exit(1);
}

async function call(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log(`${json.ok ? "OK  " : "FAIL"} ${method}${json.ok ? "" : ` — ${json.description}`}`);
  return json;
}

const me = await call("getMe", {});
if (!me.ok) process.exit(1);
console.log(`Бот: @${me.result.username}\n`);

await call("setChatMenuButton", {
  menu_button: { type: "web_app", text: "Студия", web_app: { url: MINIAPP_URL } },
});
await call("setMyShortDescription", {
  short_description: "Студия nocam: задачи, ролики и правки для команды монтажёров.",
});
await call("setMyDescription", {
  description:
    "Рабочее пространство студии nocam.\n\nЗдесь админ раздаёт задачи с исходниками и ТЗ, монтажёры сдают ролики, а правки ставятся прямо по таймкоду. Нажмите «Студия», чтобы открыть приложение.",
});
await call("setMyCommands", {
  commands: [
    { command: "start", description: "Начать" },
    { command: "app", description: "Открыть студию" },
    { command: "help", description: "Помощь" },
  ],
});

// ответы на /start, /app, /help — функция apps/miniapp/api/telegram.ts на Vercel
await call("setWebhook", {
  url: new URL("/api/telegram", MINIAPP_URL).href,
  secret_token: TELEGRAM_WEBHOOK_SECRET || undefined,
  allowed_updates: ["message"],
  drop_pending_updates: true,
});

console.log("\nГотово. Откройте бота в Telegram — внизу появится кнопка «Студия».");
