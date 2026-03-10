// lib/telegram.js
// Sends Telegram alerts to you via your bot

async function sendTelegram(message) {
  const BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const CHAT_ID   = process.env.TG_CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    CHAT_ID,
        text:       message,
        parse_mode: "HTML",
      }),
    });
  } catch { /* silent fail — never crash the main request */ }
}

module.exports = { sendTelegram };