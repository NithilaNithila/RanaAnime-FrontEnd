"use client";

import Link from "next/link";
import { ExternalLink, ImageOff } from "lucide-react";
import { useState } from "react";

const SOURCE_COLORS = {
  "Anime News Network": "bg-blue-500/15 text-blue-300",
  Crunchyroll: "bg-orange-500/15 text-orange-300",
  "Anime Corner": "bg-purple-500/15 text-purple-300",
  MyAnimeList: "bg-cyan-500/15 text-cyan-300",
  "Otaku USA": "bg-rose-500/15 text-rose-300",
  "Comic Book": "bg-amber-500/15 text-amber-300",
  "Anime Herald": "bg-emerald-500/15 text-emerald-300",
  NovaFlix: "bg-cyan-500/15 text-cyan-300",
};

export default function NewsCard({ article }) {
  const [imgError, setImgError] = useState(false);

  const dateStr = article.date || article.publishedAt
    ? new Date(article.date || article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const sourceLabel = article.source || article.category || "";
  const sourceColor = SOURCE_COLORS[sourceLabel] || "bg-slate-500/15 text-slate-300";

  return (
    <Link
      href={article.link ? undefined : `/news/${article.slug}`}
      {...(article.link ? { href: article.link, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      {article.image && !imgError ? (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        </div>
      ) : (
        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-cyan-900/20 to-slate-800">
          {imgError && <ImageOff size={24} className="text-slate-600" />}
        </div>
      )}
      <div className="p-4">
        {sourceLabel && (
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sourceColor}`}>
            {sourceLabel}
          </span>
        )}
        <h3 className="mt-2 line-clamp-2 text-sm font-bold text-white transition group-hover:text-cyan-300 sm:text-base">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
            {article.excerpt}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
          {dateStr && <span>{dateStr}</span>}
          {article.link && (
            <span className="flex items-center gap-1 text-cyan-400">
              <ExternalLink size={9} /> External
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
