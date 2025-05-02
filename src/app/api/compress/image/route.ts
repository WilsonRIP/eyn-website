import { NextResponse } from "next/server";
import sharp from "sharp";

// Define supported formats for backend validation
type SupportedFormat = "png" | "jpg" | "webp" | "avif";
const supportedFormats: SupportedFormat[] = ["png", "jpg", "webp", "avif"];

// Helper to get MIME type from format
function getMimeType(format: SupportedFormat): string {
  switch (format) {
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    default:
      throw new Error("Unsupported format");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const targetFormat = formData.get("format") as SupportedFormat | null;
    const qualityStr = formData.get("quality") as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { message: "No image file provided." },
        { status: 400 }
      );
    }

    if (!targetFormat || !supportedFormats.includes(targetFormat)) {
      return NextResponse.json(
        { message: "Invalid or unsupported target format." },
        { status: 400 }
      );
    }

    // Parse quality value (1-100)
    const quality = qualityStr ? parseInt(qualityStr, 10) : 80;
    if (isNaN(quality) || quality < 1 || quality > 100) {
      return NextResponse.json(
        { message: "Quality must be a number between 1 and 100." },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await imageFile.arrayBuffer());

    let converter = sharp(inputBuffer);

    // Apply format and quality settings
    switch (targetFormat) {
      case "png":
        converter = converter.png({
          quality,
          compressionLevel: Math.floor((100 - quality) / 10), // 0-9 range
        });
        break;
      case "jpg":
        converter = converter.jpeg({ quality });
        break;
      case "webp":
        converter = converter.webp({ quality });
        break;
      case "avif":
        converter = converter.avif({ quality });
        break;
    }

    const outputBuffer = await converter.toBuffer();
    const mimeType = getMimeType(targetFormat);

    // Calculate compression ratio
    const compressionRatio = (inputBuffer.length / outputBuffer.length).toFixed(
      2
    );
    console.log(`Compression ratio: ${compressionRatio}x`);

    // Generate a safe filename
    const originalName =
      imageFile.name.split(".").slice(0, -1).join(".") || "compressed";
    const safeOriginalName = originalName.replace(/[^a-z0-9_.-]/gi, "_");
    const outputFilename = `${safeOriginalName}.${targetFormat}`;

    // Return the compressed image
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
        "X-Compression-Ratio": compressionRatio,
      },
    });
  } catch (error: any) {
    console.error("Image compression failed:", error);

    let message = "Image compression failed.";
    if (
      error.message?.includes("Input buffer contains unsupported image format")
    ) {
      message = "Unsupported input image format.";
    }

    return NextResponse.json({ message }, { status: 500 });
  }
}
