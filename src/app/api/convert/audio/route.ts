// src/app/api/convert/audio/route.ts
import { NextResponse } from "next/server";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";

export const runtime = "nodejs";

// On Windows, serve your public/ffmpeg.exe; otherwise call system ffmpeg
const ffmpegPath =
  process.platform === "win32"
    ? join(process.cwd(), "public", "ffmpeg.exe")
    : "ffmpeg";

// Map each audio format to its ffmpeg args
const codecMap: Record<string, string[]> = {
  mp3: ["-c:a", "libmp3lame", "-b:a", "192k"],
  wav: ["-c:a", "pcm_s16le"],
  ogg: ["-c:a", "libvorbis", "-qscale:a", "5"],
  flac: ["-c:a", "flac"],
  aac: ["-c:a", "aac", "-b:a", "192k"],
  m4a: ["-c:a", "aac", "-b:a", "192k"],
};

// MIME types for the response
const mimeMap: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
};

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as Blob | null;
  const target = form.get("format") as string | null;

  if (!file || !target || !(target in codecMap)) {
    return NextResponse.json(
      { error: "Missing or invalid file/format" },
      { status: 400 }
    );
  }

  // Create temp paths
  const inPath = join(tmpdir(), `in-${Date.now()}`);
  const outPath = join(tmpdir(), `out-${Date.now()}.${target}`);

  // Write the uploaded file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(inPath, buffer);

  // Build ffmpeg arguments
  const args = ["-y", "-i", inPath, ...codecMap[target], outPath];

  try {
    // Run ffmpeg
    await new Promise<void>((resolve, reject) => {
      const ff = spawn(ffmpegPath, args);
      ff.on("exit", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`ffmpeg exited with code ${code}`))
      );
      ff.on("error", (err) => reject(err));
    });

    // Read the converted file
    const data = await readFile(outPath);

    // Cleanup temp files
    await unlink(inPath).catch(() => {});
    await unlink(outPath).catch(() => {});

    // Send back the result
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[target],
        "Content-Disposition": `attachment; filename="converted.${target}"`,
      },
    });
  } catch (err) {
    console.error("Audio conversion error:", err);
    await unlink(inPath).catch(() => {});
    await unlink(outPath).catch(() => {});
    return NextResponse.json(
      { error: "Audio conversion failed" },
      { status: 500 }
    );
  }
}


