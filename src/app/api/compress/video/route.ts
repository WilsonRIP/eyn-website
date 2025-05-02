import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { readFileSync, existsSync, unlinkSync, rmdirSync } from "fs";

// Define supported formats for backend validation
type SupportedFormat = "mp4" | "webm" | "mov";
const supportedFormats: SupportedFormat[] = ["mp4", "webm", "mov"];

// Helper to get MIME type from format
function getMimeType(format: SupportedFormat): string {
  switch (format) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    default:
      throw new Error("Unsupported format");
  }
}

// Helper to get ffmpeg parameters for resolution
function getResolutionParams(resolution: string): string {
  switch (resolution) {
    case "480p":
      return "scale=-1:480";
    case "720p":
      return "scale=-1:720";
    case "1080p":
      return "scale=-1:1080";
    default:
      return "scale=-1:720"; // Default to 720p
  }
}

export const maxDuration = 60; // 1 minute in seconds (Vercel Hobby plan limit)

export async function POST(request: Request) {
  // Create a unique working directory for this request
  const workDir = join(process.cwd(), "tmp", randomUUID());
  const inputPath = join(workDir, "input");
  const outputPath = join(workDir, "output");

  try {
    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const targetFormat = formData.get("format") as SupportedFormat | null;
    const bitrateStr = formData.get("bitrate") as string | null;
    const resolution = (formData.get("resolution") as string) || "720p";

    if (!videoFile) {
      return NextResponse.json(
        { message: "No video file provided." },
        { status: 400 }
      );
    }

    if (!targetFormat || !supportedFormats.includes(targetFormat)) {
      return NextResponse.json(
        { message: "Invalid or unsupported target format." },
        { status: 400 }
      );
    }

    // Parse bitrate value
    const bitrate = bitrateStr ? parseInt(bitrateStr, 10) : 1000;
    if (isNaN(bitrate) || bitrate < 100 || bitrate > 10000) {
      return NextResponse.json(
        { message: "Bitrate must be a number between 100 and 10000 kbps." },
        { status: 400 }
      );
    }

    // Create temp directories
    await mkdir(workDir, { recursive: true });

    // Save the uploaded file
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Get resolution parameter
    const resolutionParam = getResolutionParams(resolution);

    // Compress the video using ffmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        inputPath,
        "-c:v",
        "libx264",
        "-b:v",
        `${bitrate}k`,
        "-vf",
        resolutionParam,
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        "-y", // Overwrite output file
        outputPath,
      ]);

      let errorOutput = "";
      ffmpeg.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.error("FFMPEG error output:", errorOutput);
          reject(new Error(`FFMPEG process exited with code ${code}`));
        }
      });
    });

    // Generate a safe filename
    const originalName =
      videoFile.name.split(".").slice(0, -1).join(".") || "compressed";
    const safeOriginalName = originalName.replace(/[^a-z0-9_.-]/gi, "_");
    const outputFilename = `${safeOriginalName}.${targetFormat}`;

    // Read the compressed file
    const outputBuffer = readFileSync(outputPath);
    const mimeType = getMimeType(targetFormat);

    // Calculate compression ratio
    const compressionRatio = (buffer.length / outputBuffer.length).toFixed(2);
    console.log(`Compression ratio: ${compressionRatio}x`);

    // Return the compressed video
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "X-Compression-Ratio": compressionRatio,
      },
    });
  } catch (error: any) {
    console.error("Video compression failed:", error);
    return NextResponse.json(
      { message: "Video compression failed: " + error.message },
      { status: 500 }
    );
  } finally {
    // Clean up temporary files
    try {
      if (existsSync(inputPath)) unlinkSync(inputPath);
      if (existsSync(outputPath)) unlinkSync(outputPath);
      if (existsSync(workDir)) rmdirSync(workDir);
    } catch (e) {
      console.error("Error cleaning up temporary files:", e);
    }
  }
}
