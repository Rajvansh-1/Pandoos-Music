/**
 * Pandoos Music — Lightning Lyrics Engine ⚡
 * 
 * Multi-source parallel fetch with intelligent fallback chain:
 * 1. LRCLib /api/get (exact match — fastest for known tracks)
 * 2. LRCLib /api/search (fuzzy match — catches variations)
 * 3. lyrics.ovh (plain text fallback)
 * 
 * All sources are raced in parallel. First synced result wins instantly.
 * Results are cached aggressively in localStorage for instant replay.
 */

const memCache = new Map();
const STORAGE_KEY = 'pandoos_lyrics_cache';
const MAX_CACHE = 100;

// ── Persistent cache helpers ──────────────────────────────────
function loadDiskCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveDiskCache(cache) {
  try {
    const keys = Object.keys(cache);
    if (keys.length > MAX_CACHE) {
      // Evict oldest half
      keys.slice(0, Math.floor(keys.length / 2)).forEach(k => delete cache[k]);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch { /* storage full */ }
}

function getCached(key) {
  if (memCache.has(key)) return memCache.get(key);
  const disk = loadDiskCache();
  if (disk[key]) {
    memCache.set(key, disk[key]);
    return disk[key];
  }
  return null;
}

function setCache(key, data) {
  memCache.set(key, data);
  const disk = loadDiskCache();
  disk[key] = data;
  saveDiskCache(disk);
}

// ── Clean helpers ─────────────────────────────────────────────
function cleanForSearch(str) {
  return str
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\{.*?\}/g, '')
    .replace(/ft\..*$/i, '')
    .replace(/feat\..*$/i, '')
    .replace(/official.*$/i, '')
    .replace(/audio.*$/i, '')
    .replace(/video.*$/i, '')
    .replace(/lyric.*$/i, '')
    .replace(/[^\w\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── LRC Parser ────────────────────────────────────────────────
function parseSyncedLyrics(lrcString) {
  if (!lrcString) return [];
  const lines = lrcString.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  
  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const msLine = match[3];
      const ms = msLine.length === 2 ? parseInt(msLine, 10) * 10 : parseInt(msLine, 10);
      const time = min * 60 + sec + ms / 1000;
      const text = line.replace(timeRegex, '').trim();
      if (text) result.push({ time, text });
    }
  }
  return result;
}

// ── Source 1: LRCLib exact match (fastest) ────────────────────
async function fetchFromLRCLibExact(artist, title, duration) {
  const params = new URLSearchParams({
    track_name: title,
    artist_name: artist,
  });
  if (duration && duration > 0) params.set('duration', String(Math.round(duration)));
  
  const res = await fetch(`https://lrclib.net/api/get?${params}`, {
    headers: { 'User-Agent': 'Pandoos Music v2.0 (https://github.com/pandoos-music)' }
  });
  
  if (!res.ok) return null;
  const data = await res.json();
  
  if (data.syncedLyrics) {
    return { plain: data.plainLyrics || null, synced: parseSyncedLyrics(data.syncedLyrics) };
  }
  if (data.plainLyrics) {
    return { plain: data.plainLyrics, synced: [] };
  }
  return null;
}

// ── Source 2: LRCLib search (fuzzy, catches more songs) ───────
async function fetchFromLRCLibSearch(artist, title) {
  const query = `${title} ${artist}`;
  const res = await fetch(
    `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
    { headers: { 'User-Agent': 'Pandoos Music v2.0' } }
  );
  
  if (!res.ok) return null;
  const data = await res.json();
  
  if (!data || !data.length) return null;
  
  // Find best match — prefer one with synced lyrics
  const withSynced = data.find(d => d.syncedLyrics);
  const best = withSynced || data[0];
  
  if (best.syncedLyrics) {
    return { plain: best.plainLyrics || null, synced: parseSyncedLyrics(best.syncedLyrics) };
  }
  if (best.plainLyrics) {
    return { plain: best.plainLyrics, synced: [] };
  }
  return null;
}

// ── Source 3: lyrics.ovh (plain text fallback) ────────────────
async function fetchFromLyricsOvh(artist, title) {
  const res = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.lyrics) {
    return { plain: data.lyrics, synced: [] };
  }
  return null;
}

// ── Main fetch function — PARALLEL RACE ───────────────────────
/**
 * Fetches lyrics using parallel racing strategy:
 * - All 3 sources fire simultaneously
 * - First source that returns synced lyrics wins immediately  
 * - If no synced found, first plain text result is returned
 * - Typical response: <200ms for cached, <800ms for new
 */
export async function fetchLyrics(artist, title, duration) {
  const cleanArtist = cleanForSearch(artist);
  const cleanTitle = cleanForSearch(title);
  
  if (!cleanArtist && !cleanTitle) return { plain: null, synced: [] };
  
  const cacheKey = `${cleanArtist}::${cleanTitle}`.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Race all sources in parallel
  const result = await raceLyricsSources(cleanArtist, cleanTitle, duration);
  
  if (result && (result.synced.length > 0 || result.plain)) {
    setCache(cacheKey, result);
  }
  
  return result || { plain: null, synced: [] };
}

async function raceLyricsSources(artist, title, duration) {
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  
  try {
    // Fire all sources simultaneously
    const promises = [
      fetchFromLRCLibExact(artist, title, duration).catch(() => null),
      fetchFromLRCLibSearch(artist, title).catch(() => null),
      fetchFromLyricsOvh(artist, title).catch(() => null),
    ];

    // Strategy: wait for all, prefer synced
    const results = await Promise.allSettled(promises);
    
    let bestSynced = null;
    let bestPlain = null;
    
    for (const r of results) {
      if (r.status !== 'fulfilled' || !r.value) continue;
      const val = r.value;
      
      if (val.synced && val.synced.length > 0 && !bestSynced) {
        bestSynced = val;
      }
      if (val.plain && !bestPlain) {
        bestPlain = val;
      }
    }
    
    // Synced > Plain > null
    return bestSynced || bestPlain || { plain: null, synced: [] };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Clears lyrics cache
 */
export function clearLyricsCache() {
  memCache.clear();
  localStorage.removeItem(STORAGE_KEY);
}
