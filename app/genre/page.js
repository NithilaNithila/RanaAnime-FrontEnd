"use client";

import { useState } from "react";
import Link from "next/link";
import { Grid3X3 } from "lucide-react";

const GENRES = [
  { name: "Action", slug: "action", emoji: "⚔️" },
  { name: "Adventure", slug: "adventure", emoji: "🗺️" },
  { name: "Comedy", slug: "comedy", emoji: "😂" },
  { name: "Drama", slug: "drama", emoji: "🎭" },
  { name: "Ecchi", slug: "ecchi", emoji: "🔥" },
  { name: "Fantasy", slug: "fantasy", emoji: "✨" },
  { name: "Horror", slug: "horror", emoji: "👻" },
  { name: "Mahou Shoujo", slug: "mahou-shoujo", emoji: "🪄" },
  { name: "Mecha", slug: "mecha", emoji: "🤖" },
  { name: "Music", slug: "music", emoji: "🎵" },
  { name: "Mystery", slug: "mystery", emoji: "🔍" },
  { name: "Psychological", slug: "psychological", emoji: "🧠" },
  { name: "Romance", slug: "romance", emoji: "💕" },
  { name: "Sci-Fi", slug: "sci-fi", emoji: "🚀" },
  { name: "Slice of Life", slug: "slice-of-life", emoji: "🌸" },
  { name: "Sports", slug: "sports", emoji: "⚽" },
  { name: "Supernatural", slug: "supernatural", emoji: "👁️" },
  { name: "Thriller", slug: "thriller", emoji: "🔪" },
];

const CATEGORIES = [
  { label: "Action & Adventure", genres: ["Action", "Adventure", "Mecha", "Sports"] },
  { label: "Drama & Emotion", genres: ["Drama", "Psychological", "Thriller", "Mystery"] },
  { label: "Fantasy & Sci-Fi", genres: ["Fantasy", "Sci-Fi", "Supernatural", "Horror"] },
  { label: "Lighthearted", genres: ["Comedy", "Slice of Life", "Music", "Romance"] },
  { label: "Other", genres: ["Ecchi", "Mahou Shoujo"] },
];

export default function GenreIndexPage() {
  const [search, setSearch] = useState("");

  const filtered = GENRES.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Grid3X3 className="text-cyan-400" size={28} />
          <div>
            <h1 className="text-3xl font-black text-white">Browse by Genre</h1>
            <p className="mt-1 text-sm text-slate-400">Explore anime by your favorite genre</p>
          </div>
        </div>
      </div>

      <div className="mb-8 max-w-md">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search genres..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {search ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((genre) => (
            <Link
              key={genre.slug}
              href={`/genre/${genre.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <span className="text-2xl">{genre.emoji}</span>
              <span className="text-sm font-semibold text-white transition group-hover:text-cyan-300">{genre.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        CATEGORIES.map((cat) => {
          const catGenres = GENRES.filter((g) => cat.genres.includes(g.name));
          return (
            <section key={cat.label} className="mb-8">
              <h2 className="mb-4 text-lg font-bold text-white">{cat.label}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {catGenres.map((genre) => (
                  <Link
                    key={genre.slug}
                    href={`/genre/${genre.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <span className="text-2xl">{genre.emoji}</span>
                    <span className="text-sm font-semibold text-white transition group-hover:text-cyan-300">{genre.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
