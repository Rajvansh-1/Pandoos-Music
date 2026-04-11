/**
 * Pandoos Library — App Entry Point (Panda Theme + Jamendo API)
 */

import { fetchSongs, buildPlaylists } from './api.js';
import { setState, getState, subscribe } from './store.js';
import { initPlayer } from './player.js';
import { initRouter, onRoute, navigate } from './router.js';
import { initSidebar } from './ui/sidebar.js';
import { initTopbar, showToast } from './ui/topbar.js';
import { initPlaybar } from './ui/playbar.js';
import { initHome, renderHome } from './ui/home.js';
import { initSearch, renderSearch } from './ui/search.js';
import { initPlaylist, renderPlaylist } from './ui/playlist.js';
import { initLibrary, renderLibrary } from './ui/library.js';
import { initVisualizer } from './ui/visualizer.js';
import { initOverlay } from './ui/overlay.js';
import { lsGet, lsSet } from './utils.js';

async function bootstrap() {
  // Restore persisted likes
  const savedLikes = lsGet('pandoos_liked', []);

  // Init UI shells
  initSidebar();
  initTopbar();
  initPlaybar();
  initOverlay();  // song detail overlay

  // Init view modules
  initHome();
  initSearch();
  initPlaylist();
  initLibrary();

  // Router
  initRouter();
  onRoute(({ view, params }) => {
    setState({ currentView: view, currentPlaylistId: params.id || null });
    _renderView(view, params.id);
  });

  // Show loading skeleton
  _showLoader();

  try {
    // Fetch songs (Jamendo → local fallback)
    const songs = await fetchSongs();

    if (!songs.length) {
      _showError();
      return;
    }

    const playlists  = buildPlaylists(songs);
    const likedSet   = new Set(savedLikes.filter(id => songs.find(s => s.id === id)));

    setState({ songs, playlists, likedSongs: likedSet, isLoading: false });

    // Persist likes
    subscribe('change:likedSongs', liked => lsSet('pandoos_liked', Array.from(liked)));

    // Init audio player
    initPlayer();

    // Init visualizer
    initVisualizer();

    // Render current view (now we have data)
    const { currentView, currentPlaylistId } = getState();
    _renderView(currentView, currentPlaylistId);

    // Determine song source for toast
    const isJamendo = songs.some(s => s.source === 'jamendo');
    setTimeout(() => {
      showToast(
        isJamendo
          ? '🐼 Music loaded from Jamendo API!'
          : '🐼 Local songs loaded!',
        'success'
      );
    }, 700);

  } catch (err) {
    console.error('Bootstrap error:', err);
    _showError();
  }
}

function _renderView(view, id) {
  switch (view) {
    case 'home':     renderHome();         break;
    case 'search':   renderSearch();       break;
    case 'library':  renderLibrary();      break;
    case 'playlist': renderPlaylist(id);   break;
    default:         renderHome();         break;
  }
}

function _showLoader() {
  const main = document.getElementById('main-content');
  if (!main) return;
  main.innerHTML = `
    <div class="hero-banner" style="display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;min-height:280px">
      <div style="font-size:3.5rem;animation:pandaBounce 2s ease-in-out infinite">🐼</div>
      <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;letter-spacing:-0.02em;background:var(--gradient-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
        Pandoos Library
      </div>
      <div class="panda-spinner"></div>
      <div style="font-size:13px;color:var(--color-text-muted)">Fetching music from the bamboo forest…</div>
    </div>

    <div class="content-section">
      <div class="section-heading">
        <div class="skeleton" style="width:180px;height:24px;border-radius:8px"></div>
      </div>
      <div class="card-grid" style="margin-top:0">
        ${Array.from({length: 8}, () => `
          <div>
            <div class="skeleton" style="width:100%;aspect-ratio:1;border-radius:14px;margin-bottom:10px"></div>
            <div class="skeleton" style="height:13px;width:80%;margin-bottom:6px;border-radius:6px"></div>
            <div class="skeleton" style="height:11px;width:55%;border-radius:6px"></div>
          </div>`).join('')}
      </div>
    </div>
  `;
}

function _showError() {
  const main = document.getElementById('main-content');
  if (!main) return;
  main.innerHTML = `
    <div class="empty-state" style="min-height:80vh">
      <div class="empty-icon" style="font-size:5rem">🐼</div>
      <h3>Oops! Panda can't find music</h3>
      <p>
        Make sure you're running through a local web server:<br><br>
        <code style="background:var(--panda-charcoal);padding:4px 10px;border-radius:6px;font-family:var(--font-mono);font-size:12px">npx serve .</code>
      </p>
    </div>`;
}

document.addEventListener('DOMContentLoaded', bootstrap);
