import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  try {
    const путь = join(process.cwd(), "data", "background-carousel.json");
    const сырой = await readFile(путь, "utf-8");
    const данные = JSON.parse(сырой) as { slides: unknown };
    return NextResponse.json(данные, { status: 200 });
  } catch {
    return NextResponse.json({ slides: [] }, { status: 200 });
  }
}
