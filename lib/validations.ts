import { z } from "zod";

// Media constraints
const maxAudioSize = 50 * 1024 * 1024; // 50MB
const maxVideoSize = 200 * 1024 * 1024; // 200MB
const maxMessageLength = 2000;
const maxNameLength = 100;
const allowedAudioTypes = ["audio/webm", "audio/mp3", "audio/ogg", "audio/mpeg"];
const allowedVideoTypes = ["video/webm", "video/mp4"];

export const congratulationSchema = z
  .object({
    author_name: z
      .string()
      .min(1, "Имя обязательно")
      .max(maxNameLength, `Имя не должно превышать ${maxNameLength} символов`)
      .regex(
        /^[a-zA-Zа-яА-Я\s'-]+$/,
        "Имя может содержать только буквы, пробелы, дефисы и апострофы"
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
      if (!allowedAudioTypes.includes(data.media_file.type)) {
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
      if (!allowedVideoTypes.includes(data.media_file.type)) {
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
