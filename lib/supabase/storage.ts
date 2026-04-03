import { получитьSupabaseAdmin } from "./server";

const BUCKETS = {
  audio: "congratulations-audio",
  video: "congratulations-video",
} as const;

const кэшMimeПроверок = new Map<string, { ok: boolean; message?: string }>();

function sanitizeFileName(name: string): string {
  return name
    .replace(/[()]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, "");
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
