// src/app/api/clone/route.ts
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { load } from "cheerio";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { url } = (await request.json()) as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid `url` field" },
      { status: 400 }
    );
  }

  // 1) Fetch HTML
  let html: string;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    console.error("Failed to fetch page:", err);
    return NextResponse.json(
      { error: "Unable to fetch target page" },
      { status: 502 }
    );
  }

  // 2) Parse & collect resources
  const $ = load(html, { baseURI: url });
  const imgUrls = new Set<string>();
  const scriptUrls = new Set<string>();
  const styleUrls = new Set<string>();

  $("img[src]").each((_, el) => {
    const src = $(el).attr("src")!;
    imgUrls.add(new URL(src, url).href);
  });
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src")!;
    scriptUrls.add(new URL(src, url).href);
  });
  $("link[rel='stylesheet'][href]").each((_, el) => {
    const href = $(el).attr("href")!;
    styleUrls.add(new URL(href, url).href);
  });

  // 3) Rewrite HTML paths to local
  $("img[src]").each((_, el) => {
    const abs = new URL($(el).attr("src")!, url).href;
    const name = abs.split("/").pop()!;
    $(el).attr("src", `images/${name}`);
  });
  $("script[src]").each((_, el) => {
    const abs = new URL($(el).attr("src")!, url).href;
    const name = abs.split("/").pop()!;
    $(el).attr("src", `scripts/${name}`);
  });
  $("link[rel='stylesheet'][href]").each((_, el) => {
    const abs = new URL($(el).attr("href")!, url).href;
    const name = abs.split("/").pop()!;
    $(el).attr("href", `styles/${name}`);
  });

  const modifiedHtml = $.html();

  // 4) Zip it all up
  const zip = new JSZip();
  zip.file("index.html", modifiedHtml);

  const fetchAndAdd = async (href: string, folder: string) => {
    try {
      const resp = await fetch(href);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.arrayBuffer();
      const name = new URL(href).pathname.split("/").pop()!;
      zip.folder(folder)!.file(name, data);
    } catch (e) {
      console.warn(`Skipping resource ${href}:`, e);
    }
  };

  // add images, scripts, styles
  await Promise.all([
    ...Array.from(imgUrls).map((u) => fetchAndAdd(u, "images")),
    ...Array.from(scriptUrls).map((u) => fetchAndAdd(u, "scripts")),
    ...Array.from(styleUrls).map((u) => fetchAndAdd(u, "styles")),
  ]);

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="site-copy.zip"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
