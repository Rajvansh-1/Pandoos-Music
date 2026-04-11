/**
 * Pandoos Library — Playlist Detail View (Panda Theme)
 */

import { getState, subscribe, toggleLike, isLiked } from '../store.js';
import { getPlaylistById } from '../api.js';
import { playSong } from '../player.js';
import { navigate } from '../router.js';
import { formatTime, pluralize } from '../utils.js';
import { ICON_HEART, ICON_HEART_FILL, ICON_PLAY_SM } from '../assets.js';

let _currentPlaylistId = null;

export function initPlaylist() {
  subscribe('change:currentView', () => {
    const { currentView, currentPlaylistId } = getState();
    if (currentView === 'playlist') renderPlaylist(currentPlaylistId);
  });
  subscribe('change:currentPlaylistId', () => {
    const { currentView, currentPlaylistId } = getState();
    if (currentView === 'playlist') renderPlaylist(currentPlaylistId);
  });
  subscribe('change:likedSongs',   () => _updateLikes());
  subscribe('change:currentIndex', () => _updateActiveRow());
  subscribe('change:isPlaying',    () => _updateActiveRow());
}

export function renderPlaylist(playlistId) {
  const main = document.getElementById('main-content');
  if (!main) return;
  _currentPlaylistId = playlistId;

  const { playlists, songs, likedSongs } = getState();
  const pl = getPlaylistById(playlists, playlistId, likedSongs, songs);

  if (!pl) {
    main.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🐼</div>
        <h3>Playlist not found</h3>
        <p>Navigate home and try again.</p>
      </div>`;
    return;
  }

  const trackSongs  = pl.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
  const totalDur    = trackSongs.reduce((a, s) => a + (s.duration || 0), 0);

  main.innerHTML = `
    <!-- Banner -->
    <div class="playlist-banner anim-fade-in">
      <div class="playlist-banner-bg" style="background:${pl.gradient}"></div>
      <div class="playlist-banner-overlay"></div>
      <div class="playlist-art-lg">
        <div class="thumb-f" style="background:${pl.gradient};font-size:4.5rem">${pl.emoji}</div>
      </div>
      <div class="playlist-banner-info">
        <div class="playlist-type-tag">
          <div class="bamboo-node"></div> Playlist
        </div>
        <h1 class="playlist-banner-title">${pl.name}</h1>
        <p class="playlist-banner-desc">${pl.description}</p>
        <div class="playlist-banner-meta">
          <span>${pluralize(trackSongs.length, 'song')}</span>
          ${totalDur > 0 ? `<span class="meta-dot">•</span><span>${formatTime(totalDur)}</span>` : ''}
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="content-section" style="padding-bottom:8px">
      <div style="display:flex;align-items:center;gap:14px">
        <button class="play-pause-btn" id="pl-play-btn" aria-label="Play playlist" title="Play all">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M5 3l14 9-14 9V3z"/></svg>
        </button>
        <button class="btn btn-ghost btn-sm" id="pl-shuffle-btn" title="Shuffle play">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          Shuffle
        </button>
      </div>
    </div>

    <!-- Track list -->
    <div class="content-section" style="padding-top:0">
      <div id="pl-tracks" class="stagger">
        ${trackSongs.length
          ? trackSongs.map((s, i) => _renderRow(s, i)).join('')
          : `<div class="empty-state" style="min-height:200px">
               <div class="empty-icon">🐼</div>
               <h3>No songs yet</h3>
               <p>${pl.id === 'pl_liked' ? 'Like songs using the ❤️ button to add them here.' : 'This playlist is empty.'}</p>
             </div>`
        }
      </div>
    </div>
  `;

  _bind(main, pl, trackSongs);
}

function _renderRow(song, idx) {
  const { queue, currentIndex, isPlaying } = getState();
  const isActive = song.id === queue[currentIndex];
  const liked    = isLiked(song.id);
  const dur      = song.duration > 0 ? formatTime(song.duration) : '—';
  const hasArt   = !!song.coverUrl;

  return `
    <div class="track-row ${isActive ? 'active' : ''}" data-song-id="${song.id}" data-track-idx="${idx}" role="button" tabindex="0" aria-label="Play ${song.title}">
      <div class="track-index-cell">
        ${isActive
          ? `<div class="now-playing-bars ${!isPlaying ? 'paused' : ''}"><span></span><span></span><span></span></div>`
          : `<span class="track-num">${idx + 1}</span>
             <span class="track-play-icon">${ICON_PLAY_SM}</span>`
        }
      </div>
      <div class="track-info">
        <div class="track-thumb">
          ${hasArt
            ? `<img src="${song.coverUrl}" alt="${song.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'thumb-f\\' style=\\'background:${song.gradient}\\'>${song.emoji}</div>'">`
            : `<div class="thumb-f" style="background:${song.gradient}">${song.emoji}</div>`
          }
        </div>
        <div class="track-meta">
          <div class="track-title">${song.title}</div>
          <div class="track-artist">${song.artist}</div>
        </div>
      </div>
      <div class="track-actions">
        <button class="like-btn ${liked ? 'liked' : ''}" data-like-id="${song.id}" aria-label="${liked ? 'Unlike' : 'Like'} ${song.title}">
          ${liked ? ICON_HEART_FILL : ICON_HEART}
        </button>
      </div>
      <div class="track-duration">${dur}</div>
    </div>`;
}

function _bind(main, pl, trackSongs) {
  main.querySelector('#pl-play-btn')?.addEventListener('click', () => {
    if (trackSongs.length) playSong(trackSongs[0].id, trackSongs.map(s => s.id));
  });
  main.querySelector('#pl-shuffle-btn')?.addEventListener('click', () => {
    if (!trackSongs.length) return;
    const ids = [...trackSongs.map(s => s.id)].sort(() => Math.random() - 0.5);
    playSong(ids[0], ids);
  });

  main.addEventListener('click', e => {
    const like = e.target.closest('[data-like-id]');
    if (like) { e.stopPropagation(); toggleLike(like.dataset.likeId); return; }
    const row = e.target.closest('[data-song-id]');
    if (row) playSong(row.dataset.songId, trackSongs.map(s => s.id));
  });
  main.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const r = e.target.closest('[data-song-id]'); r?.click(); }
  });
}

function _updateLikes() {
  document.querySelectorAll('[data-like-id]').forEach(btn => {
    const liked = isLiked(btn.dataset.likeId);
    btn.classList.toggle('liked', liked);
    btn.innerHTML = liked ? ICON_HEART_FILL : ICON_HEART;
  });
}

function _updateActiveRow() {
  const { queue, currentIndex, isPlaying } = getState();
  const currentId = queue[currentIndex];
  document.querySelectorAll('.track-row[data-song-id]').forEach(row => {
    const active = row.dataset.songId === currentId;
    row.classList.toggle('active', active);
    const cell = row.querySelector('.track-index-cell');
    if (!cell) return;
    const idx = parseInt(row.dataset.trackIdx, 10);
    if (active) {
      cell.innerHTML = `<div class="now-playing-bars ${!isPlaying ? 'paused' : ''}"><span></span><span></span><span></span></div>`;
    } else {
      cell.innerHTML = `
        <span class="track-num">${idx + 1}</span>
        <span class="track-play-icon">${ICON_PLAY_SM}</span>`;
    }
  });
}
