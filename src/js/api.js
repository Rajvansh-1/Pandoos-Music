/**
 * Pandoos Library — Music API Layer
 * Primary: Jamendo API (free, real music with cover art + MP3 streams)
 * Fallback: Local /songs/ directory
 *
 * Jamendo API: https://developer.jamendo.com/v3.0
 * Client ID: b6747d04 (public demo key)
 */

import { sanitizeName, generateGradient, generateEmoji, hashCode } from './utils.js';

const JAMENDO_CLIENT_ID = 'b6747d04';
const JAMENDO_BASE      = 'https://api.jamendo.com/v3.0';

/**
 * @typedef {Object} Song
 * @property {string} id
 * @property {string} filename
 * @property {string} src        - direct MP3 URL
 * @property {string} title
 * @property {string} artist
 * @property {string} album
 * @property {string} coverUrl   - album art URL (or '')
 * @property {string} gradient   - CSS gradient fallback
 * @property {string} emoji
 * @property {number} duration
 * @property {string} source     - 'jamendo' | 'local'
 */

// ====================================================
//  JAMENDO API FETCHERS
// ====================================================

/**
 * Fetch popular tracks from Jamendo
 */
export async function fetchJamendoTracks(limit = 50) {
  const url = new URL(`${JAMENDO_BASE}/tracks/`);
  url.searchParams.set('client_id',  JAMENDO_CLIENT_ID);
  url.searchParams.set('format',     'json');
  url.searchParams.set('limit',      String(limit));
  url.searchParams.set('offset',     '0');
  url.searchParams.set('order',      'popularity_total');
  url.searchParams.set('include',    'musicinfo');
  url.searchParams.set('audioformat','mp32');

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Jamendo API error: ${resp.status}`);
  const json = await resp.json();
  return (json.results || []).map(_buildJamendoSong);
}

/**
 * Search Jamendo tracks
 */
export async function searchJamendoTracks(query, limit = 30) {
  const url = new URL(`${JAMENDO_BASE}/tracks/`);
  url.searchParams.set('client_id',  JAMENDO_CLIENT_ID);
  url.searchParams.set('format',     'json');
  url.searchParams.set('limit',      String(limit));
  url.searchParams.set('search',     query);
  url.searchParams.set('include',    'musicinfo');
  url.searchParams.set('audioformat','mp32');

  const resp = await fetch(url.toString());
  if (!resp.ok) return [];
  const json = await resp.json();
  return (json.results || []).map(_buildJamendoSong);
}

/**
 * Fetch tracks by tags/mood from Jamendo
 */
export async function fetchJamendoByTag(tag, limit = 20) {
  const url = new URL(`${JAMENDO_BASE}/tracks/`);
  url.searchParams.set('client_id',  JAMENDO_CLIENT_ID);
  url.searchParams.set('format',     'json');
  url.searchParams.set('limit',      String(limit));
  url.searchParams.set('tags',       tag);
  url.searchParams.set('include',    'musicinfo');
  url.searchParams.set('audioformat','mp32');
  url.searchParams.set('order',      'popularity_total');

  const resp = await fetch(url.toString());
  if (!resp.ok) return [];
  const json = await resp.json();
  return (json.results || []).map(_buildJamendoSong);
}

/**
 * Build a Song from a Jamendo API result
 */
function _buildJamendoSong(item) {
  const id      = `jam_${item.id}`;
  const title   = item.name || 'Unknown Track';
  const artist  = item.artist_name || 'Unknown Artist';
  const album   = item.album_name  || 'Jamendo';
  const src     = item.audio || item.audiodownload || '';
  const coverUrl= item.image || item.album_image || '';

  return {
    id,
    filename:  `${item.id}.mp3`,
    src,
    title,
    artist,
    album,
    coverUrl,
    gradient:  generateGradient(id),
    emoji:     generateEmoji(title),
    duration:  parseInt(item.duration, 10) || 0,
    source:    'jamendo',
    shareUrl:  item.shareurl || '',
    tags:      item.musicinfo?.tags?.genres || [],
  };
}

// ====================================================
//  LOCAL SONG FETCHER (fallback)
// ====================================================

export async function fetchLocalSongs() {
  try {
    const response = await fetch('/songs/');
    if (!response.ok) return [];
    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));

    const rawFilenames = links
      .map(a => {
        const href = decodeURIComponent(a.getAttribute('href') || '');
        const text = (a.textContent || '').trim();
        for (const c of [href, text]) {
          if (!c) continue;
          const clean = c.split('?')[0].split('#')[0];
          const parts = clean.replace(/\\/g, '/').split('/');
          const last  = parts[parts.length - 1];
          if (last.toLowerCase().endsWith('.mp3')) return last;
        }
        return null;
      })
      .filter(Boolean);

    const seen = new Map();
    rawFilenames.forEach(fn => {
      const norm = fn.replace(/\s*-\s*copy\s*/gi, '').trim();
      if (!seen.has(norm) || !fn.toLowerCase().includes('copy')) {
        seen.set(norm, fn.toLowerCase().includes('copy') ? (seen.get(norm) || null) : fn);
      }
    });

    return Array.from(seen.values()).filter(Boolean).map(_buildLocalSong);
  } catch {
    return [];
  }
}

function _buildLocalSong(filename) {
  const clean  = sanitizeName(filename);
  const id     = 'local_' + hashCode(filename).toString(36);
  const dashIdx = clean.indexOf(' - ');
  let title    = clean;
  let artist   = 'Pandoos Library';
  if (dashIdx !== -1) {
    const a = clean.slice(0, dashIdx).trim();
    const b = clean.slice(dashIdx + 3).trim();
    [title, artist] = b.split(' ').length <= 3 ? [a, b] : [b, a];
  }
  return {
    id,
    filename,
    src:      `/songs/${encodeURIComponent(filename)}`,
    title:    title || clean,
    artist,
    album:    'Pandoos Library',
    coverUrl: '',
    gradient: generateGradient(filename),
    emoji:    generateEmoji(filename),
    duration: 0,
    source:   'local',
    tags:     [],
  };
}

// ====================================================
//  MAIN FETCH — tries Jamendo first, falls back to local
// ====================================================

export async function fetchSongs() {
  try {
    const jamendoTracks = await fetchJamendoTracks(50);
    if (jamendoTracks.length > 0) return jamendoTracks;
  } catch (err) {
    console.warn('Jamendo unavailable, using local songs:', err.message);
  }
  return fetchLocalSongs();
}

// ====================================================
//  SEARCH
// ====================================================

export async function searchSongs(songs, query) {
  const q = query.toLowerCase().trim();
  if (!q) return songs;

  // First try local filter
  const local = songs.filter(s =>
    s.title.toLowerCase().includes(q)  ||
    s.artist.toLowerCase().includes(q) ||
    s.album.toLowerCase().includes(q)
  );

  // If most songs are from Jamendo, also do API search
  const jamendoSongs = songs.filter(s => s.source === 'jamendo');
  if (jamendoSongs.length > 10 && local.length < 5) {
    try {
      const apiResults = await searchJamendoTracks(query, 20);
      // Merge without duplicates
      const existing = new Set(songs.map(s => s.id));
      const fresh = apiResults.filter(s => !existing.has(s.id));
      return [...local, ...fresh];
    } catch {
      return local;
    }
  }

  return local;
}

// ====================================================
//  PLAYLIST BUILDER
// ====================================================

export function buildPlaylists(songs) {
  if (!songs.length) return [];
  const allIds = songs.map(s => s.id);
  const chunk = (arr, n) => {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  };
  const thirds = chunk(allIds, Math.ceil(allIds.length / 3));

  return [
    {
      id: 'pl_featured', name: 'Pandoos Picks',
      description: 'Hand-curated tracks — something for every mood 🐼',
      songIds: allIds,
      gradient: 'linear-gradient(135deg, #1a3a2a 0%, #0d0e0c 100%)',
      emoji: '✨', type: 'playlist',
    },
    {
      id: 'pl_chill', name: 'Bamboo Chill',
      description: 'Peaceful tracks for quiet moments under the bamboo 🌿',
      songIds: thirds[0] || allIds,
      gradient: 'linear-gradient(135deg, #0d2b1e 0%, #0d0e0c 100%)',
      emoji: '🎍', type: 'playlist',
    },
    {
      id: 'pl_energy', name: 'Panda Power',
      description: 'High-energy music to unleash your inner panda 🐼🔥',
      songIds: thirds[1] || allIds,
      gradient: 'linear-gradient(135deg, #1e1a0d 0%, #0d0e0c 100%)',
      emoji: '⚡', type: 'playlist',
    },
    {
      id: 'pl_love', name: 'Moonlit Melodies',
      description: 'Romantic songs for late nights and soft moonlight 🌙',
      songIds: thirds[2] || allIds,
      gradient: 'linear-gradient(135deg, #1f0d1a 0%, #0d0e0c 100%)',
      emoji: '🌙', type: 'playlist',
    },
    {
      id: 'pl_liked', name: 'Heart Stash',
      description: 'All your favourite tracks, saved for keeps ❤️',
      songIds: [],
      gradient: 'linear-gradient(135deg, #1a0d2b 0%, #0d0e0c 100%)',
      emoji: '❤️', type: 'playlist',
    },
  ];
}

export function getPlaylistById(playlists, id, likedSongs, allSongs) {
  const pl = playlists.find(p => p.id === id);
  if (!pl) return null;
  if (id === 'pl_liked') {
    return { ...pl, songIds: allSongs.filter(s => likedSongs.has(s.id)).map(s => s.id) };
  }
  return pl;
}
