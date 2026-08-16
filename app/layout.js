import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RanaAnime — Anime Streaming",
  description: "Watch anime for free. Trending, seasonal, and popular anime with HD streaming.",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-512.png?v=1", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  manifest: "/site.webmanifest",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RanaAnime",
  url: "https://ranaanime.netlify.app",
  logo: "https://ranaanime.netlify.app/logo.png",
  description: "Watch anime for free. Trending, seasonal, and popular anime with HD streaming.",
  publisher: {
    "@type": "Organization",
    name: "RanaAnime",
    logo: {
      "@type": "ImageObject",
      url: "https://ranaanime.netlify.app/logo.png",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
