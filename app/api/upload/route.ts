import { uploadFile } from "@/lib/supabase/storage";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "audio" | "video";

    if (!file || !type) {
      return NextResponse.json({ error: "Файл и тип обязательны" }, { status: 400 });
    }

    if (type !== "audio" && type !== "video") {
      return NextResponse.json({ error: "Неверный тип файла" }, { status: 400 });
    }

    const allowedAudioTypes = ["audio/webm", "audio/mp3", "audio/ogg", "audio/mpeg"];
    const allowedVideoTypes = ["video/webm", "video/mp4"];
    const maxAudioSize = 50 * 1024 * 1024;
    const maxVideoSize = 200 * 1024 * 1024;

    if (type === "audio") {
      if (!allowedAudioTypes.includes(file.type)) {
        return NextResponse.json({ error: "Неверный формат аудио" }, { status: 400 });
      }
      if (file.size > maxAudioSize) {
        return NextResponse.json({ error: "Аудио слишком большое" }, { status: 400 });
      }
    }

    if (type === "video") {
      if (!allowedVideoTypes.includes(file.type)) {
        return NextResponse.json({ error: "Неверный формат видео" }, { status: 400 });
      }
      if (file.size > maxVideoSize) {
        return NextResponse.json({ error: "Видео слишком большое" }, { status: 400 });
      }
    }

    const uploadResult = await uploadFile(file, type);

    return NextResponse.json(
      {
        url: uploadResult.url,
        key: uploadResult.path,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/upload:", error);
    return NextResponse.json({ error: "Ошибка при загрузке файла" }, { status: 500 });
  }
}
