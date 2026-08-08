import { NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

async function proxyToBackend(request) {
  const url = new URL(request.url);
  const targetUrl = new URL(`${BACKEND_URL}${url.pathname}${url.search}`);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (["host", "connection", "content-length", "origin"].includes(lower)) return;
    headers.set(key, value);
  });

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const response = await fetch(targetUrl, init);
  const body = Buffer.from(await response.arrayBuffer());

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) return;
    responseHeaders.set(key, value);
  });

  return new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request) {
  return proxyToBackend(request);
}

export async function POST(request) {
  return proxyToBackend(request);
}

export async function PUT(request) {
  return proxyToBackend(request);
}

export async function PATCH(request) {
  return proxyToBackend(request);
}

export async function DELETE(request) {
  return proxyToBackend(request);
}
