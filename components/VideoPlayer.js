"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

const MAX_RETRIES = 2;

export default function VideoPlayer({ src, title, poster, embedUrl, anilistId, episode }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryRef = useRef(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [useEmbed, setUseEmbed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const saveProgress = useCallback(() => {
    if (!videoRef.current || !anilistId || !episode) return;
    const time = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (time > 0 && duration > 0) {
      const progress = (time / duration) * 100;
      if (progress < 98) {
        const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
        history[anilistId] = {
          time,
          duration,
          episode,
          title,
          poster,
          updatedAt: Date.now(),
        };
        localStorage.setItem("watchHistory", JSON.stringify(history));
      }
    }
  }, [anilistId, episode, title, poster]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video || useEmbed) return;
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case "ArrowRight":
          video.currentTime += 10;
          break;
        case "ArrowLeft":
          video.currentTime -= 10;
          break;
        case "KeyF":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            video.parentElement?.requestFullscreen();
          }
          break;
        case "KeyM":
          video.muted = !video.muted;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [useEmbed]);

  useEffect(() => {
    retryRef.current = 0;
    setUseEmbed(false);
    setIsReady(false);
    setIframeLoaded(false);
  }, [src]);

  const switchToEmbed = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setUseEmbed(true);
    setError("");
    setLoading(false);
    setIframeLoaded(false);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!src || useEmbed) return;

    setError("");
    setLoading(true);

    const onTimeUpdate = () => {
      if (video.currentTime % 5 < 1) {
        saveProgress();
      }
    };
    video.addEventListener("timeupdate", onTimeUpdate);

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startFragPrefetch: true,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        retryRef.current = 0;
        setIsReady(true);

        const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
        const entry = history[anilistId];
        if (entry && entry.episode === episode && entry.time > 0) {
          video.currentTime = entry.time;
        }

        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (retryRef.current < MAX_RETRIES) {
            retryRef.current++;
            hls.startLoad();
          } else {
            if (embedUrl) switchToEmbed();
            else {
              setError("Stream unavailable. Try another source.");
              setLoading(false);
            }
          }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          try {
            hls.recoverMediaError();
          } catch {
            if (embedUrl) switchToEmbed();
            else {
              setError("Playback error. Try another episode.");
              setLoading(false);
            }
          }
        } else {
          if (embedUrl) switchToEmbed();
          else {
            setError("Failed to load video. Try another episode.");
            setLoading(false);
          }
        }
      });

      return () => {
        video.removeEventListener("timeupdate", onTimeUpdate);
        saveProgress();
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const onLoaded = () => {
        setLoading(false);
        setIsReady(true);
        const history = JSON.parse(localStorage.getItem("watchHistory") || "{}");
        const entry = history[anilistId];
        if (entry && entry.episode === episode && entry.time > 0) {
          video.currentTime = entry.time;
        }
        video.play().catch(() => {});
      };
      const onError = () => {
        if (embedUrl) switchToEmbed();
        else {
          setError("Failed to load video.");
          setLoading(false);
        }
      };
      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("error", onError);
      video.src = src;

      return () => {
        video.removeEventListener("timeupdate", onTimeUpdate);
        saveProgress();
        video.removeEventListener("loadedmetadata", onLoaded);
        video.removeEventListener("error", onError);
        video.removeAttribute("src");
        video.load();
      };
    } else {
      if (embedUrl) switchToEmbed();
      else {
        setError("HLS is not supported in this browser.");
        setLoading(false);
      }
    }
  }, [src, useEmbed, embedUrl, switchToEmbed, anilistId, episode, saveProgress]);

  if (!src && !embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-400">
        No stream available
      </div>
    );
  }

  if (useEmbed || (!src && embedUrl)) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-black">
        <iframe
          src={embedUrl}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          scrolling="no"
          title={title || "Video Player"}
          onLoad={() => setIframeLoaded(true)}
        />
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span className="text-sm text-slate-300">Loading player...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-black">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-black"
        controls
        playsInline
        poster={poster || ""}
        crossOrigin="anonymous"
      />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span className="text-sm text-slate-300">Loading stream...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
          <div className="text-center space-y-3">
            <p className="text-sm text-rose-400">{error}</p>
            {embedUrl && (
              <button
                onClick={switchToEmbed}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Try Embed Player
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
