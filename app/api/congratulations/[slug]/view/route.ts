import { получитьSupabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabaseAdmin = получитьSupabaseAdmin();
    const { slug } = await params;

    const { data: congratulation, error } = await supabaseAdmin
      .from("congratulations")
      .select("id, views_count")
      .eq("slug", slug)
      .eq("is_approved", true)
      .single();

    if (error || !congratulation) {
      return NextResponse.json({ error: "Поздравление не найдено" }, { status: 404 });
    }

    const обновление = {
      views_count: (congratulation.views_count ?? 0) + 1,
    };

    await supabaseAdmin.from("congratulations").update(обновление).eq("id", congratulation.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
