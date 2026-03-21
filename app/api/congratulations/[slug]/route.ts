import { supabaseAdmin } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { data: congratulation, error } = await supabaseAdmin
      .from("congratulations")
      .select("*")
      .eq("slug", slug)
      .eq("is_approved", true)
      .single();

    if (error || !congratulation) {
      return NextResponse.json({ error: "Поздравление не найдено" }, { status: 404 });
    }

    return NextResponse.json({ congratulation }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/congratulations/[slug]:", error);
    return NextResponse.json({ error: "Ошибка при получении поздравления" }, { status: 500 });
  }
}
