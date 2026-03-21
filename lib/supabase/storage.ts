import { supabaseAdmin } from "./server";

const BUCKETS = {
  audio: "congratulations-audio",
  video: "congratulations-video",
} as const;

export async function uploadFile(file: File, bucket: keyof typeof BUCKETS, path?: string) {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = path ? `${path}/${fileName}` : fileName;

  const { data, error } = await supabaseAdmin.storage.from(BUCKETS[bucket]).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
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
  const { error } = await supabaseAdmin.storage.from(BUCKETS[bucket]).remove([path]);

  if (error) {
    throw error;
  }
}
