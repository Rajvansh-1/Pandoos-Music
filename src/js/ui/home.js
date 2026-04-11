/**
 * Pandoos Library — Home View (Panda Meadow Theme)
 * Uses relax.jpeg as hero background + logo.png
 */

import { getState, subscribe } from '../store.js';
import { navigate } from '../router.js';
import { playSong } from '../player.js';
import { openOverlay } from './overlay.js';
import { pluralize } from '../utils.js';

export function initHome() {
  subscribe('change:songs', () => {
    if (getState().currentView === 'home') renderHome();
  });
}

export function renderHome() {
  const main = document.getElementById('main-content');
  if (!main) return;
  const { songs, playlists } = getState();

  main.innerHTML = `
    <!-- ===== HERO with relax.jpeg ===== -->
    <div class="hero-banner anim-fade-in" style="position:relative;padding:0;min-height:380px;overflow:hidden">
      <!-- Background image -->
      <div style="
        position:absolute;inset:0;
        background:url('/assets/relax.jpeg') center/cover no-repeat;
        filter:brightness(0.45) saturate(1.2);
        transform:scale(1.05);
      "></div>
      <!-- Gradient overlay -->
      <div style="
        position:absolute;inset:0;
        background:linear-gradient(160deg,
          rgba(12,15,11,0.3) 0%,
          rgba(12,15,11,0.6) 50%,
          rgba(12,15,11,1) 100%);
      "></div>

      <!-- Floating meadow orbs -->
      <div class="hero-orb hero-orb-1" style="background:radial-gradient(circle,rgba(108,194,87,0.22) 0%,transparent 70%)"></div>
      <div class="hero-orb hero-orb-3" style="background:radial-gradient(circle,rgba(86,192,192,0.15) 0%,transparent 70%)"></div>

      <!-- Hero content -->
      <div style="position:relative;z-index:1;padding:60px 40px 72px">
        <div class="hero-eyebrow" style="color:var(--meadow-bright)">
          <img src="/assets/logo.png" style="width:28px;height:28px;object-fit:contain;border-radius:6px" alt="Panda logo" />
          <span>Pandoos Library</span>
          <span style="opacity:0.5">·</span>
          <span style="color:var(--teal-mid)">Panda Beats</span>
        </div>

        <h1 class="hero-title" style="text-shadow:0 2px 20px rgba(0,0,0,0.8)">
          ${_greeting()},<br>
          <span class="text-gradient" style="background:linear-gradient(135deg,#8ed87a,#56c0c0);-webkit-background-clip:text;background-clip:text">Music Lover</span> 🎵
        </h1>
        <p class="hero-sub" style="color:rgba(238,244,229,0.65)">
          Relax & vibe to real music, curated by your favourite panda 🐼
        </p>

        <div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap">
          <button class="btn btn-primary" id="hero-play-all" style="background:var(--meadow-mid);box-shadow:0 4px 20px var(--meadow-glow);color:#0c0f0b;font-weight:800">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M5 3l14 9-14 9V3z"/></svg>
            Play All
          </button>
          <button class="btn btn-ghost" data-nav="search" style="border-color:rgba(142,216,122,0.2);color:var(--meadow-bright)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Discover
          </button>
        </div>
      </div>
    </div>

    <!-- ===== FEATURED PLAYLISTS ===== -->
    <div class="content-section" style="padding-top:32px">
      <div class="section-heading">
        <h2>🎍 Panda's Playlists</h2>
        <span class="see-all" data-nav="library">See all</span>
      </div>
      <div class="scroll-row" id="playlist-row">
        ${playlists.filter(p => p.id !== 'pl_liked').map(_renderPlaylistCard).join('')}
      </div>
    </div>

    <!-- ===== ALL SONGS ===== -->
    <div class="content-section" style="padding-top:0">
      <div class="section-heading">
        <h2>🎵 All Tracks</h2>
        <span class="see-all">${pluralize(songs.length, 'track')}</span>
      </div>

      ${songs.length === 0
        ? `<div class="empty-state">
            <div class="empty-icon">🐼</div>
            <h3>Fetching music…</h3>
            <p>Your panda is waking up from a nap 😴</p>
          </div>`
        : `<div class="card-grid stagger" id="song-grid">
            ${songs.map(_renderSongCard).join('')}
           </div>`
      }
    </div>

    <!-- Panda footer quote -->
    <div style="padding:20px 32px 48px;display:flex;align-items:center;gap:12px;opacity:0.35">
      <span style="font-size:16px">🌿</span>
      <span style="font-size:12px;color:var(--color-text-muted);font-style:italic">"Life is short — relax like a panda and enjoy good music."</span>
      <span style="font-size:16px">🌿</span>
    </div>
  `;

  _bind(main, songs, playlists);
}

