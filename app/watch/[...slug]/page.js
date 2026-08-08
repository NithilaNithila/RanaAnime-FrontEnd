"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import VideoPlayer from "../../../components/VideoPlayer";

export default function WatchPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : (params.slug || "");
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "Anime";
  const episode = parseInt(searchParams.get("episode") || "1");
  const poster = searchParams.get("poster") || "";
  const anilistId = slug;

  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorSources, setErrorSources] = useState(null);
  const [selectedSource, setSelectedSource] = useState("watchanimeworld");
  const [selectedLanguage, setSelectedLanguage] = useState("sub");
  const [selectedSeason, setSelectedSeason] = useState(parseInt(searchParams.get("season") || "1"));

  const SOURCES = [
    { id: "watchanimeworld", name: "WatchAnimeWorld" },
    { id: "123anime", name: "123Anime" },
    { id: "anipub", name: "Anipub" },
    { id: "animoye", name: "AniMoye" },
  ];

  const HINDI_SOURCES = ["watchanimeworld", "animoye"];
  const LANGUAGE_SELECTOR_HIDDEN = HINDI_SOURCES.includes(selectedSource);
  const streamLanguage = LANGUAGE_SELECTOR_HIDDEN ? "sub" : selectedLanguage;

  const LANGUAGES = HINDI_SOURCES.includes(selectedSource) ? [
    { id: "sub", name: "Sub", desc: "Original Japanese audio" },
    { id: "hindi", name: "Hindi", desc: "Hindi dub" },
    { id: "tamil", name: "Tamil", desc: "Tamil dub" },
    { id: "telugu", name: "Telugu", desc: "Telugu dub" },
    { id: "english", name: "English", desc: "English dub" },
  ] : [
    { id: "sub", name: "Original (Sub)", desc: "Japanese audio with subtitles" },
    { id: "dub", name: "Dubbed", desc: "English dubbed audio" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("preferredSource");
    if (saved) setSelectedSource(saved);
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang) setSelectedLanguage(savedLang);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hasPlayable = (d) =>
      d?.hlsProxyUrl || d?.m3u8 || d?.directM3u8 || d?.embedUrl || d?.embedProxyUrl;

    (async () => {
      setLoading(true);
      setError("");
      setErrorSources(null);
      setStreamData(null);

      try {
        const r = await fetch(`/api/stream?title=${encodeURIComponent(title)}&episode=${episode}&source=${selectedSource}&language=${streamLanguage}&season=${selectedSeason}`);
        const data = await r.json();
        if (cancelled) return;
        if (data?.success && data?.data && hasPlayable(data.data)) {
          setStreamData(data.data);
          setError("");
          setErrorSources(null);
        } else {
          setError(data?.message || "This server is not available for this episode. Try another server.");
          setErrorSources(data?.attemptedSources || data?.sourceErrors || null);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load stream. This server may be unavailable. Try another server.");
          setErrorSources(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [title, episode, selectedSource, selectedLanguage, selectedSeason]);

  const handleSourceChange = (src) => {
    setSelectedSource(src);
    localStorage.setItem("preferredSource", src);
    if (HINDI_SOURCES.includes(src) && !["sub", "hindi", "tamil", "telugu", "english"].includes(selectedLanguage)) {
      setSelectedLanguage("sub");
    }
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const epUrl = (ep, season) => `/watch/${anilistId}?title=${encodeURIComponent(title)}&episode=${ep}&poster=${encodeURIComponent(poster)}&season=${season || selectedSeason}`;

  const seasonList = streamData?.seasons || [];
  const currentSeasonInfo = seasonList.find((s) => s.seasonNumber === selectedSeason);
  const currentEpCount = currentSeasonInfo?.episodeCount || (currentSeasonInfo?.episodes?.length) || 0;
  const currentEpisodes = currentSeasonInfo?.episodes || (currentEpCount > 0 ? Array.from({ length: currentEpCount }, (_, i) => i + 1) : []);

  const prevTarget = episode > 1
    ? { ep: episode - 1, season: selectedSeason }
    : selectedSeason > 1
      ? { ep: seasonList.find((s) => s.seasonNumber === selectedSeason - 1)?.episodeCount || 1, season: selectedSeason - 1 }
      : null;

  const nextTarget = currentEpCount > 0 && episode < currentEpCount
    ? { ep: episode + 1, season: selectedSeason }
    : seasonList.some((s) => s.seasonNumber === selectedSeason + 1)
      ? { ep: 1, season: selectedSeason + 1 }
      : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <Link href={anilistId ? `/anime/${anilistId}` : "/"} className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
        <ArrowLeft size={14} /> Back to anime
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Now Playing</p>
          <h1 className="mt-1 text-xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-400">
            Episode {episode}
            {!LANGUAGE_SELECTOR_HIDDEN && ` · ${selectedLanguage.toUpperCase()}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!LANGUAGE_SELECTOR_HIDDEN && (
            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-700 bg-slate-950 p-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    selectedLanguage === lang.id
                      ? "bg-cyan-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={lang.desc}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-1 rounded-xl border border-slate-700 bg-slate-950 p-1">
            {SOURCES.map((src) => (
              <button
                key={src.id}
                onClick={() => handleSourceChange(src.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedSource === src.id
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {src.name}
              </button>
            ))}
          </div>
          {streamData && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              {streamData.source}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span className="text-sm text-slate-400">Loading stream...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
            <div className="px-6 text-center">
              <p className="text-rose-400">{error || "This server is not available for this episode. Try another server."}</p>
              {errorSources?.length > 0 && (
                <div className="mt-4 space-y-1">
                  {errorSources.map((s, i) => (
                    <p key={i} className="text-xs text-slate-500">{s.name}: {s.success ? "OK" : (s.reason || "Not available")}</p>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-slate-500">Click another server button above to try a different source.</p>
            </div>
          </div>
        ) : (
          <VideoPlayer
            src={streamData?.hlsProxyUrl || streamData?.m3u8 || streamData?.directM3u8 || ""}
            embedUrl={streamData?.providerEmbedUrl || streamData?.embedProxyUrl || streamData?.embedUrl || ""}
            title={title}
            poster={poster}
            anilistId={anilistId}
            episode={episode}
          />
        )}
      </div>

      {seasonList.length > 1 && (
        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-400">Seasons</h3>
          <div className="flex flex-wrap gap-2">
            {seasonList.map((s) => (
              <button
                key={s.seasonNumber}
                onClick={() => setSelectedSeason(s.seasonNumber)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selectedSeason === s.seasonNumber
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                S{s.seasonNumber}
                <span className="ml-1 text-xs opacity-60">({s.episodeCount || s.episodes?.length || "?"})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentEpisodes.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-400">
            Episodes — Season {selectedSeason}
            <span className="ml-2 text-xs text-slate-600">
              ({currentEpisodes.length} episodes)
            </span>
          </h3>
          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
              {currentEpisodes.map((ep) => (
                <Link
                  key={ep}
                  href={epUrl(ep, selectedSeason)}
                  className={`flex items-center justify-center rounded-lg py-2 text-sm font-semibold transition ${
                    parseInt(episode) === ep
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {ep}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        {prevTarget ? (
          <Link href={epUrl(prevTarget.ep, prevTarget.season)} className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-white">
            <ChevronLeft size={16} /> Episode {prevTarget.ep}{prevTarget.season !== selectedSeason ? ` (S${prevTarget.season})` : ""}
          </Link>
        ) : <div />}
        {nextTarget ? (
          <Link href={epUrl(nextTarget.ep, nextTarget.season)} className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-white">
            Episode {nextTarget.ep}{nextTarget.season !== selectedSeason ? ` (S${nextTarget.season})` : ""} <ChevronRight size={16} />
          </Link>
        ) : <div />}
      </div>

      {streamData?.attemptedSources && streamData.attemptedSources.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <h3 className="text-sm font-semibold text-white">Streaming Sources</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {streamData.attemptedSources.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
                <span className="text-sm text-white">{s.name}</span>
                <span className={`text-xs font-semibold ${s.success ? "text-emerald-400" : "text-slate-500"}`}>
                  {s.success ? "Active" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
