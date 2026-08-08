"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import NewsCard from "../../components/NewsCard";

const NEWS_API = "/api/news";

const MOCK_ARTICLES = [
  { slug: "one-piece-announces-new-arc", title: "One Piece Announces Exciting New Arc for 2026", excerpt: "Eiichiro Oda confirms the next major saga in the One Piece universe, promising the biggest adventure yet for the Straw Hat crew.", image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg", source: "RanaAnime Editorial", date: "2026-07-25" },
  { slug: "best-anime-of-2025-review", title: "The Best Anime of 2025: A Year in Review", excerpt: "From jaw-dropping action to heartfelt stories, 2025 delivered some of the most memorable anime in recent memory.", image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg", source: "Anime Critic", date: "2026-07-20" },
  { slug: "studio-ghibli-new-film-2026", title: "Studio Ghibli Teases New Film for Late 2026", excerpt: "The legendary animation studio hints at a new original film, marking their first release since The Boy and the Heron.", image: "https://cdn.myanimelist.net/images/anime/1597/142232l.jpg", source: "RanaAnime Staff", date: "2026-07-18" },
  { slug: "anime-streaming-wars-2026", title: "The Streaming Wars: How Anime Platforms Are Evolving", excerpt: "A deep dive into the competitive landscape of anime streaming services and what it means for viewers.", image: "https://cdn.myanimelist.net/images/anime/1608/138035l.jpg", source: "Industry Watch", date: "2026-07-15" },
  { slug: "upcoming-anime-fall-2026", title: "Most Anticipated Anime: Fall 2026 Preview", excerpt: "Here are the anime we can't wait to watch this fall season, from returning favorites to exciting new adaptations.", image: "https://cdn.myanimelist.net/images/anime/1441/139646l.jpg", source: "RanaAnime Staff", date: "2026-07-12" },
  { slug: "anime-voice-acting-careers", title: "Inside the World of Anime Voice Acting", excerpt: "A rare look behind the microphone at what it takes to become a professional anime voice actor.", image: "https://cdn.myanimelist.net/images/anime/11/39717l.jpg", source: "Voice Actor Weekly", date: "2026-07-10" },
];

const SOURCE_FILTERS = ["all", "ann", "crunchyroll", "animecorner"];
const SOURCE_NAMES = { all: "All Sources", ann: "Anime News Network", crunchyroll: "Crunchyroll", animecorner: "Anime Corner" };

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!NEWS_API) {
      setArticles(MOCK_ARTICLES);
      setLoading(false);
      return;
    }
    setLoading(true);
    setOffset(0);
    const params = new URLSearchParams({ limit: "20", sort: "latest" });
    if (source !== "all") params.set("source", source);

    fetch(`${NEWS_API}?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setArticles(res.data);
          setIsLive(true);
          setHasMore(res.meta?.hasMore || false);
        } else {
          setArticles(MOCK_ARTICLES);
          setIsLive(false);
        }
      })
      .catch(() => { setArticles(MOCK_ARTICLES); setIsLive(false); })
      .finally(() => setLoading(false));
  }, [source]);

  const loadMore = () => {
    const nextOffset = offset + 20;
    const params = new URLSearchParams({ limit: "20", sort: "latest", offset: String(nextOffset) });
    if (source !== "all") params.set("source", source);

    fetch(`${NEWS_API}?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setArticles((prev) => [...prev, ...res.data]);
          setOffset(nextOffset);
          setHasMore(res.meta?.hasMore || false);
        } else {
          setHasMore(false);
        }
      })
      .catch(() => setHasMore(false));
  };

  const [featuredImgError, setFeaturedImgError] = useState(false);
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="text-cyan-400" size={28} />
          <div>
            <h1 className="text-3xl font-black text-white">Anime News</h1>
            <p className="mt-1 text-sm text-slate-400">
              {isLive ? "Live from anime news sources worldwide" : "Latest news, reviews, and editorials"}
            </p>
          </div>
        </div>
        {NEWS_API && (
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isLive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            {isLive ? "Live" : "Offline"}
          </span>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {SOURCE_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              source === s
                ? "bg-cyan-500 text-slate-950"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {SOURCE_NAMES[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="aspect-video animate-pulse rounded-2xl bg-slate-800" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                <div className="aspect-video animate-pulse bg-slate-800" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {featured && (
            <a
              href={featured.link || `/news/${featured.slug}`}
              target={featured.link ? "_blank" : undefined}
              rel={featured.link ? "noopener noreferrer" : undefined}
              className="group relative mb-8 block overflow-hidden rounded-2xl border border-white/10 transition hover:border-cyan-500/50"
            >
              {featured.image && !featuredImgError ? (
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={() => setFeaturedImgError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>
              ) : (
                <div className="aspect-[21/9] bg-gradient-to-br from-cyan-900/30 to-slate-900" />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                {featured.source && (
                  <span className="inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    {featured.source}
                  </span>
                )}
                <h2 className="mt-3 text-2xl font-black text-white transition group-hover:text-cyan-300 sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">{featured.excerpt}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  {featured.date && (
                    <span>{new Date(featured.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  )}
                  {featured.link && (
                    <span className="flex items-center gap-1 text-cyan-400">
                      <ExternalLink size={10} /> Read original
                    </span>
                  )}
                </div>
              </div>
            </a>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, i) => (
                <NewsCard key={`${article.slug || article.title}-${i}`} article={article} />
              ))}
            </div>
          )}

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

          {!loading && articles.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              No articles found
            </div>
          )}
        </>
      )}
    </main>
  );
}
