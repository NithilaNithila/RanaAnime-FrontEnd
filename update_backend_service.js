const fs = require('fs');
const path = 'D:/Anime/backend/src/services/streamingService.js';
const content = `const NodeCache = require("node-cache");
const allAnimeService = require("./allAnimeService");
const anipubService = require("./anipubService");
const watchanimeworldService = require("./watchanimeworldService");

const cache = new NodeCache({ stdTTL: 600 });

const VALID_SOURCES = ["123anime", "anipub", "watchanimeworld"];

const SOURCE_FRIENDLY = { "123anime": "123Anime", anipub: "Anipub", watchanimeworld: "WatchAnimeWorld" };

const sourceHandlers = {
  "123anime": async (title, episode, language) => {
    const slug = await allAnimeService.resolveSlug(title, language);
    if (!slug) return { success: false, reason: "Anime not found on 123Anime" };
    const stream = await allAnimeService.getEpisodeStreamInfo(slug, episode);
    if (!stream?.success || !stream.data?.embedUrl) return { success: false, reason: "Episode not available on 123Anime" };        
    return {
      success: true,
      source: "123anime",
      language,
      embedUrl: stream.data.embedUrl,
      directM3u8: stream.data.directM3u8 || null,
      cdnHeaders: stream.data.cdnHeaders || null,
      intro: stream.data.intro || null,
      outro: stream.data.outro || null,
      tracks: stream.data.tracks || [],
      slug,
      episode,
    };
  },
  anipub: async (title, episode, language) => {
    const result = await anipubService.getStream(title, episode, language);
    if (result?.success) return result;
    return { success: false, reason: result?.reason || "Episode not available on Anipub" };
  },
  watchanimeworld: async (title, episode, language, season) => {
    const result = await watchanimeworldService.getStream(title, episode, season);
    if (result?.success) return result;
    return { success: false, reason: result?.reason || "Episode not available on WatchAnimeWorld" };
  },
};

const getStream = async (title, episode, language = "sub", source = "123anime", season) => {
  const normalizedSource = source.toLowerCase();

  const cacheKey = \`stream_\${title}_\${episode}_\${language}_\${normalizedSource}_\${season || "any"}\`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  console.log(\`[streaming] getStream: title="\${title}" ep=\${episode} season=\${season || "N/A"} source=\${normalizedSource} lang=\${language}\`);

  const attemptedSources = [];

  // Try the primary source first
  try {
    const primaryResult = await sourceHandlers[normalizedSource](title, episode, language, season);
    attemptedSources.push({ 
      id: normalizedSource, 
      name: SOURCE_FRIENDLY[normalizedSource] || normalizedSource, 
      success: !!primaryResult?.success, 
      reason: primaryResult?.reason || (primaryResult?.success ? "OK" : "Unknown error")
    });

    if (primaryResult?.success) {
      const finalResult = { ...primaryResult, attemptedSources };
      cache.set(cacheKey, finalResult, 600);
      return finalResult;
    }
  } catch (err) {
    attemptedSources.push({ 
      id: normalizedSource, 
      name: SOURCE_FRIENDLY[normalizedSource] || normalizedSource, 
      success: false, 
      reason: err.message 
    });
  }

  // Fallback to others in parallel
  const fallbacks = VALID_SOURCES.filter(s => s !== normalizedSource);
  const fallbackResults = await Promise.all(fallbacks.map(async (s) => {
    try {
      const res = await sourceHandlers[s](title, episode, language, season);
      return { id: s, ...res };
    } catch (err) {
      return { id: s, success: false, reason: err.message };
    }
  }));

  fallbackResults.forEach(r => {
    attemptedSources.push({ 
      id: r.id, 
      name: SOURCE_FRIENDLY[r.id] || r.id, 
      success: !!r.success, 
      reason: r.reason || (r.success ? "OK" : "Unknown error")
    });
  });

  const successful = fallbackResults.find(r => r.success);
  if (successful) {
    const finalResult = { ...successful, attemptedSources };
    cache.set(cacheKey, finalResult, 600);
    return finalResult;
  }

  const failed = {
    success: false,
    message: "No stream available from any source. Try again later or check another episode.",
    attemptedSources
  };
  cache.set(cacheKey, failed, 120);
  return failed;
};

module.exports = { getStream };
`;
fs.writeFileSync(path, content);
console.log('Successfully updated streamingService.js');
