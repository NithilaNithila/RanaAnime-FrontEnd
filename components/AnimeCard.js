"use client";

import Link from "next/link";
import PosterImage from "./PosterImage";

export default function AnimeCard({ anime, href, badge, progress }) {
  const link = href || `/anime/${anime.slug || anime.id}`;
  const title = anime.title?.english || anime.title?.romaji || "Unknown";
  const image = anime.coverImage?.large || anime.coverImage?.medium || "";

  return (
    <Link href={link} className="group block overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="relative aspect-[3/4] overflow-hidden">
        {image ? (
          <PosterImage src={image} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-500">No Image</div>
        )}
        {anime.averageScore && (
          <div className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-amber-300 backdrop-blur-sm">
            ★ {anime.averageScore}%
          </div>
        )}
        {anime.episodes && !badge && (
          <div className="absolute bottom-2 left-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
            {anime.episodes} eps
          </div>
        )}
        {badge && (
          <div className="absolute bottom-2 left-2 rounded-full bg-cyan-500/90 px-2 py-0.5 text-xs font-bold text-slate-950">
            {badge}
          </div>
        )}
        {anime.nextAiringEpisode && (
          <div className="absolute bottom-2 right-2 rounded-full bg-cyan-500/90 px-2 py-0.5 text-xs font-bold text-slate-950">
            Airing
          </div>
        )}
        {progress > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-950/60">
            <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white transition group-hover:text-cyan-300">{title}</h3>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {anime.genres?.slice(0, 2).map((g) => (
            <span key={g} className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">{g}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
