import { проверкаЛимита } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/server";
import { uploadFile } from "@/lib/supabase/storage";
import { sendTelegramNotification } from "@/lib/telegram";
import { congratulationSchema } from "@/lib/validations";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const лимит = await проверкаЛимита(`rate-limit:${ip}:congratulations`);
    const rateLimitHeaders = {
      "X-RateLimit-Limit": лимит.limit.toString(),
      "X-RateLimit-Remaining": лимит.remaining.toString(),
      "X-RateLimit-Reset": лимит.reset.toString(),
    };

    if (!лимит.success) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте позже." },
        { status: 429, headers: rateLimitHeaders }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, unknown> = {};
    let mediaFile: File | undefined;

    if (contentType.includes("application/json")) {
      data = (await request.json()) as Record<string, unknown>;
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      const rawMedia = formData.get("media_file");
      mediaFile = rawMedia instanceof File ? rawMedia : undefined;
    }

    const validatedData = congratulationSchema.parse({
      author_name: data.author_name,
      type: data.type,
      message: data.message || undefined,
      media_file: mediaFile,
    });

    // Generate slug
    let slug = nanoid(8);

    let media_url: string | null = null;
    let media_key: string | null = null;
    const duration_sec: number | null = null;
    const thumbnail_url: string | null = null;

    // Handle media upload
    if (validatedData.media_file) {
      const bucket = validatedData.type === "audio" ? "audio" : "video";
      try {
        const uploadResult = await uploadFile(validatedData.media_file, bucket);
        media_url = uploadResult.url;
        media_key = uploadResult.path;
      } catch (uploadError) {
        const message =
          uploadError instanceof Error ? uploadError.message : "Ошибка загрузки файла";
        console.error("Upload error:", uploadError);
        return NextResponse.json({ error: "Ошибка загрузки файла", debug: message }, { status: 500 });
      }

      // Get duration for audio/video (optional, would need to read file metadata)
      // For now, we'll skip duration extraction - would need ffprobe or similar
    }

    // Insert into database (retry on slug collision)
    let newCongratulation: { id: string; slug: string; created_at: string } | null = null;
    let insertError: { code?: string; message?: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data: insertData, error } = await supabaseAdmin
        .from("congratulations")
        .insert({
          slug,
          author_name: validatedData.author_name,
          type: validatedData.type,
          message: validatedData.message || null,
          media_url: media_url,
          media_key: media_key,
          duration_sec: duration_sec,
          thumbnail_url: thumbnail_url,
          is_approved: true,
          views_count: 0,
        })
        .select("id, slug, created_at")
        .single();

      if (!error && insertData) {
        newCongratulation = insertData;
        insertError = null;
        break;
      }

      insertError = error;
      if (error?.code === "23505") {
        slug = nanoid(8);
        continue;
      }
      break;
    }

    if (insertError || !newCongratulation) {
      console.error("Database insert error:", insertError);
      return NextResponse.json({ error: "Ошибка при сохранении поздравления" }, { status: 500 });
    }

    // Send Telegram notification (fire and forget)
    const telegramMessage = {
      type: validatedData.type,
      authorName: validatedData.author_name,
      message: validatedData.message,
      mediaUrl: media_url || undefined,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/congratulations/${slug}`,
    };
    sendTelegramNotification(telegramMessage).catch(console.error);

    return NextResponse.json(
      {
        id: newCongratulation.id,
        slug: newCongratulation.slug,
        share_url: `${process.env.NEXT_PUBLIC_APP_URL}/congratulations/${slug}`,
        created_at: newCongratulation.created_at,
      },
      { status: 201, headers: rateLimitHeaders }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error in POST /api/congratulations:", error.flatten());
      return NextResponse.json(
        { error: "Неверные данные", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error in POST /api/congratulations:", error);
    const debugMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Неверные данные или ошибка сервера",
        debug: process.env.NODE_ENV === "production" ? undefined : debugMessage,
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "0");
    const limit = Number.parseInt(searchParams.get("limit") || "12");
    const type = searchParams.get("type") as "text" | "audio" | "video" | null;

    let query = supabaseAdmin
      .from("congratulations")
      .select("*", { count: "exact" })
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (type) {
      query = query.eq("type", type);
    }

    const { data: congratulations, count, error } = await query;

    if (error) {
      console.error("Database fetch error:", error);
      return NextResponse.json({ error: "Ошибка при получении поздравлений" }, { status: 500 });
    }

    return NextResponse.json(
      {
        congratulations,
        count,
        page,
        limit,
        hasMore: (page + 1) * limit < (count || 0),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/congratulations:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
