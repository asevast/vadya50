import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";

const ROOT = process.env.PHOTO_ROOT || join(process.cwd(), "photo");

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
    const целевойПуть = join(/* turbopackIgnore: true */ ROOT, безопасныйПуть);

    if (!целевойПуть.startsWith(ROOT)) {
      return NextResponse.json({ error: "Неверный путь" }, { status: 400 });
    }

    const файл = await readFile(целевойПуть);
    const расширение = extname(целевойПуть).toLowerCase();
    let тип = MIME_BY_EXT[расширение] || "application/octet-stream";
    let outputBuffer: Buffer = файл;

    try {
      const url = new URL(_request.url);
      const widthParam = Number(url.searchParams.get("w") || "0");
      const qualityParam = Number(url.searchParams.get("q") || "75");
      const formatParam = (url.searchParams.get("format") || "").toLowerCase();

      if (widthParam > 0) {
        let pipeline = sharp(файл).resize({ width: widthParam, withoutEnlargement: true });

        if (formatParam === "jpeg" || formatParam === "jpg") {
          pipeline = pipeline.jpeg({ quality: qualityParam });
          тип = "image/jpeg";
        } else if (formatParam === "webp") {
          pipeline = pipeline.webp({ quality: qualityParam });
          тип = "image/webp";
        } else if (тип === "image/png") {
          pipeline = pipeline.png({ quality: qualityParam });
        } else {
          pipeline = pipeline.jpeg({ quality: qualityParam });
          тип = "image/jpeg";
        }

        outputBuffer = await pipeline.toBuffer();
      }
    } catch {
      // fallback to original file
      outputBuffer = файл;
    }

    return new NextResponse(outputBuffer, {
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
