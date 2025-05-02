// src/app/api/download/route.ts

import { NextRequest, NextResponse } from "next/server";
// @ts-ignore: no type declarations for yt-dlp-wrap
import YtDlpWrap from "yt-dlp-wrap";
import { getYtDlpPath } from "../../lib/yt-dlp";

let ytDlp: YtDlpWrap | null = null;
try {
  // Initialize with the correct path based on OS
  const ytDlpPath = getYtDlpPath();
  console.log("[api/download] Resolved ytDlpPath:", ytDlpPath);

  // Set environment variables to make yt-dlp not rely on Python
  process.env.NO_PYTHON = "1";
  process.env.YT_DLP_NO_PYTHON = "1";

  ytDlp = new YtDlpWrap(ytDlpPath);
  console.log("[api/download] yt-dlp-wrap initialized successfully.");
} catch (initErr: unknown) {
  console.error("[api/download] Failed to initialize yt-dlp-wrap:", initErr);
}

export async function POST(request: NextRequest) {
  if (!ytDlp) {
    return NextResponse.json(
      { error: "yt-dlp backend not initialized" },
      { status: 500 }
    );
  }

  interface Body {
    url?: string;
  }
  const { url } = (await request.json()) as Body;
  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Video URL is required" },
      { status: 400 }
    );
  }

  try {
    // 1) Run yt-dlp with --dump-json to get metadata
    const videoInfo: any = await new Promise<any>((resolve, reject) => {
      let stdout = "";
      let stderr = "";

      const emitter = ytDlp!.exec([
        url,
        "--dump-json",
        // add any other flags you need here
      ]);

      // The child process lives on emitter.ytDlpProcess
      const proc = emitter.ytDlpProcess;
      if (!proc || !proc.stdout || !proc.stderr) {
        return reject(new Error("Unable to access yt-dlp process streams"));
      }

      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf-8");
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf-8");
      });

      emitter.on("error", (err: Error) => {
        console.error("yt-dlp-wrap error event:", err);
        reject(err);
      });

      emitter.on("close", (code: number | null) => {
        if (code !== 0) {
          return reject(
            new Error(`yt-dlp exited with ${code}: ${stderr.trim()}`)
          );
        }
        if (!stdout) {
          return reject(new Error(`No JSON output: ${stderr.trim()}`));
        }
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (parseErr: unknown) {
          console.error("Failed parsing yt-dlp JSON:", parseErr, stdout);
          reject(new Error("Invalid JSON from yt-dlp"));
        }
      });
    });

    // 2) Pick a format
    const formats: any[] = Array.isArray(videoInfo.formats)
      ? videoInfo.formats
      : [];
    let best = formats.find((f) => f.format_id === "18" && f.url) || null;
    if (!best) {
      best = formats.find((f) => f.url) || null;
    }
    if (!best || !best.url) {
      console.error("No suitable format in:", videoInfo);
      throw new Error("No downloadable format found");
    }

    // 3) Build response
    const downloadUrl: string = best.url;
    const title: string = videoInfo.title ?? "video";
    const ext: string = best.ext ?? "mp4";
    const safeTitle = title.replace(/[/\\?%*:|"<>]/g, "-");
    const filename = `${safeTitle}.${ext}`;

    return NextResponse.json({ downloadUrl, filename });
  } catch (err: unknown) {
    console.error("Error in /api/download:", err);
    const message =
      err instanceof Error ? err.message : String(err) || "Unknown error";
    return NextResponse.json(
      { error: "yt-dlp download failed", details: message },
      { status: 500 }
    );
  }
}
