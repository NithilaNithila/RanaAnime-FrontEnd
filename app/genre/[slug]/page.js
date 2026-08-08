"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import AnimeCard from "../../../components/AnimeCard";

const GENRE_MAP = {
  action: "Action",
  adventure: "Adventure",
  comedy: "Comedy",
  drama: "Drama",
  ecchi: "Ecchi",
  fantasy: "Fantasy",
  horror: "Horror",
  "mahou-shoujo": "Mahou Shoujo",
  mecha: "Mecha",
  music: "Music",
  mystery: "Mystery",
  psychological: "Psychological",
  romance: "Romance",
  "sci-fi": "Sci-Fi",
  "slice-of-life": "Slice of Life",
  sports: "Sports",
  supernatural: "Supernatural",
  thriller: "Thriller",
};

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "score", label: "Score" },
  { value: "name", label: "Name" },
  { value: "newest", label: "Newest" },
];

export default function GenreDetailPage() {
  const { slug } = useParams();
  const genreName = GENRE_MAP[slug] || slug?.replace(/-/g, " ") || "Genre";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("popularity");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setResults([]);
    setPage(1);
    setHasMore(true);

    fetch(`/api/anilist/genre/${slug}?page=1`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setResults(res.data || []);
          setHasMore((res.data || []).length >= 20);
        } else {
          setError(res.message || "Failed to load genre");
        }
      })
      .catch(() => setError("Failed to load genre results"))
      .finally(() => setLoading(false));
  }, [slug]);

  const loadMore = () => {
    const nextPage = page + 1;
    fetch(`/api/anilist/genre/${slug}?page=${nextPage}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setResults((prev) => [...prev, ...res.data]);
          setPage(nextPage);
          setHasMore(res.data.length >= 20);
        } else {
          setHasMore(false);
        }
      })
      .catch(() => setHasMore(false));
  };

  const sorted = [...results].sort((a, b) => {
    switch (sortBy) {
      case "score": return (b.averageScore || 0) - (a.averageScore || 0);
      case "name": return (a.title?.english || a.title?.romaji || "").localeCompare(b.title?.english || b.title?.romaji || "");
      case "newest": return (b.id || 0) - (a.id || 0);
      default: return 0;
    }
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Link href="/genre" className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
        <ArrowLeft size={14} /> All Genres
      </Link>

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white capitalize">{genreName}</h1>
          <p className="mt-1 text-sm text-slate-400">{results.length} anime found</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            <SlidersHorizontal size={14} />
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                  className={`flex w-full px-4 py-2.5 text-left text-sm transition hover:bg-slate-800 ${
                    sortBy === opt.value ? "text-cyan-400 bg-slate-800/50" : "text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="aspect-[3/4] animate-pulse bg-slate-800" />
              <div className="p-3"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" /></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-rose-400">{error}</p>
          <Link href="/genre" className="mt-4 inline-block text-sm text-cyan-400 hover:text-cyan-300">
            ← Back to genres
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sorted.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-white"
              >
                Load More
              </button>
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              No anime found for this genre
            </div>
          )}
        </>
      )}
    </main>
  );
}
