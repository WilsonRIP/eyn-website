// src/app/api/convert/video/route.ts
import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";

// If on Windows, serve the bundled exe from /public; otherwise rely on `ffmpeg` in PATH
const ffmpegPath =
  process.platform === "win32"
    ? join(process.cwd(), "public", "ffmpeg.exe")
    : "ffmpeg";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as Blob | null;
  const target = form.get("format") as string | null;

  if (!file || typeof target !== "string") {
    return NextResponse.json(
      { error: "Missing file or format" },
      { status: 400 }
    );
  }

  // write temp input & output paths
  const inPath = join(tmpdir(), `in-${Date.now()}`);
  const outPath = join(tmpdir(), `out-${Date.now()}.${target}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(inPath, buffer);

  // spawn native ffmpeg
  const args = [
    "-y",
    "-i",
    inPath,
    // you can use hardware accel: e.g. "-hwaccel", "auto", or "-c:v", "h264_nvenc"
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "26",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    outPath,
  ];

  await new Promise<void>((resolve, reject) => {
    const ff = spawn(ffmpegPath, args, { stdio: "inherit" });
    ff.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))
    );
    ff.on("error", (err) => reject(err));
  });

  // read result, cleanup, and respond
  const data = await readFile(outPath);
  await unlink(inPath).catch(() => {});
  await unlink(outPath).catch(() => {});

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": `video/${target}`,
      "Content-Disposition": `attachment; filename="converted.${target}"`,
    },
  });
}
