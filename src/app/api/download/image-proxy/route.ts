// src/app/api/download/image-proxy/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge"; // Use Edge runtime for efficient binary streaming

// Maximum image size we’ll proxy: 10 MB
const MAX_SIZE = 10 * 1024 * 1024;

// Only allow images from these domains (and their subdomains)
const ALLOWED_DOMAINS = [
  "picsum.photos",
  "unsplash.com",
  "pixabay.com",
  "img.youtube.com",
  "ytimg.com",
  "bing.com",
  "bing.net",
  "live.com",
  "microsoftonline.com",
  "microsoft.com",
  "msn.com",
  "mm.bing.net",
  "th.bing.com",
  "wikimedia.org",
  "wikipedia.org",
  "googleapis.com",
];

/** Ensure the URL is on our allowlist */
function isValidImageUrl(u: string): boolean {
  try {
    const host = new URL(u).hostname.toLowerCase();
    return ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/** Extract file extension from a content-type header */
function extractExt(contentType: string) {
  const m = contentType.match(/image\/([a-z0-9+]+)/i);
  return m ? `.${m[1].replace("jpeg", "jpg")}` : "";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return NextResponse.json(
      { error: "Missing `url` parameter" },
      { status: 400 }
    );
  }
  if (!isValidImageUrl(target)) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  let upstream: Response;
  try {
    // Abort if it takes longer than 5 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    upstream = await fetch(target, {
      signal: controller.signal,
      headers: {
        // pretend to be a real browser
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/116.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);
  } catch (err: any) {
    console.error("Proxy fetch error:", err);
    const msg = err.name === "AbortError" ? "Fetch timed out" : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream returned ${upstream.status}` },
      { status: upstream.status }
    );
  }

  const contentType = upstream.headers.get("Content-Type") || "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Not an image" }, { status: 415 });
  }

  const buffer = await upstream.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  // Build a safe filename if the client asked for one
  const filenameParam = searchParams.get("filename");
  const ext = extractExt(contentType);
  const filename = filenameParam
    ? filenameParam.replace(/[^a-zA-Z0-9_.-]/g, "_")
    : `image${ext}`;

  const forceDownload = searchParams.get("download") === "true";

  const headers: HeadersInit = {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=86400", // 1 day
  };

  if (forceDownload) {
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  return new NextResponse(buffer, { headers });
}
