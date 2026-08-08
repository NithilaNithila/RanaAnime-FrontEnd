import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  const allowedHosts = [
    "cdn.myanimelist.net",
    "img.youtube.com",
    "animenewsnetwork.com",
    "www.animenewsnetwork.com",
    "cdn.animenewsnetwork.com",
    "crunchyroll.com",
    "www.crunchyroll.com",
    "ak.crunchyroll.com",
    "static.crunchyroll.com",
    "animecorner.me",
    "animeherald.com",
    "i.ytimg.com",
    "lh3.googleusercontent.com",
    "yt3.ggpht.com",
    "static.animecorner.me",
  ];

  try {
    const parsed = new URL(url);
    const isAllowed = allowedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h));

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Referer: isAllowed ? `https://${parsed.hostname}/` : "https://www.google.com/",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
