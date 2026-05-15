/**
 * Pandoos Music — Personalized Recommendation Engine
 *
 * Works like Spotify's taste profile system:
 *  1. Extracts top artists from play history & liked songs
 *  2. Builds weighted search queries (most-played artists get priority)
 *  3. Discovers similar music via YouTube search
 *  4. Groups results into meaningful "Because you like X" sections
 */

import { searchYouTube } from './youtube.js';

// ─── Taste Profile Extractor ──────────────────────────────────────────────────

/**
 * Derives a ranked taste profile from user data.
 * Returns { topArtists, topGenreQueries, hasTasteData }
 */
export function buildTasteProfile(recentlyPlayed, likedSongs, playStats, allSongs) {
  const artistScore = {};

  // Score from play stats (most replays = highest weight)
  if (playStats && allSongs?.length) {
    Object.entries(playStats).forEach(([songId, count]) => {
      const song = allSongs.find(s => s.id === songId)
               || recentlyPlayed.find(s => s.id === songId);
      if (song?.artist) {
        artistScore[song.artist] = (artistScore[song.artist] || 0) + count * 3;
      }
    });
  }

  // Score from liked songs (each like = 5 points)
  if (likedSongs?.size && allSongs?.length) {
    allSongs
      .filter(s => likedSongs.has(s.id))
      .forEach(s => {
        if (s.artist) artistScore[s.artist] = (artistScore[s.artist] || 0) + 5;
      });
  }

  // Score from recently played (recency decay: latest = highest points)
  recentlyPlayed.forEach((song, idx) => {
    if (song.artist) {
      const recencyScore = Math.max(1, 10 - idx * 0.5); // 10 → 1 over 18 songs
      artistScore[song.artist] = (artistScore[song.artist] || 0) + recencyScore;
    }
  });

  // Sort artists by score descending
  const topArtists = Object.entries(artistScore)
    .sort(([, a], [, b]) => b - a)
    .map(([artist]) => artist)
    .filter(a => a && a !== 'Unknown')
    .slice(0, 8);

  const hasTasteData = topArtists.length > 0;

  return { topArtists, hasTasteData };
}

// ─── Recommendation Sections Builder ─────────────────────────────────────────

/**
 * Builds personalized recommendation sections, Spotify-style.
 * Each section has: { title, reason, songs[] }
 */
export async function buildRecommendationSections(tasteProfile, existingIds = new Set()) {
  const { topArtists, hasTasteData } = tasteProfile;
  const sections = [];

  if (!hasTasteData) return sections; // No data → caller falls back to trending

  const dedupe = (songs) => songs.filter(s => !existingIds.has(s.id));
  const addIds = (songs) => songs.forEach(s => existingIds.add(s.id));

  // ── Section 1: "Because you listen to [Top Artist]" ──────────────────────
  // Deep-dive into the user's #1 most-played artist
  if (topArtists[0]) {
    try {
      const songs = dedupe(await searchYouTube(`${topArtists[0]} best songs`, 8));
      if (songs.length >= 3) {
        sections.push({
          id: 'because_top',
          title: `Because you listen to ${topArtists[0]}`,
          badge: 'TOP PICK',
          songs: songs.slice(0, 6),
        });
        addIds(songs);
      }
    } catch { /* quota hit — skip section */ }
  }

  // ── Section 2: "More like [Artist 2]" ────────────────────────────────────
  if (topArtists[1]) {
    try {
      const songs = dedupe(await searchYouTube(`${topArtists[1]} hits`, 8));
      if (songs.length >= 3) {
        sections.push({
          id: 'because_second',
          title: `More like ${topArtists[1]}`,
          badge: null,
          songs: songs.slice(0, 6),
        });
        addIds(songs);
      }
    } catch { /* skip */ }
  }

  // ── Section 3: Artist Blend (mix two artists the user loves) ─────────────
  if (topArtists[0] && topArtists[2]) {
    try {
      const blendQuery = `${topArtists[0]} ${topArtists[2]} similar songs`;
      const songs = dedupe(await searchYouTube(blendQuery, 8));
      if (songs.length >= 3) {
        sections.push({
          id: 'blend',
          title: `Your Artist Blend`,
          subtitle: `${topArtists[0]} × ${topArtists[2]}`,
          badge: 'AI BLEND',
          songs: songs.slice(0, 6),
        });
        addIds(songs);
      }
    } catch { /* skip */ }
  }

  // ── Section 4: Discover from a lesser-listened artist ────────────────────
  if (topArtists[3]) {
    try {
      const songs = dedupe(await searchYouTube(`${topArtists[3]} songs`, 6));
      if (songs.length >= 2) {
        sections.push({
          id: 'discover',
          title: `Discover: ${topArtists[3]}`,
          badge: 'DISCOVER',
          songs: songs.slice(0, 4),
        });
        addIds(songs);
      }
    } catch { /* skip */ }
  }

  return sections;
}

// ─── "Made For You" Top Picks ─────────────────────────────────────────────────

/**
 * Generates a single "Made For You" row by blending the top 3 artists.
 * Falls back to trending if no taste data.
 */
export async function fetchMadeForYou(topArtists, fallbackSongs = []) {
  if (!topArtists?.length) return fallbackSongs.slice(0, 6);

  try {
    // Pick top 2 artists, search for a mixed playlist
    const query = topArtists.slice(0, 3).join(' ');
    const songs = await searchYouTube(`${query} best hits playlist`, 8);
    return songs.slice(0, 6);
  } catch {
    return fallbackSongs.slice(0, 6);
  }
}
