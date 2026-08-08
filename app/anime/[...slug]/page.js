"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

export default function AnimeDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.slug) ? params.slug.join("/") : (params.slug || "");
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [selectedLocalEp, setSelectedLocalEp] = useState(1);
  const [expandedSeasons, setExpandedSeasons] = useState({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/metadata/info?slug=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAnime(data.data);
          document.title = `${data.data.title} - NovaFlix`;

          const seasons = data.data.seasons;
          if (seasons && seasons.length > 0) {
            const initial = {};
            seasons.forEach((s) => { initial[s.seasonNumber] = true; });
            setExpandedSeasons(initial);
          }
        } else {
          setError("Anime not found");
        }
      })
      .catch(() => setError("Failed to load anime details"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSeason = (num) => {
    setExpandedSeasons((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-slate-800" />
          <div className="h-80 rounded-2xl bg-slate-800" />
          <div className="h-4 w-3/4 rounded bg-slate-800" />
          <div className="h-4 w-1/2 rounded bg-slate-800" />
        </div>
      </main>
    );
  }

  if (error || !anime) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300">← Back to home</Link>
        <p className="mt-8 text-center text-slate-400">{error || "Anime not found"}</p>
      </main>
    );
  }

  const enriched = anime.enriched || {};
  const title = anime.title || "Unknown";
  const poster = anime.poster || "";
  const bannerImage = enriched.bannerImage || "";
  const seasons = anime.seasons || [];
  const episodes = anime.episodes || [];
  const totalEps =
    anime.episodeCount ||
    seasons.reduce((sum, s) => sum + (s.episodeCount || 0), 0) ||
    episodes.length ||
    0;
  const hasMultipleSeasons = seasons.length > 1;
  const typeLabel = anime.type === "movie" ? "Movie" : "Series";

  const buildWatchUrl = (season, localEp) =>
    `/watch/${id}?title=${encodeURIComponent(title)}&episode=${localEp}&poster=${encodeURIComponent(poster)}&season=${season?.seasonNumber || 1}`;

  const currentSeason = hasMultipleSeasons ? seasons[selectedSeasonIdx] : null;

  return (
    <main>
      {bannerImage && (
        <div className="relative h-64 overflow-hidden lg:h-80">
          <img src={bannerImage} alt="" role="presentation" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className={`flex gap-8 ${bannerImage ? "-mt-32 relative" : "pt-8"} flex-col lg:flex-row`}>
          <div className="w-48 flex-shrink-0 lg:w-56">
            {poster ? (
              <img src={poster} alt={title} className="w-full rounded-2xl shadow-2xl" />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-slate-800 text-5xl">🎬</div>
            )}
          </div>

          <div className="flex-1 space-y-4 pt-4">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
              <ArrowLeft size={14} /> Home
            </Link>
            <h1 className="text-3xl font-black text-white lg:text-4xl">{title}</h1>

            <div className="flex flex-wrap gap-2">
              {enriched.averageScore && <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-300">★ {enriched.averageScore}%</span>}
              {anime.year && <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{anime.year}</span>}
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{typeLabel}</span>
              {totalEps > 0 && <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{totalEps} episodes</span>}
              {enriched.status && <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{enriched.status}</span>}
              {enriched.format && <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">{enriched.format}</span>}
            </div>

            {anime.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {anime.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">{anime.description}</p>
            )}

            {enriched.nextAiringEpisode && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-cyan-300">
                Next episode: {enriched.nextAiringEpisode.episode} airing soon
              </div>
            )}
          </div>
        </div>

        {(totalEps > 0 || seasons.length > 0) && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-white">Episodes</h2>
            <p className="mt-1 text-sm text-slate-400">
              {hasMultipleSeasons ? `${seasons.length} seasons · Select an episode to watch` : "Select an episode to watch"}
            </p>

            <div className="mt-4 flex items-center gap-3">
              {hasMultipleSeasons && (
                <select
                  value={selectedSeasonIdx}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setSelectedSeasonIdx(idx);
                    setSelectedLocalEp(1);
                  }}
                  aria-label="Select season"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-500"
                >
                  {seasons.map((s, i) => (
                    <option key={i} value={i}>Season {s.seasonNumber} · {s.title}</option>
                  ))}
                </select>
              )}
              <select
                value={selectedLocalEp}
                onChange={(e) => setSelectedLocalEp(parseInt(e.target.value))}
                aria-label="Select episode"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-500"
              >
                {hasMultipleSeasons
                  ? Array.from({ length: currentSeason.episodeCount || 1 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Episode {i + 1}</option>
                    ))
                  : Array.from({ length: totalEps }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Episode {i + 1}</option>
                    ))
                }
              </select>
              <Link
                href={hasMultipleSeasons
                  ? buildWatchUrl(currentSeason, selectedLocalEp)
                  : `/watch/${id}?title=${encodeURIComponent(title)}&episode=${selectedLocalEp}&poster=${encodeURIComponent(poster)}`
                }
                className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Watch
              </Link>
            </div>

            {hasMultipleSeasons ? (
              <div className="mt-4 space-y-3">
                {seasons.map((s) => (
                  <div key={s.seasonNumber} className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
                    <button
                      onClick={() => toggleSeason(s.seasonNumber)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-800/50"
                    >
                      {expandedSeasons[s.seasonNumber] ? (
                        <ChevronDown size={18} className="text-cyan-400" />
                      ) : (
                        <ChevronRight size={18} className="text-slate-400" />
                      )}
                      <span className="font-semibold text-white">Season {s.seasonNumber}</span>
                      <span className="text-sm text-slate-400">·</span>
                      <span className="text-sm text-slate-400">{s.title}</span>
                      <span className="ml-auto text-xs text-slate-500">{s.episodeCount || episodes.filter((e) => e.season === s.seasonNumber).length} episodes</span>
                    </button>
                    {expandedSeasons[s.seasonNumber] && (
                      <div className="grid grid-cols-4 gap-2 px-4 pb-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                        {Array.from({ length: s.episodeCount || episodes.filter((e) => e.season === s.seasonNumber).length || 1 }, (_, i) => {
                          const localEp = i + 1;
                          return (
                            <Link
                              key={localEp}
                              href={buildWatchUrl(s, localEp)}
                              prefetch={false}
                              className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500"
                            >
                              {localEp}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {Array.from({ length: totalEps }, (_, i) => (
                  <Link
                    key={i + 1}
                    href={`/watch/${id}?title=${encodeURIComponent(title)}&episode=${i + 1}&poster=${encodeURIComponent(poster)}`}
                    prefetch={false}
                    className={`flex items-center justify-center rounded-lg border py-2 text-sm font-medium transition ${
                      selectedLocalEp === i + 1
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {enriched.characters?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-white">Characters</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {enriched.characters.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
                  {c.image?.medium && <img src={c.image.medium} alt="" className="h-10 w-10 rounded-full object-cover" />}
                  <div>
                    <p className="text-sm font-medium text-white">{c.name?.full}</p>
                    <p className="text-xs text-slate-400">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="h-16" />
      </div>
    </main>
  );
}
