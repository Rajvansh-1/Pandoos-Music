/**
 * Pandoos Library — Sidebar with Panda Theme
 */

import { getState, subscribe, setState } from '../store.js';
import { navigate } from '../router.js';
import { PANDA_FACE_SVG, ICON_HOME, ICON_SEARCH, ICON_LIBRARY, BAMBOO_LEAF } from '../assets.js';

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = _render();
  _bind(sidebar);

  subscribe('change:playlists',       () => _updatePlaylists(sidebar));
  subscribe('change:currentView',     () => _updateActive(sidebar));
  subscribe('change:currentPlaylistId', () => _updateActive(sidebar));
  subscribe('change:likedSongs',      () => _updatePlaylists(sidebar));
}

function _render() {
  const { currentView, playlists, currentPlaylistId } = getState();
  return `
    <div class="sidebar-header">
      <a class="panda-logo" href="#home" data-view="home">
        <img src="/assets/logo.png" alt="Pandoos Library" style="width:46px;height:46px;object-fit:contain;animation:pandaBounce 4s ease-in-out infinite;border-radius:10px" />
        <div class="logo-wordmark">
          <div class="logo-name">Pan<span>doos</span></div>
          <div class="logo-tagline">Panda Beats 🎧</div>
        </div>
      </a>
    </div>

    <div class="sidebar-scroll">
      <nav class="sidebar-nav" id="sidebar-nav" aria-label="Main navigation">
        ${_navItem('home',    ICON_HOME,    'Home',         currentView)}
        ${_navItem('search',  ICON_SEARCH,  'Search',       currentView)}
        ${_navItem('library', ICON_LIBRARY, 'Your Library', currentView)}
      </nav>

      <div class="sidebar-section-title">
        <div class="bamboo-node"></div>
        Playlists
      </div>

      <div id="sidebar-playlists" aria-label="Playlists">
        ${_renderPlaylists(playlists, currentPlaylistId)}
      </div>

      <!-- Bamboo decoration -->
      <div style="display:flex;justify-content:center;gap:12px;padding:16px 0;opacity:0.4">
        ${BAMBOO_LEAF}${BAMBOO_LEAF}${BAMBOO_LEAF}
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-panda-art">
        <div style="font-size:22px;flex-shrink:0">🐼</div>
        <div class="sidebar-footer-text">
          <strong>Pandoos Library</strong><br>
          Powered by Jamendo API<br>Free music for everyone
        </div>
      </div>
    </div>
  `;
}

function _navItem(view, icon, label, current) {
  return `
    <div class="nav-item ${current === view ? 'active' : ''}" data-view="${view}" role="button" tabindex="0" aria-label="${label}">
      ${icon}
      <span>${label}</span>
    </div>`;
}

function _renderPlaylists(playlists, currentId) {
  const { likedSongs } = getState();
  return playlists.map(pl => {
    const count = pl.id === 'pl_liked' ? likedSongs.size : pl.songIds.length;
    const active = currentId === pl.id ? 'active' : '';
    return `
      <div class="playlist-item ${active}" data-playlist-id="${pl.id}" role="button" tabindex="0">
        <div class="pl-thumb-sm">
          <div class="thumb-f" style="background:${pl.gradient}">${pl.emoji}</div>
        </div>
        <div class="pl-info">
          <div class="pl-name">${pl.name}</div>
          <div class="pl-count">${count} song${count !== 1 ? 's' : ''}</div>
        </div>
      </div>`;
  }).join('');
}

function _bind(sidebar) {
  sidebar.addEventListener('click', e => {
    const nav = e.target.closest('[data-view]');
    if (nav) { navigate(nav.dataset.view); return; }
    const pl = e.target.closest('[data-playlist-id]');
    if (pl)  navigate('playlist', { id: pl.dataset.playlistId });
  });
  sidebar.addEventListener('keydown', e => {
    if (e.key === 'Enter') e.currentTarget.querySelector(':focus')?.click();
  });
}

function _updatePlaylists(sidebar) {
  const el = sidebar.querySelector('#sidebar-playlists');
  if (!el) return;
  const { playlists, currentPlaylistId } = getState();
  el.innerHTML = _renderPlaylists(playlists, currentPlaylistId);
}

function _updateActive(sidebar) {
  const { currentView, currentPlaylistId } = getState();
  sidebar.querySelectorAll('[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === currentView);
  });
  sidebar.querySelectorAll('[data-playlist-id]').forEach(el => {
    el.classList.toggle('active', el.dataset.playlistId === currentPlaylistId);
  });
}
