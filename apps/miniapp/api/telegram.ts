/**
 * Вебхук бота @NoCam53_bot (Vercel Function: https://nocam-miniapp.vercel.app/api/telegram).
 * Отвечает на /start, /app, /help и любое сообщение подсказкой + кнопкой «Открыть студию».
 * Переменные окружения на Vercel: BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, MINIAPP_URL.
 * Уведомления о задачах («новая задача», «вернули на правки») — позже, вместе с бэкендом.
 */

type Update = {
  message?: {
    chat: { id: number; type: string };
    from?: { first_name?: string };
    text?: string;
  };
};

const MINIAPP_URL = process.env.MINIAPP_URL || "https://nocam-miniapp.vercel.app";

const openButton = {
  inline_keyboard: [[{ text: "Открыть студию", web_app: { url: MINIAPP_URL } }]],
};

function startText(name?: string) {
  return [
    `Привет${name ? `, ${name}` : ""}! Это студия nocam.`,
    "",
    "Здесь мы работаем над роликами: задачи с исходниками и ТЗ, сдача версий, правки по таймкоду и учёт оплаты монтажёрам.",
    "",
    "Чтобы открыть приложение, нажмите кнопку «Студия» слева от поля ввода или кнопку ниже.",
  ].join("\n");
}

const helpText = [
  "Что можно делать в студии:",
  "",
  "• Доска — все ролики по этапам: от задачи до публикации",
  "• Карточка задачи — исходники, ТЗ, версии ролика и чат",
  "• Правки по таймкоду — комментарий к нужной секунде видео",
  "• Кабинет — сколько начислено и сколько к выплате",
  "",
  "Команды: /start — начать, /app — открыть студию, /help — эта подсказка.",
].join("\n");

async function send(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: openButton }),
  });
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("forbidden", { status: 403 });
  }

  try {
    const update = (await request.json()) as Update;
    const msg = update.message;
    if (msg && msg.chat.type === "private") {
      const cmd = (msg.text ?? "").trim().split(/[\s@]/)[0].toLowerCase();
      if (cmd === "/help") await send(msg.chat.id, helpText);
      else if (cmd === "/app") await send(msg.chat.id, "Студия nocam — нажмите кнопку ниже, чтобы открыть.");
      else await send(msg.chat.id, startText(msg.from?.first_name));
    }
  } catch {
    /* битый апдейт — просто подтверждаем получение */
  }
  // Telegram ждёт 200, иначе будет слать апдейт повторно
  return new Response("ok");
}

export function GET() {
  return new Response("nocam bot webhook");
}
