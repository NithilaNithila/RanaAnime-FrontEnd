import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RanaAnime — Anime Streaming",
  description: "Watch anime for free. Trending, seasonal, and popular anime with HD streaming.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-512.png?v=1", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=1",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
