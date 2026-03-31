import { z } from "zod";

// Media constraints
const maxAudioSize = 50 * 1024 * 1024; // 50MB
const maxVideoSize = 200 * 1024 * 1024; // 200MB
const maxMessageLength = 2000;
const maxNameLength = 100;
const allowedAudioTypes = [
  "audio/webm",
  "audio/mp3",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
];
const allowedVideoTypes = ["video/webm", "video/mp4", "video/quicktime"];
const allowedVideoExtensions = [".mp4", ".webm", ".mov", ".m4v"];
const isAllowedVideoType = (type: string, name?: string) => {
  if (allowedVideoTypes.includes(type)) return true;
  if (type.startsWith("video/webm")) return true;
  if (type.startsWith("video/mp4")) return true;
  if (type.startsWith("video/quicktime")) return true;
  if (type.startsWith("video/")) return true;

  if (name) {
    const lower = name.toLowerCase();
    return allowedVideoExtensions.some((ext) => lower.endsWith(ext));
  }

  return false;
};

export const congratulationSchema = z
  .object({
    author_name: z
      .string()
      .min(1, "Имя автора обязательно")
      .max(maxNameLength, `Имя автора не должно превышать ${maxNameLength} символов`)
      .regex(
        /^[a-zA-Zа-яА-Я\s'-]+$/,
        "Имя автора может содержать только буквы, пробелы, дефисы и апострофы"
      ),
    type: z.enum(["text", "audio", "video"]),
    message: z
      .string()
      .max(maxMessageLength, `Сообщение не должно превышать ${maxMessageLength} символов`)
      .optional(),
    media_file: z.custom<File>((val) => val instanceof File, "Файл обязателен").optional(),
    media_url: z.string().url("Неверный URL медиафайла").optional(),
    duration_sec: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "text") {
      return;
    }

    if (!data.media_file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Файл обязателен",
        path: ["media_file"],
      });
      return;
    }

    if (data.type === "audio") {
      const audioType = data.media_file.type || "";
      const audioName = data.media_file.name || "";
      const audioExt = audioName.toLowerCase();
      const isAllowedAudio =
        allowedAudioTypes.includes(audioType) ||
        audioType.startsWith("audio/mp4") ||
        audioType.startsWith("audio/aac") ||
        (audioType === "" &&
          [".m4a", ".aac", ".mp3", ".wav", ".ogg", ".webm"].some((ext) =>
            audioExt.endsWith(ext)
          ));
      if (!isAllowedAudio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Неверный формат аудио",
          path: ["media_file"],
        });
      }
      if (data.media_file.size > maxAudioSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Размер аудио слишком большой (макс. ${maxAudioSize / 1024 / 1024}MB)`,
          path: ["media_file"],
        });
      }
    }

    if (data.type === "video") {
      if (!isAllowedVideoType(data.media_file.type, data.media_file.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Неверный формат видео",
          path: ["media_file"],
        });
      }
      if (data.media_file.size > maxVideoSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Размер видео слишком большой (макс. ${maxVideoSize / 1024 / 1024}MB)`,
          path: ["media_file"],
        });
      }
    }
  });

export type CongratulationFormData = z.infer<typeof congratulationSchema>;
