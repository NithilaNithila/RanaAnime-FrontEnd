import { NextResponse } from "next/server";
import { fetchAllFeeds } from "./utils";

const IMG_PROXY = "/api/img?url=";

const SOURCE_COLORS = {
  "Anime News Network": ["#0ea5e9", "#0284c7"],
  Crunchyroll: ["#f97316", "#ea580c"],
  "Anime Corner": ["#a855f7", "#9333ea"],
  "Anime Herald": ["#10b981", "#059669"],
};

function svgFallback(source) {
  const colors = SOURCE_COLORS[source] || ["#0ea5e9", "#0284c7"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]}"/>
      <stop offset="100%" style="stop-color:${colors[1]}"/>
    </linearGradient></defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <text x="400" y="225" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.15)" font-size="80" font-family="Arial,sans-serif" font-weight="bold">NEWS</text>
    <text x="400" y="260" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="20" font-family="Arial,sans-serif" font-weight="bold">${source || "News"}</text>
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

async function fetchWithTimeout(url, signal) {
  const res = await fetch(url, {
    signal,
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  return await res.text();
}

async function extractOgImage(url, signal) {
  try {
    const html = await fetchWithTimeout(url, signal);
    if (!html) return null;

    let ogImage = extractMeta(html, "og:image");

    if (!ogImage || ogImage.includes("googleusercontent.com")) {
      const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
      if (canonical) {
        const realHtml = await fetchWithTimeout(canonical[1], signal);
        if (realHtml) {
          const realOg = extractMeta(realHtml, "og:image");
          if (realOg) ogImage = realOg;
        }
      }
    }

    if (!ogImage) {
      const twitterImage = extractMeta(html, "twitter:image");
      if (twitterImage) ogImage = twitterImage;
    }

    if (ogImage && ogImage.startsWith("/")) {
      try {
        const base = new URL(url);
        ogImage = `${base.protocol}//${base.host}${ogImage}`;
      } catch {}
    }

    return ogImage;
  } catch {
    return null;
  }
}

async function enrichImages(articles, limit = 20) {
  const toEnrich = articles.filter((a) => !a.image && a.link).slice(0, limit);
  if (toEnrich.length === 0) return articles;

  const results = await Promise.allSettled(
    toEnrich.map((article) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const url = article.originalSource || article.link;
      return extractOgImage(url, controller.signal).finally(() => clearTimeout(timer));
    })
  );

  const imageMap = {};
  toEnrich.forEach((article, i) => {
    if (results[i].status === "fulfilled" && results[i].value) {
      imageMap[article.slug] = results[i].value;
    }
  });

  return articles.map((a) => {
    if (imageMap[a.slug]) return { ...a, image: IMG_PROXY + encodeURIComponent(imageMap[a.slug]) };
    if (!a.image) return { ...a, image: svgFallback(a.source) };
    if (a.image && !a.image.startsWith("data:")) return { ...a, image: IMG_PROXY + encodeURIComponent(a.image) };
    return a;
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "all";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  const articles = await fetchAllFeeds(source);
  const enriched = await enrichImages(articles);
  const total = enriched.length;
  const paged = enriched.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: paged,
    meta: {
      total,
      returned: paged.length,
      hasMore: offset + limit < total,
    },
  });
}
