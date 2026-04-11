/**
 * Pandoos Library — Search View (Panda Theme)
 */

import { getState, subscribe } from '../store.js';
import { searchSongs } from '../api.js';
import { playSong } from '../player.js';
import { formatTime, debounce } from '../utils.js';
import { ICON_PLAY_SM } from '../assets.js';
import { showToast } from './topbar.js';

const GENRES = [
  { label: 'All',        tag: '' },
  { label: '🎸 Rock',    tag: 'rock' },
  { label: '🎹 Pop',     tag: 'pop' },
  { label: '🌙 Chill',   tag: 'ambient' },
  { label: '🎷 Jazz',    tag: 'jazz' },
  { label: '🎻 Classical',tag:'classical' },
  { label: '🥁 Indie',   tag: 'indie' },
  { label: '🎤 Folk',    tag: 'folk' },
];

let _activeTag = '';

export function initSearch() {
  subscribe('change:searchQuery', () => {
    if (getState().currentView === 'search') renderSearch();
  });
  subscribe('change:currentView', () => {
    if (getState().currentView === 'search') renderSearch();
  });
}

export async function renderSearch() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const { songs, searchQuery } = getState();
  const results = await searchSongs(songs, searchQuery);

  main.innerHTML = `
    <div class="hero-banner anim-fade-in" style="min-height:140px;padding:32px 32px 48px">
      <div class="hero-orb hero-orb-1" style="width:200px;height:200px;opacity:0.15"></div>
      <div class="hero-eyebrow">🔍 <span>Search</span></div>
      <h1 class="hero-title" style="font-size:clamp(1.6rem,4vw,2.4rem)">
        ${searchQuery
          ? `Results for <em style="font-style:normal" class="text-gradient">"${searchQuery}"</em>`
          : 'Discover Music 🐼'
        }
      </h1>
    </div>

    <div class="content-section anim-fade-in-up">
      <!-- Genre pills -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px" id="genre-filters" role="group" aria-label="Genre filters">
        ${GENRES.map(g => `
          <button class="genre-pill${g.tag === _activeTag ? ' active' : ''}" data-genre="${g.tag}" type="button">
            ${g.label}
          </button>`).join('')}
      </div>

      <!-- Results -->
      <div id="search-results">
        ${results.length
          ? `<div class="stagger">${results.map((s, i) => _renderRow(s, i, searchQuery)).join('')}</div>`
          : _emptyState(searchQuery)
        }
      </div>
    </div>
  `;

  _bind(main, results);
}

function _renderRow(song, idx, query) {
  const dur    = song.duration > 0 ? formatTime(song.duration) : '—';
  const hasArt = !!song.coverUrl;
  return `
    <div class="track-row" data-song-id="${song.id}" role="button" tabindex="0" aria-label="Play ${song.title}">
      <div class="track-index-cell">
        <span class="track-num">${idx + 1}</span>
        <span class="track-play-icon">${ICON_PLAY_SM}</span>
      </div>
      <div class="track-info">
        <div class="track-thumb">
          ${hasArt
            ? `<img src="${song.coverUrl}" alt="${song.title}" loading="lazy" onerror="this.outerHTML='<div class=\\'thumb-f\\' style=\\'background:${song.gradient}\\'>${song.emoji}</div>'">`
            : `<div class="thumb-f" style="background:${song.gradient}">${song.emoji}</div>`
          }
        </div>
        <div class="track-meta">
          <div class="track-title">${_hl(song.title, query)}</div>
          <div class="track-artist">${_hl(song.artist, query)}</div>
        </div>
      </div>
      <div class="track-duration">${dur}</div>
    </div>`;
}

function _hl(text, query) {
  if (!query) return text;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${esc})`, 'gi'),
    '<mark style="background:rgba(52,211,153,0.2);color:var(--bamboo-bright);border-radius:2px;padding:0 2px">$1</mark>');
}

function _emptyState(query) {
  return `
    <div class="empty-state">
      <div class="empty-icon">🐼</div>
      <h3>${query ? `No results for "${query}"` : 'Start searching'}</h3>
      <p>${query ? 'Try a different name or browse by genre.' : 'Type a song or artist name to find music.'}</p>
    </div>`;
}

function _bind(main, results) {
  // Genre filter
  main.querySelector('#genre-filters')?.addEventListener('click', async e => {
    const btn = e.target.closest('.genre-pill');
    if (!btn) return;
    _activeTag = btn.dataset.genre;
    main.querySelectorAll('.genre-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (_activeTag) {
      const { fetchJamendoByTag } = await import('../api.js');
      const container = main.querySelector('#search-results');
      if (container) {
        container.innerHTML = `<div class="empty-state"><div class="panda-spinner"></div></div>`;
        try {
          const tracks = await fetchJamendoByTag(_activeTag, 30);
          const { setState } = await import('../store.js');
          // Merge into songs list
          const { songs } = getState();
          const existing = new Set(songs.map(s => s.id));
          const newTracks = tracks.filter(t => !existing.has(t.id));
          if (newTracks.length) {
            const { setState } = await import('../store.js');
            setState({ songs: [...songs, ...newTracks] });
          }
          const merged = [...songs.filter(s => s.tags?.includes(_activeTag) || tracks.find(t=>t.id===s.id)), ...newTracks];
          const shown = merged.length ? merged : tracks;
          container.innerHTML = shown.length
            ? `<div class="stagger">${shown.map((s,i) => _renderRow(s, i, '')).join('')}</div>`
            : _emptyState(_activeTag);
          // Bind track clicks on new content
          _bindTracks(container, shown);
        } catch {
          container.innerHTML = _emptyState(_activeTag);
        }
      }
    } else {
      renderSearch();
    }
  });

  _bindTracks(main, results);
}

function _bindTracks(container, results) {
  container.addEventListener('click', e => {
    const row = e.target.closest('[data-song-id]');
    if (!row) return;
    const { songs } = getState();
    // Prefer context from current results, then global songs
    const queue = results.length > 0 ? results.map(s => s.id) : songs.map(s => s.id);
    playSong(row.dataset.songId, queue);
  });
  container.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const row = e.target.closest('[data-song-id]');
      if (row) row.click();
    }
  });
}
