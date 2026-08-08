const RSS_FEEDS = {
  ann: {
    url: "https://www.animenewsnetwork.com/news/rss.xml",
    name: "Anime News Network",
    isGoogle: false,
  },
  crunchyroll: {
    url: "https://www.crunchyroll.com/rss/news",
    name: "Crunchyroll",
    isGoogle: false,
  },
  animecorner: {
    url: "https://animecorner.me/feed",
    name: "Anime Corner",
    isGoogle: false,
  },
};

function extractTag(xml, tag) {
  const cdataMatch = xml.match(
    new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`)
  );
  if (cdataMatch) return cdataMatch[1].trim();
  const match = xml.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  );
  return match ? match[1].trim() : "";
}

function extractAttr(xml, tag, attr) {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']*)["']`)
  );
  return match ? match[1] : "";
}

function extractMediaUrl(itemXml) {
  const media = extractAttr(itemXml, "media:content", "url");
  if (media) return media;
  const enclosure = extractAttr(itemXml, "enclosure", "url");
  if (enclosure) return enclosure;
  const mediaThumb = extractAttr(itemXml, "media:thumbnail", "url");
  if (mediaThumb) return mediaThumb;
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  const descMatch = itemXml.match(/<description>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i);
  if (descMatch) return descMatch[1];
  return null;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function parseGoogleRssItems(xml, sourceKey, sourceName) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = stripHtml(extractTag(itemXml, "title"));
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const description = extractTag(itemXml, "description");
    const sourceTag = extractAttr(itemXml, "source", "url");

    const articleLink = link || sourceTag;
    const originalSource = sourceTag || null;
    const excerpt = stripHtml(description);
    const slug = slugify(title);

    items.push({
      title,
      slug,
      excerpt: excerpt.length > 200 ? excerpt.slice(0, 200) + "..." : excerpt,
      content: description,
      source: sourceName,
      sourceKey,
      date: pubDate ? new Date(pubDate).toISOString() : null,
      image: extractMediaUrl(itemXml),
      link: articleLink,
      originalSource,
    });
  }
  return items;
}

function parseDirectRssItems(xml, sourceKey, sourceName) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = stripHtml(extractTag(itemXml, "title"));
    const link = extractTag(itemXml, "link");
    const pubDate = extractTag(itemXml, "pubDate");
    const description = extractTag(itemXml, "description");
    const image = extractMediaUrl(itemXml);
    const slug = slugify(title);
    const excerpt = stripHtml(description);

    items.push({
      title,
      slug,
      excerpt: excerpt.length > 200 ? excerpt.slice(0, 200) + "..." : excerpt,
      content: description,
      source: sourceName,
      sourceKey,
      date: pubDate ? new Date(pubDate).toISOString() : null,
      image,
      link,
    });
  }
  return items;
}

async function fetchFeed(sourceKey) {
  const feed = RSS_FEEDS[sourceKey];
  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "application/rss+xml,application/xml,text/xml,text/html;q=0.9",
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return feed.isGoogle
      ? parseGoogleRssItems(xml, sourceKey, feed.name)
      : parseDirectRssItems(xml, sourceKey, feed.name);
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(sourceFilter) {
  const sourceKeys =
    sourceFilter === "all" ? Object.keys(RSS_FEEDS) : [sourceFilter];

  const results = await Promise.all(sourceKeys.map(fetchFeed));
  let articles = results.flat();

  articles.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  return articles;
}

export { RSS_FEEDS };
