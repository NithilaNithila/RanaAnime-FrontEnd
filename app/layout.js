import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RanaAnime — Anime Streaming",
  description: "Watch anime for free. Trending, seasonal, and popular anime with HD streaming.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: "https://ranaanime.netlify.app/",
    title: "RanaAnime — Anime Streaming",
    images: ["https://ranaanime.netlify.app/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    url: "https://ranaanime.netlify.app/",
    title: "RanaAnime — Anime Streaming",
    images: ["https://ranaanime.netlify.app/logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RanaAnime",
  url: "https://ranaanime.netlify.app/",
  logo: "https://ranaanime.netlify.app/logo.png",
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
