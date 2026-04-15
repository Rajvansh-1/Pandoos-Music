/**
 * Pandoos Music — Lyrics Service
 * Primary: lyrics.ovh (free, no API key, CORS-enabled)
 * Fallback: Generic message
 */

const LYRICS_API = 'https://api.lyrics.ovh/v1';

const cache = new Map();

export async function fetchLyrics(artist, title) {
  const key = `${artist}::${title}`.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  // Clean up artist/title for better matching
  const cleanArtist = artist
    .replace(/ft\..*$/i, '')
    .replace(/feat\..*$/i, '')
    .replace(/official.*/gi, '')
    .trim();

  const cleanTitle = title
    .replace(/\(.*?\)/g, '')
    .replace(/official.*/gi, '')
    .replace(/lyrics?/gi, '')
    .replace(/hd|4k|8k/gi, '')
    .trim();

  try {
    const url = `${LYRICS_API}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const lyrics = json.lyrics || null;
    cache.set(key, lyrics);
    return lyrics;
  } catch {
    // Try with raw values as fallback
    try {
      const url2 = `${LYRICS_API}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      const res2 = await fetch(url2);
      if (!res2.ok) throw new Error('Not found');
      const json2 = await res2.json();
      const lyrics2 = json2.lyrics || null;
      cache.set(key, lyrics2);
      return lyrics2;
    } catch {
      cache.set(key, null);
      return null;
    }
  }
}
