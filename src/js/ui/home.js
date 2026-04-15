/**
 * Pandoos Library — Home View (Panda Meadow Theme)
 * Full-page panda background with all sections floating on top
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

  // Apply panda bg class to main-content itself for the fixed bg trick
  main.classList.add('home-view');

  main.innerHTML = `
    <!-- ===== FULL-PAGE PANDA BG LAYERS (position:fixed, behind everything) ===== -->
    <div class="panda-page-bg"></div>
    <div class="panda-page-overlay"></div>
    <div class="panda-orb panda-orb-a"></div>
    <div class="panda-orb panda-orb-b"></div>

    <!-- ===== ALL PAGE CONTENT ON TOP ===== -->
    <div class="panda-page-content anim-fade-in">

      <!-- HERO SECTION -->
      <div style="padding:64px 40px 48px;">
        <div class="hero-eyebrow" style="color:var(--meadow-bright)">
          <img src="/assets/logo.png" style="width:28px;height:28px;object-fit:contain;border-radius:6px" alt="Panda logo" />
          <span>Pandoos Library</span>
          <span style="opacity:0.5">·</span>
          <span style="color:var(--teal-mid)">Panda Beats</span>
        </div>

        <h1 class="hero-title" style="text-shadow:0 2px 28px rgba(0,0,0,0.95);margin-top:14px;color:#fff">
          ${_greeting()},<br>
          <span class="text-gradient" style="background:linear-gradient(135deg,#8ed87a,#56c0c0);-webkit-background-clip:text;background-clip:text">Music Lover</span> 🎵
        </h1>
        <p class="hero-sub" style="color:rgba(238,244,229,0.82);text-shadow:0 1px 12px rgba(0,0,0,0.95)">
          Relax &amp; vibe to real music, curated by your favourite panda 🐼
        </p>

        <div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap">
          <button class="btn btn-primary" id="hero-play-all"
            style="background:var(--meadow-mid);box-shadow:0 4px 20px var(--meadow-glow);color:#0c0f0b;font-weight:800">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M5 3l14 9-14 9V3z"/></svg>
            Play All
          </button>
          <button class="btn btn-ghost" data-nav="search"
            style="border-color:rgba(142,216,122,0.3);color:var(--meadow-bright);background:rgba(12,15,11,0.45);backdrop-filter:blur(14px)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Discover
          </button>
        </div>
      </div>

      <!-- THIN DIVIDER -->
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(108,194,87,0.35),transparent);margin:0 32px 4px"></div>

      <!-- FEATURED PLAYLISTS -->
      <div class="content-section" style="padding-top:32px">
        <div class="section-heading">
          <h2 style="color:#fff;text-shadow:0 2px 16px rgba(0,0,0,0.95)">🎍 Panda's Playlists</h2>
          <span class="see-all" data-nav="library">See all</span>
        </div>
        <div class="scroll-row" id="playlist-row">
          ${playlists.filter(p => p.id !== 'pl_liked').map(_renderPlaylistCard).join('')}
        </div>
      </div>

      <!-- ALL SONGS -->
      <div class="content-section" style="padding-top:8px">
        <div class="section-heading">
          <h2 style="color:#fff;text-shadow:0 2px 16px rgba(0,0,0,0.95)">🎵 All Tracks</h2>
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

      <!-- FOOTER QUOTE -->
      <div style="padding:24px 32px 60px;">
        <div style="
          display:inline-flex;align-items:center;gap:14px;
          background:rgba(8,12,8,0.72);
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(108,194,87,0.3);border-radius:20px;
          padding:18px 28px;
          box-shadow:0 4px 28px rgba(0,0,0,0.65),0 0 0 1px rgba(108,194,87,0.08);
        ">
          <span style="font-size:22px;animation:float 4s ease-in-out infinite">🌿</span>
          <span style="font-size:14px;color:var(--meadow-bright);font-style:italic;font-weight:700;font-family:var(--font-display);letter-spacing:0.01em;line-height:1.5">
            "Life is short — relax like a panda and enjoy good music."
          </span>
          <span style="font-size:22px;animation:float 4s ease-in-out 2s infinite">🐼</span>
        </div>
      </div>

    </div><!-- /panda-page-content -->
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
    <div class="music-card glass-card" style="width:190px" data-playlist-id="${pl.id}" role="button" tabindex="0">
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
    <div class="music-card glass-card" data-song-id="${song.id}" role="button" tabindex="0" aria-label="${song.title} by ${song.artist}">
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
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-top:2px">
        <div style="min-width:0">
          <div class="card-title">${song.title}</div>
          <div class="card-subtitle">${song.artist}</div>
        </div>
        <button class="card-expand-btn" data-song-expand="${song.id}" aria-label="View details" title="View song details"
          style="flex-shrink:0;margin-top:2px;width:22px;height:22px;border-radius:50%;background:rgba(108,194,87,0.12);border:1px solid var(--color-border);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--color-text-muted);transition:all 180ms ease;font-size:11px">
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
    const songPlay = e.target.closest('[data-song-play]');
    if (songPlay) { e.stopPropagation(); playSong(songPlay.dataset.songPlay, allIds); return; }

    const expand = e.target.closest('[data-song-expand]');
    if (expand) {
      e.stopPropagation();
      playSong(expand.dataset.songExpand, allIds);
      setTimeout(openOverlay, 120);
      return;
    }

    const songCard = e.target.closest('[data-song-id]');
    if (songCard) { playSong(songCard.dataset.songId, allIds); return; }

    const plPlay = e.target.closest('[data-playlist-play]');
    if (plPlay) {
      e.stopPropagation();
      const pl = playlists.find(p => p.id === plPlay.dataset.playlistPlay);
      if (pl?.songIds.length) playSong(pl.songIds[0], pl.songIds);
      return;
    }

    const plCard = e.target.closest('[data-playlist-id]');
    if (plCard && !e.target.closest('[data-playlist-play]')) navigate('playlist', { id: plCard.dataset.playlistId });
  });
}
