import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { readFileSync, existsSync, unlinkSync, rmdirSync } from "fs";

// Define supported formats for backend validation
type SupportedFormat = "mp3" | "ogg" | "aac" | "wav";
const supportedFormats: SupportedFormat[] = ["mp3", "ogg", "aac", "wav"];

// Helper to get MIME type from format
function getMimeType(format: SupportedFormat): string {
  switch (format) {
    case "mp3":
      return "audio/mpeg";
    case "ogg":
      return "audio/ogg";
    case "aac":
      return "audio/aac";
    case "wav":
      return "audio/wav";
    default:
      throw new Error("Unsupported format");
  }
}

// Helper to get ffmpeg codec for format
function getCodec(format: SupportedFormat): string {
  switch (format) {
    case "mp3":
      return "libmp3lame";
    case "ogg":
      return "libvorbis";
    case "aac":
      return "aac";
    case "wav":
      return "pcm_s16le";
    default:
      throw new Error("Unsupported format");
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
    const audioFile = formData.get("audio") as File | null;
    const targetFormat = formData.get("format") as SupportedFormat | null;
    const bitrateStr = formData.get("bitrate") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { message: "No audio file provided." },
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
    const bitrate = bitrateStr ? parseInt(bitrateStr, 10) : 128;
    if (isNaN(bitrate) || bitrate < 32 || bitrate > 320) {
      return NextResponse.json(
        { message: "Bitrate must be a number between 32 and 320 kbps." },
        { status: 400 }
      );
    }

    // Create temp directories
    await mkdir(workDir, { recursive: true });

    // Save the uploaded file
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Get codec
    const codec = getCodec(targetFormat);

    // Compress the audio using ffmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i",
        inputPath,
        "-c:a",
        codec,
        "-b:a",
        `${bitrate}k`,
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
      audioFile.name.split(".").slice(0, -1).join(".") || "compressed";
    const safeOriginalName = originalName.replace(/[^a-z0-9_.-]/gi, "_");
    const outputFilename = `${safeOriginalName}.${targetFormat}`;

    // Read the compressed file
    const outputBuffer = readFileSync(outputPath);
    const mimeType = getMimeType(targetFormat);

    // Calculate compression ratio
    const compressionRatio = (buffer.length / outputBuffer.length).toFixed(2);
    console.log(`Compression ratio: ${compressionRatio}x`);

    // Return the compressed audio
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "X-Compression-Ratio": compressionRatio,
      },
    });
  } catch (error: any) {
    console.error("Audio compression failed:", error);
    return NextResponse.json(
      { message: "Audio compression failed: " + error.message },
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
