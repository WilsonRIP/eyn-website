// src/app/api/download/batch-image/route.ts
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const FALLBACK_URL = (name: string, idx: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(name)}-${idx}/400/600`;

async function scrapeBing(query: string): Promise<string> {
  const url =
    `https://www.bing.com/images/search?q=${encodeURIComponent(query)}` +
    `&form=HDRSC2&first=1&tsc=ImageBasicHover`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/113.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Bing fetch failed: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Bing uses <a class="iusc" m='{"murl":"...","turl":"..."}'>
  const first = $("a.iusc").first().attr("m");
  if (!first) {
    throw new Error("No Bing image element");
  }

  let meta: any;
  try {
    meta = JSON.parse(first);
  } catch {
    throw new Error("Invalid Bing metadata");
  }

  if (typeof meta.murl === "string") {
    return meta.murl;
  }

  throw new Error("No murl in Bing metadata");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const names = body.names;
    if (
      !Array.isArray(names) ||
      names.length === 0 ||
      names.some((n) => typeof n !== "string")
    ) {
      return NextResponse.json(
        { error: "Invalid input: names must be a non-empty array of strings." },
        { status: 400 }
      );
    }

    const images = await Promise.all(
      names.map(async (name, idx) => {
        try {
          const url = await scrapeBing(name);
          return { name, url };
        } catch (err) {
          console.warn(`Bing scrape failed for "${name}":`, err);
          return { name, url: FALLBACK_URL(name, idx) };
        }
      })
    );

    return NextResponse.json({ images });
  } catch (err) {
    console.error("Batch Image Scrape Error:", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON format in request body." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
