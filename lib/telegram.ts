const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;

export async function sendTelegramNotification(data: {
  type: "text" | "audio" | "video";
  authorName: string;
  message?: string;
  mediaUrl?: string;
  shareUrl: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.warn("Telegram credentials not configured");
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

  let text = `🎉 Новое поздравление!\n\n`;
  text += `👤 Автор: ${data.authorName}\n`;
  text += `📝 Тип: ${data.type}\n`;
  if (data.message) {
    text += `💬 Сообщение: ${data.message.substring(0, 200)}${data.message.length > 200 ? "..." : ""}\n`;
  }
  text += `🔗 Просмотреть: ${data.shareUrl}`;

  try {
    const response = await fetch(`${apiUrl}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    // If media URL exists, also send it as media
    if (data.mediaUrl && data.type !== "text") {
      if (data.type === "audio") {
        await fetch(`${apiUrl}/sendAudio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHANNEL_ID,
            audio: data.mediaUrl,
            caption: `Аудио-поздравление от ${data.authorName}`,
          }),
        });
      } else if (data.type === "video") {
        await fetch(`${apiUrl}/sendVideo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHANNEL_ID,
            video: data.mediaUrl,
            caption: `Видео-поздравление от ${data.authorName}`,
            supports_streaming: true,
          }),
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
