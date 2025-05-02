import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  unlinkSync,
  rmdirSync,
  readdirSync,
} from "fs";
// Note: You'll need to install the archiver package: npm install archiver
// @ts-ignore
import archiver from "archiver";

// Define supported formats for backend validation
type SupportedFormat = "zip" | "tar" | "gz";
const supportedFormats: SupportedFormat[] = ["zip", "tar", "gz"];

// Define file path interface
interface FilePath {
  path: string;
  name: string;
}

// Helper to get MIME type from format
function getMimeType(format: SupportedFormat): string {
  switch (format) {
    case "zip":
      return "application/zip";
    case "tar":
      return "application/x-tar";
    case "gz":
      return "application/gzip";
    default:
      throw new Error("Unsupported format");
  }
}

export const maxDuration = 60; // 1 minute in seconds (Vercel Hobby plan limit)

export async function POST(request: Request) {
  // Create a unique working directory for this request
  const workDir = join(process.cwd(), "tmp", randomUUID());
  const filesDir = join(workDir, "files");
  const outputPath = join(workDir, "compressed");

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const targetFormat = formData.get("format") as SupportedFormat | null;
    const levelStr = formData.get("level") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files provided." },
        { status: 400 }
      );
    }

    if (!targetFormat || !supportedFormats.includes(targetFormat)) {
      return NextResponse.json(
        { message: "Invalid or unsupported target format." },
        { status: 400 }
      );
    }

    // Parse compression level (1-9)
    const level = levelStr ? parseInt(levelStr, 10) : 6;
    if (isNaN(level) || level < 1 || level > 9) {
      return NextResponse.json(
        { message: "Compression level must be a number between 1 and 9." },
        { status: 400 }
      );
    }

    // Create temp directories
    await mkdir(filesDir, { recursive: true });

    // Save all uploaded files
    const filePaths: FilePath[] = [];
    let totalInputSize = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      totalInputSize += buffer.length;

      // Create a safe filename
      const safeFilename = file.name.replace(/[^a-z0-9_.-]/gi, "_");
      const filePath = join(filesDir, safeFilename);

      await writeFile(filePath, buffer);
      filePaths.push({ path: filePath, name: safeFilename });
    }

    // Create appropriate archive format
    const archive = archiver(targetFormat === "gz" ? "tar" : targetFormat, {
      zlib: { level }, // Compression level
    });

    const output = createWriteStream(outputPath);

    // Create archive
    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
      archive.on("error", reject);

      archive.pipe(output);

      // Add all files to the archive
      for (const file of filePaths) {
        archive.file(file.path, { name: file.name });
      }

      archive.finalize();
    });

    // Wait for archive to finish
    await archivePromise;

    // Determine output filename extension
    const fileExtension = targetFormat === "gz" ? "tar.gz" : targetFormat;

    // Create output filename
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    const outputFilename = `compressed_${timestamp}.${fileExtension}`;

    // Get archive size for compression ratio calculation
    const stats = createReadStream(outputPath);
    const chunks: Buffer[] = [];

    for await (const chunk of stats) {
      chunks.push(chunk as Buffer);
    }

    const outputBuffer = Buffer.concat(chunks);
    const compressionRatio = (totalInputSize / outputBuffer.length).toFixed(2);
    console.log(`Compression ratio: ${compressionRatio}x`);

    // Return the compressed archive
    const mimeType = getMimeType(targetFormat);

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "X-Compression-Ratio": compressionRatio,
      },
    });
  } catch (error: any) {
    console.error("File compression failed:", error);
    return NextResponse.json(
      { message: "File compression failed: " + error.message },
      { status: 500 }
    );
  } finally {
    // Clean up temporary files
    try {
      if (existsSync(filesDir)) {
        const dirFiles = readdirSync(filesDir);
        for (const file of dirFiles) {
          unlinkSync(join(filesDir, file));
        }
        rmdirSync(filesDir);
      }
      if (existsSync(outputPath)) unlinkSync(outputPath);
      if (existsSync(workDir)) rmdirSync(workDir);
    } catch (e) {
      console.error("Error cleaning up temporary files:", e);
    }
  }
}
