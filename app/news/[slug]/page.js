"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, Check, ExternalLink } from "lucide-react";
import NewsCard from "../../../components/NewsCard";

const NEWS_API = "/api/news";

const MOCK_ARTICLES = {
  "one-piece-announces-new-arc": { slug: "one-piece-announces-new-arc", title: "One Piece Announces Exciting New Arc for 2026", image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg", source: "NovaFlix Editorial", date: "2026-07-25", excerpt: "Eiichiro Oda confirms the next major saga in the One Piece universe.", content: "In a groundbreaking announcement that has sent waves through the anime community, creator Eiichiro Oda has confirmed that One Piece will be entering its next major saga in 2026.\n\nThe new arc promises to be the most ambitious yet, with Oda stating that he has been planning this storyline since the early days of the series. Fans can expect deeper lore, epic battles, and emotional moments that will redefine the series.\n\nThe announcement came alongside a special illustration featuring the Straw Hat crew in new outfits, hinting at the themes of the upcoming arc. Industry analysts predict this could be one of the biggest anime events of the decade." },
  "best-anime-of-2025-review": { slug: "best-anime-of-2025-review", title: "The Best Anime of 2025: A Year in Review", image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg", source: "Anime Critic", date: "2026-07-20", excerpt: "From jaw-dropping action to heartfelt stories, 2025 delivered some of the most memorable anime.", content: "2025 was an exceptional year for anime, delivering groundbreaking series across every genre.\n\nAction & Adventure: The year saw incredible action sequences and storytelling, with several series pushing the boundaries of animation quality.\n\nRomance & Drama: Heartfelt stories continued to resonate with audiences worldwide.\n\nSlice of Life: The genre continues to shine, offering viewers moments of genuine warmth and relatability." },
  "studio-ghibli-new-film-2026": { slug: "studio-ghibli-new-film-2026", title: "Studio Ghibli Teases New Film for Late 2026", image: "https://cdn.myanimelist.net/images/anime/1597/142232l.jpg", source: "NovaFlix Staff", date: "2026-07-18", excerpt: "The legendary animation studio hints at a new original film.", content: "Studio Ghibli has officially confirmed that a new original film is in production, with a projected release date of late 2026.\n\nWhile details remain scarce, studio co-founder Toshio Suzuki mentioned in a recent interview that the project has been in development for over three years." },
};

export default function NewsArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [related, setRelated] = useState([]);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError("");

    if (NEWS_API) {
      fetch(`${NEWS_API}/${slug}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setArticle(res.data);
            document.title = `${res.data.title} - NovaFlix`;
          } else if (MOCK_ARTICLES[slug]) {
            setArticle(MOCK_ARTICLES[slug]);
          } else {
            setError("Article not found");
          }
        })
        .catch(() => {
          if (MOCK_ARTICLES[slug]) {
            setArticle(MOCK_ARTICLES[slug]);
          } else {
            setError("Failed to load article");
          }
        })
        .finally(() => setLoading(false));
    } else {
      if (MOCK_ARTICLES[slug]) {
        setArticle(MOCK_ARTICLES[slug]);
      } else {
        setError("Article not found");
      }
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!NEWS_API || !article) return;
    fetch(`${NEWS_API}?source=${article.sourceKey || "all"}&limit=4`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length) {
          setRelated(res.data.filter((a) => a.slug !== article.slug).slice(0, 3));
        }
      })
      .catch(() => {});
  }, [article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(article?.title || "");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const dateStr = article?.date || article?.publishDate
    ? new Date(article?.date || article?.publishDate).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="aspect-video rounded-2xl bg-slate-800" />
          <div className="h-8 w-3/4 rounded bg-slate-800" />
          <div className="h-4 w-1/2 rounded bg-slate-800" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-800" />
            <div className="h-3 w-2/3 rounded bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <Link href="/news" className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
          <ArrowLeft size={14} /> Back to news
        </Link>
        <div className="py-20 text-center text-slate-400">{error || "Article not found"}</div>
      </main>
    );
  }

  const contentHtml = article.content || article.excerpt || "";
  const isHtml = contentHtml.includes("<p>") || contentHtml.includes("<");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <Link href="/news" className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
        <ArrowLeft size={14} /> Back to news
      </Link>

      {article.image && !imgError ? (
        <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-2xl">
          <img src={article.image} alt={article.title} className="h-full w-full object-cover" onError={() => setImgError(true)} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
        </div>
      ) : (
        <div className="mt-6 aspect-[21/9] rounded-2xl bg-gradient-to-br from-cyan-900/20 to-slate-800" />
      )}

      <article className="mt-6">
        {article.source && (
          <span className="inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
            {article.source}
          </span>
        )}

        <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">{article.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          {dateStr && <span>{dateStr}</span>}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={handleShareTwitter}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Share on X
          </button>
          {article.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              <ExternalLink size={14} /> Read Original
            </a>
          )}
        </div>

        <div className="mt-8 max-w-none space-y-4 text-base leading-relaxed text-slate-300">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          ) : (
            contentHtml.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-white">Related Articles</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a, i) => (
              <NewsCard key={`${a.slug || a.title}-${i}`} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="h-16" />
    </main>
  );
}
