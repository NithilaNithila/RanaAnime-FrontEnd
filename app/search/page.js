"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const doSearch = async (q, page = 1) => {
    if (!q.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/metadata/search?q=${encodeURIComponent(q.trim())}&limit=50`, { signal: controller.signal });
      const data = await res.json();
      if (data.success) {
        setResults((data.data?.results || []).map(toCard));
      } else {
        setError("No results found");
        setResults([]);
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError("Failed to search. Check your connection.");
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      doSearch(query);
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-black text-white">Search Anime</h1>
        <p className="mt-1 text-sm text-slate-400">Find any anime by name</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Naruto, One Piece, Attack on Titan..."
          aria-label="Search anime"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
        <button type="submit" className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">
          Search
        </button>
      </form>

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="aspect-[3/4] animate-pulse bg-slate-800" />
              <div className="p-3"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" /></div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && initialQuery && (
        <p className="text-center text-slate-500">No results found for &ldquo;{initialQuery}&rdquo;</p>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
