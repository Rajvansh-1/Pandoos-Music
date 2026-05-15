/**
 * Pandoos Music — Lightning Lyrics Engine v3 ⚡
 *
 * Multi-source parallel race with Bollywood/Hindi support:
 * 1. LRCLib /api/get  — exact match, fastest for English/known tracks
 * 2. LRCLib /api/search — fuzzy match, catches variations
 * 3. Happi.dev — best Bollywood/Hindi coverage (free tier)
 * 4. lyrics.ovh — plain text English fallback
 *
 * Fixes vs v2:
 * - cleanForSearch: no longer strips parentheses (Bollywood song names use them)
 * - Label artist detection: T-Series etc → skips for LRCLib, uses title only
 * - Scroll: scrollIntoView replaces broken offsetTop calculation
 * - Happi.dev source added for Hindi songs
 */

const memCache = new Map();
const STORAGE_KEY = 'pandoos_lyrics_v3';
const MAX_CACHE = 150;

// ── Persistent cache helpers ────────────────────────────────────────────────
function loadDiskCache() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveDiskCache(cache) {
  try {
    const keys = Object.keys(cache);
    if (keys.length > MAX_CACHE) {
      keys.slice(0, Math.floor(keys.length / 2)).forEach(k => delete cache[k]);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch { /* storage full */ }
}

function getCached(key) {
  if (memCache.has(key)) return memCache.get(key);
  const disk = loadDiskCache();
  if (disk[key]) { memCache.set(key, disk[key]); return disk[key]; }
  return null;
}

function setCache(key, data) {
  memCache.set(key, data);
  const disk = loadDiskCache();
  disk[key] = data;
  saveDiskCache(disk);
}

// ── Known music label channels (not real artists) ───────────────────────────
const MUSIC_LABELS = new Set([
  't-series', 'tseries', 'sony music', 'eros now', 'zee music',
  'saregama', 'tips music', 'universal music', 'warner music',
  'yrf music', 'dharma music', 'jio saavn', 'jiosaavn',
  'speed records', 'venus music', 'shemaroo', 'rajshri music',
  'viacom18 music', 'color tv', 'star music',
]);

function isLabel(artist) {
  return MUSIC_LABELS.has((artist || '').toLowerCase().trim());
}

// ── Clean for search ─────────────────────────────────────────────────────────
// v3: Only remove YouTube noise — preserve Bollywood movie names in parentheses
function cleanForSearch(str) {
  if (!str) return '';
  return str
    // Remove YouTube noise suffixes only
    .replace(/\s*(?:official\s+(?:video|audio|music\s+video|lyric\s+video|lyrics|mv|visualizer|teaser|trailer|song))/gi, '')
    .replace(/\s*(?:full\s+(?:video|audio|song|hd|4k))/gi, '')
    .replace(/\s*\|\s*(?:4k|hd|hq|1080p|720p)\s*$/gi, '')
    // Remove trailing " - YouTube" etc
    .replace(/\s*-\s*youtube\s*$/gi, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// ── LRC Parser ───────────────────────────────────────────────────────────────
function parseSyncedLyrics(lrcString) {
  if (!lrcString) return [];
  const lines = lrcString.split('\n');
  const result = [];
  // Support both [mm:ss.xx] and [mm:ss.xxx]
  const timeRegex = /\[(\d{1,2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    timeRegex.lastIndex = 0;
    const match = timeRegex.exec(line);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const msStr = match[3];
      const ms = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
      const time = min * 60 + sec + ms / 1000;
      const text = line.replace(/\[\d{1,2}:\d{2}\.\d{2,3}\]/g, '').trim();
      if (text) result.push({ time, text });
    }
  }
  return result;
}

// ── Source 1: LRCLib exact ────────────────────────────────────────────────────
async function fetchFromLRCLibExact(artist, title, duration) {
  // Skip label artists for exact match — they won't be in LRCLib
  const searchArtist = isLabel(artist) ? '' : artist;

  const params = new URLSearchParams({ track_name: title });
  if (searchArtist) params.set('artist_name', searchArtist);
  if (duration && duration > 0) params.set('duration', String(Math.round(duration)));

  const res = await fetch(`https://lrclib.net/api/get?${params}`, {
    headers: { 'User-Agent': 'Pandoos Music v3.0' },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.syncedLyrics) return { plain: data.plainLyrics || null, synced: parseSyncedLyrics(data.syncedLyrics) };
  if (data.plainLyrics)  return { plain: data.plainLyrics, synced: [] };
  return null;
}

// ── Source 2: LRCLib search (fuzzy) ─────────────────────────────────────────
async function fetchFromLRCLibSearch(artist, title) {
  // For label channels, search title only; otherwise "title artist"
  const query = isLabel(artist) ? title : `${title} ${artist}`;
  const res = await fetch(
    `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
    {
      headers: { 'User-Agent': 'Pandoos Music v3.0' },
      signal: AbortSignal.timeout(5000),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;

  // Prefer synced, then any
  const best = data.find(d => d.syncedLyrics) || data[0];
  if (best.syncedLyrics) return { plain: best.plainLyrics || null, synced: parseSyncedLyrics(best.syncedLyrics) };
  if (best.plainLyrics)  return { plain: best.plainLyrics, synced: [] };
  return null;
}

// ── Source 3: Happi.dev (Bollywood / Hindi champion) ─────────────────────────
async function fetchFromHappi(artist, title) {
  const HAPPI_KEY = import.meta.env.VITE_HAPPI_API_KEY;
  if (!HAPPI_KEY) return null;

  try {
    const q = encodeURIComponent(`${title} ${isLabel(artist) ? '' : artist}`.trim());
    const searchRes = await fetch(
      `https://api.happi.dev/v1/music?q=${q}&limit=5&type=song`,
      {
        headers: { 'x-happi-key': HAPPI_KEY },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    if (!searchData?.result?.length) return null;

    // Pick best match
    const match = searchData.result[0];
    const lyricsRes = await fetch(match.api_lyrics, {
      headers: { 'x-happi-key': HAPPI_KEY },
      signal: AbortSignal.timeout(4000),
    });
    if (!lyricsRes.ok) return null;
    const lyricsData = await lyricsRes.json();
    if (lyricsData?.result?.lyrics) {
      return { plain: lyricsData.result.lyrics, synced: [] };
    }
  } catch { /* timeout or network */ }
  return null;
}

// ── Source 4: lyrics.ovh (English plain text fallback) ───────────────────────
async function fetchFromLyricsOvh(artist, title) {
  if (isLabel(artist)) return null; // Won't work with label names
  try {
    const res = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.lyrics) return { plain: data.lyrics, synced: [] };
  } catch { /* cors / timeout */ }
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchLyrics(artist, title, duration) {
  const cleanArtist = cleanForSearch(artist);
  const cleanTitle  = cleanForSearch(title);

  if (!cleanTitle) return { plain: null, synced: [] };

  const cacheKey = `${cleanArtist}::${cleanTitle}`.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const result = await raceLyricsSources(cleanArtist, cleanTitle, duration);

  if (result && (result.synced.length > 0 || result.plain)) {
    setCache(cacheKey, result);
  }

  return result || { plain: null, synced: [] };
}

async function raceLyricsSources(artist, title, duration) {
  return new Promise((resolve) => {
    let resolved  = false;
    let bestPlain = null;
    let completed = 0;
    const total   = 4;

    const done = (result) => {
      if (resolved) return;
      resolved = true;
      resolve(result || { plain: null, synced: [] });
    };

    const handle = (val) => {
      if (resolved) return;
      completed++;

      if (val?.synced?.length > 0) {
        // Synced lyrics = instant win
        done(val);
        return;
      }
      if (val?.plain && !bestPlain) {
        bestPlain = val;
      }
      if (completed === total) {
        done(bestPlain);
      }
    };

    // Fire all 4 sources in parallel
    fetchFromLRCLibExact(artist, title, duration).then(handle).catch(() => handle(null));
    fetchFromLRCLibSearch(artist, title).then(handle).catch(() => handle(null));
    fetchFromHappi(artist, title).then(handle).catch(() => handle(null));
    fetchFromLyricsOvh(artist, title).then(handle).catch(() => handle(null));

    // Hard timeout 7s
    setTimeout(() => { if (!resolved) done(bestPlain); }, 7000);
  });
}

export function clearLyricsCache() {
  memCache.clear();
  localStorage.removeItem(STORAGE_KEY);
}
