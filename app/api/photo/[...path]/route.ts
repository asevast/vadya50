import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { NextResponse } from "next/server";

const ROOT = process.env.PHOTO_ROOT || "C:\\vadya\\photo";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const безопасныйПуть = normalize(path.join("/")).replace(/^(\.\.(\/|\\|$))+/, "");
    const целевойПуть = join(ROOT, безопасныйПуть);

    if (!целевойПуть.startsWith(ROOT)) {
      return NextResponse.json({ error: "Неверный путь" }, { status: 400 });
    }

    const файл = await readFile(целевойПуть);
    const расширение = extname(целевойПуть).toLowerCase();
    const тип = MIME_BY_EXT[расширение] || "application/octet-stream";

    return new NextResponse(файл, {
      status: 200,
      headers: {
        "Content-Type": тип,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }
}
