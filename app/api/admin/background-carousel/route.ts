import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

type СлайдФона = {
  id: string;
  src: string;
  alt: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  scale: number;
  opacity: number;
  blur: number;
};

const PHOTO_ROOT = join(process.cwd(), "public", "photo");
const ДОПУСТИМЫЕ_РАСШИРЕНИЯ = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const ШАБЛОНЫ: Omit<СлайдФона, "id" | "src" | "alt">[] = [
  { x: 18, y: 22, width: 28, height: 38, rotate: -6, scale: 1, opacity: 0.7, blur: 0 },
  { x: 78, y: 26, width: 30, height: 40, rotate: 8, scale: 1, opacity: 0.75, blur: 0 },
  { x: 32, y: 68, width: 32, height: 44, rotate: 4, scale: 1, opacity: 0.65, blur: 1 },
  { x: 70, y: 72, width: 34, height: 46, rotate: -4, scale: 1, opacity: 0.7, blur: 1 },
  { x: 50, y: 40, width: 36, height: 48, rotate: 2, scale: 1.02, opacity: 0.6, blur: 2 },
  { x: 50, y: 80, width: 38, height: 50, rotate: -2, scale: 1.02, opacity: 0.55, blur: 2 },
];

export async function GET() {
  try {
    let overrides: Record<string, Partial<СлайдФона>> = {};
    try {
      const путь = join(process.cwd(), "data", "background-carousel.json");
      const сырой = await readFile(путь, "utf-8");
      const данные = JSON.parse(сырой) as { overrides?: Record<string, Partial<СлайдФона>> };
      overrides = данные?.overrides || {};
    } catch {
      overrides = {};
    }

    const файлы = await readdir(PHOTO_ROOT);
    const изображения = файлы
      .filter((имя) => {
        const lower = имя.toLowerCase();
        const точка = lower.lastIndexOf(".");
        if (точка === -1) return false;
        return ДОПУСТИМЫЕ_РАСШИРЕНИЯ.has(lower.slice(точка));
      })
      .sort((a, b) => a.localeCompare(b, "ru"));

    const slides: СлайдФона[] = изображения.map((имя, индекс) => {
      const шаблон = ШАБЛОНЫ[индекс % ШАБЛОНЫ.length];
      const override = overrides[имя] || {};
      return {
        id: `${индекс}-${имя}`,
        src: `/photo/${encodeURIComponent(имя)}`,
        alt: override.alt || "Фото",
        x: override.x ?? шаблон.x,
        y: override.y ?? шаблон.y,
        width: override.width ?? шаблон.width,
        height: override.height ?? шаблон.height,
        rotate: override.rotate ?? шаблон.rotate,
        scale: override.scale ?? шаблон.scale,
        opacity: override.opacity ?? шаблон.opacity,
        blur: override.blur ?? шаблон.blur,
      };
    });

    return NextResponse.json({ slides }, { status: 200 });
  } catch {
    return NextResponse.json({ slides: [] }, { status: 200 });
  }
}
