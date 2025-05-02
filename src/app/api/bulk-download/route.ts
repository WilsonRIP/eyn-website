// src/app/api/bulk-download/route.ts
import { NextResponse } from "next/server";
import JSZip from "jszip";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  // 1) Parse & validate JSON body
  const body: { mediaUrls?: unknown } = await request.json().catch(() => ({}));
  if (!Array.isArray(body.mediaUrls)) {
    return NextResponse.json(
      { error: "`mediaUrls` array of URLs is required." },
      { status: 400 }
    );
  }

  // 2) Sanitize and canonicalize URLs
  const urls: string[] = (body.mediaUrls as unknown[])
    .filter((u: unknown): u is string => typeof u === "string")
    .map((u: string) => {
      try {
        return new URL(u).href;
      } catch {
        return "";
      }
    })
    .filter((u: string) => u !== "");

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "No valid URLs provided in `mediaUrls`." },
      { status: 400 }
    );
  }

  // 3) Fetch each URL and add to ZIP
  const zip = new JSZip();
  await Promise.all(
    urls.map(async (mediaUrl: string, idx: number): Promise<void> => {
      try {
        const res = await fetch(mediaUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.arrayBuffer();

        // Derive a safe filename
        const pathname = new URL(mediaUrl).pathname;
        let filename = pathname.split("/").pop() || `file${idx}`;
        if (!filename.includes(".")) {
          const ct = res.headers.get("Content-Type") || "";
          const match = ct.match(/\/([a-z0-9]+)/i);
          const ext = match ? match[1].replace("jpeg", "jpg") : "";
          if (ext) filename += `.${ext}`;
        }

        zip.file(filename, data);
      } catch (err: unknown) {
        console.warn(`Skipping ${mediaUrl}:`, err);
      }
    })
  );

  // 4) Generate the ZIP buffer
  const zipContent: Buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  // 5) Return it as a downloadable ZIP
  return new NextResponse(zipContent, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="bulk-media.zip"`,
      "Content-Length": zipContent.length.toString(),
    },
  });
}
