import { NextResponse } from "next/server";
import sharp from "sharp";

// Define supported formats for backend validation
type SupportedFormat = "png" | "jpg" | "webp" | "gif";
const supportedFormats: SupportedFormat[] = ["png", "jpg", "webp", "gif"];

// Helper to get MIME type from format
function getMimeType(format: SupportedFormat): string {
  switch (format) {
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      throw new Error("Unsupported format"); // Should be caught by validation
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const targetFormat = formData.get("format") as SupportedFormat | null;

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

    const inputBuffer = Buffer.from(await imageFile.arrayBuffer());

    let converter = sharp(inputBuffer);

    // Apply format conversion
    switch (targetFormat) {
      case "png":
        converter = converter.png();
        break;
      case "jpg":
        converter = converter.jpeg(); // sharp uses .jpeg()
        break;
      case "webp":
        converter = converter.webp();
        break;
      case "gif":
        converter = converter.gif();
        break;
      // No default needed due to earlier validation
    }

    const outputBuffer = await converter.toBuffer();
    const mimeType = getMimeType(targetFormat);

    // Generate a safe filename
    const originalName =
      imageFile.name.split(".").slice(0, -1).join(".") || "converted";
    const safeOriginalName = originalName.replace(/[^a-z0-9_.-]/gi, "_"); // Sanitize
    const outputFilename = `${safeOriginalName}.${targetFormat}`;

    // Return the converted image
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${outputFilename}"`,
      },
    });
  } catch (error: any) {
    console.error("Image conversion failed:", error);
    // Provide a more specific error message if possible
    let message = "Internal Server Error during conversion.";
    if (
      error.message?.includes("Input buffer contains unsupported image format")
    ) {
      message = "Unsupported input image format.";
    }
    return NextResponse.json({ message: message }, { status: 500 });
  }
}
