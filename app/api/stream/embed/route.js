import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

export async function GET(request) {
  const url = new URL(request.url);
  const targetUrl = new URL(`${BACKEND_URL}${url.pathname}${url.search}`);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (["host", "connection", "content-length"].includes(lower)) return;
    headers.set(key, value);
  });

  const response = await fetch(targetUrl, {
    method: "GET",
    headers,
    redirect: "manual",
  });

  const body = Buffer.from(await response.arrayBuffer());
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "content-length") {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
