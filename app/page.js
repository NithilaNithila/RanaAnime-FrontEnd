"use client";

import { useEffect, useState } from "react";
import AnimeCard from "../components/AnimeCard";
import Link from "next/link";
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

function HeroSection({ anime }) {
  const [bannerError, setBannerError] = useState(false);
  if (!anime) return null;
  const title = anime.title?.english || anime.title?.romaji || "";
  const banner = bannerError ? "" : anime.bannerImage || anime.coverImage?.large || anime.image || "";

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {banner && (
        <div className="absolute inset-0">
          <img src={banner} alt="" role="presentation" onError={() => setBannerError(true)} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>
      )}
      {!banner && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,211,238,.15),transparent_50%),radial-gradient(circle_at_30%_70%,rgba(168,85,247,.1),transparent_40%)]" />
      )}
      <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-end gap-8 px-4 py-12 lg:px-8">
        <div className="max-w-2xl pb-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Fresh on the Servers</p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            {anime.averageScore && <span className="rounded-full bg-amber-500/15 px-3 py-1 font-bold text-amber-300">★ {anime.averageScore}%</span>}
            {anime.episodes && <span className="rounded-full bg-white/10 px-3 py-1">{anime.episodes} episodes</span>}
            {anime.genres?.slice(0, 3).map((g) => (
              <span key={g} className="rounded-full bg-white/10 px-3 py-1">{g}</span>
            ))}
          </div>
          {anime.description && (
            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-slate-400">{anime.description}</p>
          )}
          <Link href={`/anime/${anime.id || anime.slug}`} className="mt-6 inline-flex rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">
            View Details →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Shelf({ title, eyebrow, items, loading }) {
  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(loading ? Array.from({ length: 5 }) : items).map((anime, i) => (
          loading ? (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="aspect-[3/4] animate-pulse bg-slate-800" />
              <div className="p-3"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" /></div>
            </div>
          ) : (
            <AnimeCard key={anime.id} anime={anime} />
          )
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load watch history
    const saved = JSON.parse(localStorage.getItem("watchHistory") || "{}");
    const historyList = Object.entries(saved)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);
    setHistory(historyList);

    fetch(`/api/metadata/recently-added?limit=200`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setItems((d.data?.results || []).map(toCard));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const heroAnime = items[0] || null;

  return (
    <main>
      <HeroSection anime={heroAnime} />
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 lg:px-8">
        {history.length > 0 && (
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Jump back in</p>
            <h2 className="mt-1 text-2xl font-black text-white">Continue Watching</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {history.map((item) => (
                <AnimeCard
                  key={item.id}
                  anime={{
                    id: item.id,
                    title: { english: item.title },
                    coverImage: { large: item.poster }
                  }}
                  href={`/watch/${item.id}?title=${encodeURIComponent(item.title)}&episode=${item.episode}&poster=${encodeURIComponent(item.poster)}`}
                />
              ))}
            </div>
          </section>
        )}
        <Shelf title="Recently Added" eyebrow="Just dropped" items={items.slice(1)} loading={loading} />
      </div>
    </main>
  );
}
