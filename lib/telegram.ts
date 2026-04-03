import { получитьSupabaseAdmin } from "./supabase/server";
import { BUCKETS } from "./supabase/storage";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

function getBucket(type: "audio" | "video"): string {
  return BUCKETS[type];
}

export async function sendTelegramNotification(data: {
  type: "text" | "audio" | "video";
  authorName: string;
  message?: string;
  mediaUrl?: string;
  mediaKey?: string;
  shareUrl: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.warn("Telegram credentials not configured");
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

  let text = "🎉 Новое поздравление!\n\n";
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
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Telegram API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
      );
    }

    console.info("Telegram notification sent", {
      type: data.type,
      shareUrl: data.shareUrl,
    });

    if (data.mediaKey && data.mediaUrl && data.type !== "text") {
      const supabaseAdmin = получитьSupabaseAdmin();
      const bucket = getBucket(data.type);

      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from(bucket)
        .download(data.mediaKey);

      if (downloadError) {
        console.error("Failed to download media from Supabase:", downloadError);
        return { success: true };
      }

      const formData = new FormData();
      formData.append("chat_id", TELEGRAM_CHANNEL_ID);
      formData.append(
        "caption",
        `${data.type === "audio" ? "Аудио" : "Видео"}-поздравление от ${data.authorName}`
      );

      const ext = data.mediaKey.split(".").pop() || (data.type === "audio" ? "mp3" : "mp4");
      const fileName = `congratulation.${ext}`;
      const blob = new Blob([fileData], {
        type: data.type === "audio" ? "audio/mpeg" : "video/mp4",
      });
      formData.append(data.type === "audio" ? "audio" : "video", blob, fileName);

      const endpoint = data.type === "audio" ? "sendAudio" : "sendVideo";
      const mediaResponse = await fetch(`${apiUrl}/${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!mediaResponse.ok) {
        const errorText = await mediaResponse.text().catch(() => "");
        throw new Error(
          `Telegram API error (${endpoint}): ${mediaResponse.status} ${mediaResponse.statusText}${errorText ? ` - ${errorText}` : ""}`
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
