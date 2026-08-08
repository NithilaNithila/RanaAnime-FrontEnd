"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import AnimeCard from "../../components/AnimeCard";

const toCard = (item) => {
  let slug = String(item.slug || "");
  if (item.source === "anipub" && !slug.startsWith("anipub:")) slug = `anipub:${slug}`;
  if (item.source === "allanime" && !slug.startsWith("allanime:")) slug = `allanime:${slug}`;
  if (item.source === "animoye" && !slug.startsWith("animoye:")) slug = `animoye:${slug}`;
  return {
    id: slug,
    slug,
    title: { english: item.title },
    coverImage: { large: item.image, medium: item.image },
    image: item.image,
    episodes: item.episodeCount || null,
    type: item.type,
  };
};

function RankCard({ anime, rank }) {
  const title = anime.title?.english || anime.title?.romaji || "Unknown";
  const image = anime.coverImage?.large || anime.coverImage?.medium || "";
  const watchHref = `/watch/${anime.id}?title=${encodeURIComponent(title)}&episode=1&poster=${encodeURIComponent(image)}`;

  return (
    <a href={watchHref} className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:-translate-y-0.5 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="relative w-24 flex-shrink-0 sm:w-32">
        {image ? (
          <img src={image} alt={title} className="aspect-[3/4] w-full object-cover" loading="lazy" />
        ) : (
          <div className="aspect-[3/4] flex items-center justify-center bg-slate-800 text-slate-500">No Image</div>
        )}
        <div className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-br-xl text-sm font-black ${
          rank <= 3 ? "bg-amber-500 text-slate-950" : "bg-slate-950/80 text-white"
        }`}>
          {rank}
        </div>
      </div>
      <div className="flex-1 py-3 pr-4">
        <span className="text-sm font-bold text-white transition group-hover:text-cyan-300 sm:text-base">{title}</span>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
          {anime.episodes && <span>{anime.episodes} eps</span>}
          {anime.type && <span className="capitalize">{anime.type}</span>}
        </div>
      </div>
    </a>
  );
}

export default function TopPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/metadata/recently-added?limit=50`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setData((res.data?.results || []).map(toCard));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top10 = data.slice(0, 10);
  const rest = data.slice(10);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Flame className="text-cyan-400" size={28} />
          <div>
            <h1 className="text-3xl font-black text-white">Recently Added</h1>
            <p className="mt-1 text-sm text-slate-400">Fresh titles streaming right now</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900 p-2">
              <div className="h-32 w-24 animate-pulse rounded-xl bg-slate-800 sm:w-32" />
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {top10.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">Top 10</h2>
              {top10.map((anime, i) => (
                <RankCard key={anime.id} anime={anime} rank={i + 1} />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-white">More</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {rest.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            </div>
          )}

          {!loading && data.length === 0 && (
            <div className="py-20 text-center text-slate-500">No anime found</div>
          )}
        </>
      )}
    </main>
  );
}
