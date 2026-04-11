/**
 * Pandoos Library — Library View
 */

import { getState, subscribe } from '../store.js';
import { navigate } from '../router.js';
import { playSong } from '../player.js';
import { ICON_PLAY_SM } from '../assets.js';

export function initLibrary() {
  subscribe('change:currentView',  () => { if (getState().currentView === 'library') renderLibrary(); });
  subscribe('change:likedSongs',   () => { if (getState().currentView === 'library') renderLibrary(); });
}

export function renderLibrary() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const { playlists, songs, likedSongs } = getState();

  main.innerHTML = `
    <div class="hero-banner anim-fade-in" style="min-height:140px;padding:32px 32px 48px">
      <div class="hero-orb hero-orb-2" style="opacity:0.2"></div>
      <div class="hero-eyebrow">📚 <span>Your Library</span></div>
      <h1 class="hero-title" style="font-size:clamp(1.8rem,4vw,2.8rem)">
        All Your Music 🐼
      </h1>
      <p class="hero-sub">Playlists, saved songs, and everything you love</p>
    </div>

    <div class="content-section stagger">
      <div class="section-heading"><h2>🎍 Playlists</h2></div>
      <div class="card-grid">
        ${playlists.map(pl => {
          const count = pl.id === 'pl_liked' ? likedSongs.size : pl.songIds.length;
          return `
            <div class="music-card" data-playlist-id="${pl.id}" role="button" tabindex="0" aria-label="Open ${pl.name}">
              <div class="card-art">
                <div class="card-art-fallback" style="background:${pl.gradient}">
                  <span style="z-index:1;font-size:3.2rem">${pl.emoji}</span>
                </div>
                <div class="card-play-btn" data-playlist-play="${pl.id}" aria-label="Play ${pl.name}">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M5 3l14 9-14 9V3z"/></svg>
                </div>
              </div>
              <div class="card-title">${pl.name}</div>
              <div class="card-subtitle">${count} song${count !== 1 ? 's' : ''}</div>
            </div>`;
        }).join('')}
      </div>
    </div>

    <div class="content-section">
      <div class="section-heading">
        <h2>🎵 All Songs</h2>
        <span class="see-all">${songs.length} tracks</span>
      </div>
      <div class="stagger">
        ${songs.map((song, i) => `
          <div class="track-row" data-song-id="${song.id}" data-track-idx="${i}" role="button" tabindex="0" aria-label="Play ${song.title}">
            <div class="track-index-cell">
              <span class="track-num">${i + 1}</span>
              <span class="track-play-icon">${ICON_PLAY_SM}</span>
            </div>
            <div class="track-info">
              <div class="track-thumb">
                ${song.coverUrl
                  ? `<img src="${song.coverUrl}" alt="${song.title}" loading="lazy">`
                  : `<div class="thumb-f" style="background:${song.gradient}">${song.emoji}</div>`
                }
              </div>
              <div class="track-meta">
                <div class="track-title">${song.title}</div>
                <div class="track-artist">${song.artist}</div>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;

  _bind(main, songs, playlists);
}

function _bind(main, songs, playlists) {
  const allIds = songs.map(s => s.id);
  main.addEventListener('click', e => {
    const plPlay = e.target.closest('[data-playlist-play]');
    if (plPlay) {
      e.stopPropagation();
      const pl = playlists.find(p => p.id === plPlay.dataset.playlistPlay);
      if (pl?.songIds.length) playSong(pl.songIds[0], pl.songIds);
      return;
    }
    const plCard = e.target.closest('[data-playlist-id]');
    if (plCard && !e.target.closest('[data-playlist-play]')) {
      navigate('playlist', { id: plCard.dataset.playlistId }); return;
    }
    const row = e.target.closest('[data-song-id]');
    if (row) playSong(row.dataset.songId, allIds);
  });
}
