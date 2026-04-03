import { получитьSupabaseAdmin } from "./server";

export const BUCKETS = {
  audio: "congratulations-audio",
  video: "congratulations-video",
} as const;

const кэшMimeПроверок = new Map<string, { ok: boolean; message?: string }>();

const translitMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  А: "A",
  Б: "B",
  В: "V",
  Г: "G",
  Д: "D",
  Е: "E",
  Ё: "Yo",
  Ж: "Zh",
  З: "Z",
  И: "I",
  Й: "Y",
  К: "K",
  Л: "L",
  М: "M",
  Н: "N",
  О: "O",
  П: "P",
  Р: "R",
  С: "S",
  Т: "T",
  У: "U",
  Ф: "F",
  Х: "Kh",
  Ц: "Ts",
  Ч: "Ch",
  Ш: "Sh",
  Щ: "Shch",
  Ъ: "",
  Ы: "Y",
  Ь: "",
  Э: "E",
  Ю: "Yu",
  Я: "Ya",
};

function transliterate(str: string): string {
  return str
    .split("")
    .map((c) => translitMap[c] ?? c)
    .join("");
}

function sanitizeFileName(name: string): string {
  return transliterate(name)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

export async function uploadFile(file: File, bucket: keyof typeof BUCKETS, path?: string) {
  const safeName = sanitizeFileName(file.name);
  const fileName = `${Date.now()}_${safeName}`;
  const filePath = path ? `${path}/${fileName}` : fileName;
  const contentType = file.type || undefined;

  const supabaseAdmin = получитьSupabaseAdmin();
  const { data, error } = await supabaseAdmin.storage.from(BUCKETS[bucket]).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    path: filePath,
  };
}

export async function deleteFile(bucket: keyof typeof BUCKETS, path: string) {
  const supabaseAdmin = получитьSupabaseAdmin();
  const { error } = await supabaseAdmin.storage.from(BUCKETS[bucket]).remove([path]);

  if (error) {
    throw error;
  }
}

export async function проверитьMimeБакета(
  bucket: keyof typeof BUCKETS,
  mimeТипы: string[]
): Promise<{ ok: boolean; message?: string }> {
  for (const mime of mimeТипы) {
    const ключКэша = `${bucket}:${mime}`;
    const кэш = кэшMimeПроверок.get(ключКэша);
    if (кэш) {
      if (!кэш.ok) return кэш;
      continue;
    }

    const имяФайла = `mime-check-${Date.now()}.bin`;
    const путь = `mime-check/${имяФайла}`;
    const файл = new File([new Uint8Array([0])], имяФайла, { type: mime });

    const supabaseAdmin = получитьSupabaseAdmin();
    const { error } = await supabaseAdmin.storage.from(BUCKETS[bucket]).upload(путь, файл, {
      cacheControl: "0",
      upsert: true,
      contentType: mime,
    });

    if (error) {
      const сообщение = error.message || "mime type not supported";
      const результат = { ok: false, message: сообщение };
      кэшMimeПроверок.set(ключКэша, результат);
      return результат;
    }

    try {
      await deleteFile(bucket, путь);
    } catch {
      // не критично
    }

    кэшMimeПроверок.set(ключКэша, { ok: true });
  }

  return { ok: true };
}