function _greeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function _renderPlaylistCard(pl) {
  return `
    <div class="music-card" style="width:190px" data-playlist-id="${pl.id}" role="button" tabindex="0">
      <div class="card-art">
        <div class="card-art-fallback" style="background:${pl.gradient}">
          <span style="font-size:3.5rem;z-index:1;position:relative">${pl.emoji}</span>
        </div>
        <div class="card-play-btn" data-playlist-play="${pl.id}">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M5 3l14 9-14 9V3z"/></svg>
        </div>
      </div>
      <div class="card-title">${pl.name}</div>
      <div class="card-subtitle">${pl.description}</div>
    </div>`;
}

function _renderSongCard(song) {
  const hasArt = !!song.coverUrl;
  return `
    <div class="music-card" data-song-id="${song.id}" role="button" tabindex="0" aria-label="${song.title} by ${song.artist}">
      <div class="card-art">
        ${hasArt
          ? `<img class="card-art-img" src="${song.coverUrl}" alt="${song.title}" loading="lazy"
               onerror="this.parentElement.innerHTML='<div class=\\'card-art-fallback\\' style=\\'background:${song.gradient}\\'><span style=\\'z-index:1;position:relative;font-size:2.5rem\\'>${song.emoji}</span></div>'">`
          : `<div class="card-art-fallback" style="background:${song.gradient}">
               <span style="z-index:1;position:relative;font-size:2.5rem">${song.emoji}</span>
             </div>`
        }
        <div class="card-play-btn" data-song-play="${song.id}">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M5 3l14 9-14 9V3z"/></svg>
        </div>
        ${song.source === 'jamendo' ? '<div class="featured-label">Live</div>' : ''}
      </div>
      <!-- Info + expand icon -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-top:2px">
        <div style="min-width:0">
          <div class="card-title">${song.title}</div>
          <div class="card-subtitle">${song.artist}</div>
        </div>
        <button class="card-expand-btn" data-song-expand="${song.id}" aria-label="View details" title="View song details"
          style="flex-shrink:0;margin-top:2px;width:22px;height:22px;border-radius:50%;background:rgba(108,194,87,0.1);border:1px solid var(--color-border);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--color-text-muted);transition:all 180ms ease;font-size:11px">
          ↗
        </button>
      </div>
    </div>`;
}

function _bind(main, songs, playlists) {
  const allIds = songs.map(s => s.id);

  main.querySelector('#hero-play-all')?.addEventListener('click', () => {
    if (songs.length) playSong(songs[0].id, allIds);
  });
  main.querySelectorAll('[data-nav]').forEach(el =>
    el.addEventListener('click', () => navigate(el.dataset.nav))
  );

  main.addEventListener('click', e => {
    // Play button on song card
    const songPlay = e.target.closest('[data-song-play]');
    if (songPlay) { e.stopPropagation(); playSong(songPlay.dataset.songPlay, allIds); return; }

    // Expand button → open overlay
    const expand = e.target.closest('[data-song-expand]');
    if (expand) {
      e.stopPropagation();
      playSong(expand.dataset.songExpand, allIds);
      setTimeout(openOverlay, 120); // slight delay so song loads first
      return;
    }

    // Click on card body → play song
    const songCard = e.target.closest('[data-song-id]');
    if (songCard) { playSong(songCard.dataset.songId, allIds); return; }

    // Playlist play btn
    const plPlay = e.target.closest('[data-playlist-play]');
    if (plPlay) {
      e.stopPropagation();
      const pl = playlists.find(p => p.id === plPlay.dataset.playlistPlay);
      if (pl?.songIds.length) playSong(pl.songIds[0], pl.songIds);
      return;
    }

    // Playlist card → navigate
    const plCard = e.target.closest('[data-playlist-id]');
    if (plCard && !e.target.closest('[data-playlist-play]')) navigate('playlist', { id: plCard.dataset.playlistId });
  });
}
