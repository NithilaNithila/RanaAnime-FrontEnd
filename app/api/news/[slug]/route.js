import { NextResponse } from "next/server";
import { fetchAllFeeds } from "../utils";

export async function GET(request, { params }) {
  const { slug } = await params;
  const articles = await fetchAllFeeds("all");
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return NextResponse.json(
      { success: false, error: "Article not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: article });
}
