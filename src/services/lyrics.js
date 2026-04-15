/**
 * Pandoos Music — Synced Lyrics Service (Spotify Style)
 * Primary: LRCLib (provides timestamped LRC formatted lyrics)
 * Fallback: lyrics.ovh (plain text fallback)
 */

const cache = new Map();

export async function fetchLyrics(artist, title) {
  const key = `${artist}::${title}`.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const cleanArtist = artist.replace(/ft\..*$/i, '').replace(/feat\..*$/i, '').trim();
  const cleanTitle = title.replace(/\(.*?\)/g, '').trim();

  let result = { plain: null, synced: [] };

  try {
    // Attempt 1: LRCLib (Synced Lyrics)
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`;
    const res = await fetch(url);
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const bestMatch = data[0]; // First result is usually the most relevant exact match
        if (bestMatch.syncedLyrics) {
          result = {
            plain: bestMatch.plainLyrics,
            synced: parseSyncedLyrics(bestMatch.syncedLyrics)
          };
          cache.set(key, result);
          return result;
        } else if (bestMatch.plainLyrics) {
          result.plain = bestMatch.plainLyrics;
        }
      }
    }

    // Attempt 2: Fallback to lyrics.ovh for plain text if LRCLib had no synced lyrics
    if (!result.synced.length) {
      const fbUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
      const fbRes = await fetch(fbUrl);
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (fbData.lyrics) {
          result.plain = fbData.lyrics;
        }
      }
    }
    
    cache.set(key, result);
    return result;
  } catch (err) {
    console.error("Lyrics fetch error:", err);
    return { plain: null, synced: [] };
  }
}

/**
 * Parses raw LRC string into { time: seconds, text: string } array
 */
function parseSyncedLyrics(lrcString) {
  const lines = lrcString.split('\n');
  const result = [];
  // Supports [MM:SS.xx] or [MM:SS.xxx]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  
  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const msLine = match[3];
      const ms = msLine.length === 2 ? parseInt(msLine, 10) * 10 : parseInt(msLine, 10);
      
      const timeInSeconds = min * 60 + sec + ms / 1000;
      const text = line.replace(timeRegex, '').trim();
      
      if (text) {
        result.push({ time: timeInSeconds, text });
      }
    }
  }
  return result;
}
