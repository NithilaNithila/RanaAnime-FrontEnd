export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black text-cyan-400">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-400">The page you are looking for does not exist.</p>
      <a
        href="/"
        className="mt-6 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
      >
        Go Home
      </a>
    </main>
  );
}
