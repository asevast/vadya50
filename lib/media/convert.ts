import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

type ConvertResult = {
  file: File;
  converted: boolean;
};

const runFfmpeg = async (args: string[]) => {
  if (!ffmpegPath) {
    throw new Error("ffmpeg binary not found");
  }

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(ffmpegPath as string, args, { stdio: "ignore" });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
};

const writeTempFile = async (buffer: Buffer, suffix: string) => {
  const filePath = join(tmpdir(), `media-${Date.now()}-${Math.random()}${suffix}`);
  await fs.writeFile(filePath, buffer);
  return filePath;
};

const readTempFile = async (filePath: string) => {
  const buffer = await fs.readFile(filePath);
  await fs.unlink(filePath).catch(() => undefined);
  return buffer;
};

const isWebm = (file: File) =>
  file.type.includes("webm") || file.name.toLowerCase().endsWith(".webm");

export const convertMediaIfNeeded = async (
  inputFile: File,
  kind: "audio" | "video"
): Promise<ConvertResult> => {
  if (!isWebm(inputFile)) {
    return { file: inputFile, converted: false };
  }

  const buffer = Buffer.from(await inputFile.arrayBuffer());
  const inputPath = await writeTempFile(buffer, ".webm");

  if (kind === "audio") {
    const outputPath = join(tmpdir(), `audio-${Date.now()}-${Math.random()}.m4a`);
    await runFfmpeg(["-y", "-i", inputPath, "-vn", "-c:a", "aac", "-b:a", "128k", outputPath]);
    const outputBuffer = await readTempFile(outputPath);
    const outputFile = new File([outputBuffer], "audio.m4a", { type: "audio/m4a" });
    await fs.unlink(inputPath).catch(() => undefined);
    return { file: outputFile, converted: true };
  }

  const outputPath = join(tmpdir(), `video-${Date.now()}-${Math.random()}.mp4`);
  await runFfmpeg([
    "-y",
    "-i",
    inputPath,
    "-c:v",
    "libx264",
    "-profile:v",
    "baseline",
    "-level",
    "3.0",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
  const outputBuffer = await readTempFile(outputPath);
  const outputFile = new File([outputBuffer], "video.mp4", { type: "video/mp4" });
  await fs.unlink(inputPath).catch(() => undefined);
  return { file: outputFile, converted: true };
};
