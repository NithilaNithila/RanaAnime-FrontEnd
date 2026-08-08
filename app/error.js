"use client";

export default function Error({ error, reset }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black text-rose-400">!</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-400">{error?.message || "An unexpected error occurred."}</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
      >
        Try Again
      </button>
    </main>
  );
}
