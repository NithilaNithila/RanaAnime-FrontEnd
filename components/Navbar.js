"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, X, Trophy, Grid3X3, Newspaper, Home } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMobileOpen(false);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 border-b border-white/10 transition-colors duration-300 ${scrolled ? "bg-slate-950/90 backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
          <Image src="/logo.png" alt="Novaflix" width={80} height={80} priority className="h-16 w-auto object-contain" />
          <span className="hidden text-2xl font-black tracking-tight text-white sm:inline">Novaflix</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white"><Home size={14} /> Home</Link>
          <Link href="/top" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white"><Trophy size={14} /> Top</Link>
          <Link href="/genre" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white"><Grid3X3 size={14} /> Genres</Link>
          <Link href="/news" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white"><Newspaper size={14} /> News</Link>
        </div>

        <form onSubmit={handleSearch} className="hidden max-w-sm flex-1 sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              aria-label="Search anime"
              className="w-full rounded-full border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </form>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden" aria-label="Toggle menu">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
                aria-label="Search anime"
                className="w-full rounded-full border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
              />
            </div>
          </form>
          <div className="flex flex-col gap-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"><Home size={14} /> Home</Link>
            <Link href="/top" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"><Trophy size={14} /> Top</Link>
            <Link href="/genre" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"><Grid3X3 size={14} /> Genres</Link>
            <Link href="/news" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"><Newspaper size={14} /> News</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
