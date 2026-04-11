/**
 * Pandoos Library — Song Detail Overlay
 * Full-screen overlay when a song is selected.
 * Features: spinning vinyl art, lyrics (lyrics.ovh API), song details
 */

import { getState, subscribe, toggleLike, isLiked, getCurrentSong } from '../store.js';
import { togglePlay, playNext, playPrev, seekTo, toggleShuffle, cycleRepeat } from '../player.js';
import { formatTime, clamp, throttle } from '../utils.js';
import { ICON_PLAY, ICON_PAUSE, ICON_PREV, ICON_NEXT, ICON_SHUFFLE, ICON_REPEAT, ICON_HEART, ICON_HEART_FILL } from '../assets.js';

const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const MINIMIZE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="21" y2="3"/><line x1="3" y1="21" x2="14" y2="10"/></svg>`;
const UP_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="16" height="16"><polyline points="18 15 12 9 6 15"/></svg>`;
const SHARE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;

let _isDragging = false;
let _activeTab  = 'lyrics';
let _lyricsCache = {};
let _isVisible  = false;

export function initOverlay() {
  // Create overlay HTML shell
  const el = document.createElement('div');
  el.id = 'song-overlay';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Song detail');
  el.innerHTML = `
    <div class="overlay-panel">
      <div class="overlay-bg" id="overlay-bg"></div>
      <div class="overlay-bg-fallback" id="overlay-bg-fallback"></div>
      <div class="overlay-noise"></div>

      <!-- LEFT -->
      <div class="overlay-left">
        <button class="overlay-close" id="overlay-close-btn" aria-label="Close overlay" title="Close">
          ${CLOSE_ICON}
        </button>

        <div class="overlay-art-wrap">
          <div class="overlay-ring"></div>
          <div class="overlay-ring"></div>
          <div class="overlay-art" id="overlay-art">
            <div class="thumb-f" style="background:var(--gradient-card)">🐼</div>
          </div>
        </div>

        <div class="overlay-song-info">
          <div class="overlay-song-title" id="overlay-title">—</div>
          <div class="overlay-song-artist" id="overlay-artist">—</div>
          <div class="overlay-song-album" id="overlay-album">—</div>
        </div>

        <div class="overlay-actions">
          <button class="overlay-action-btn" id="overlay-like-btn" aria-label="Like song" title="Like">
            ${ICON_HEART}
          </button>
          <button class="overlay-action-btn" id="overlay-share-btn" aria-label="Share" title="Share">
            ${SHARE_ICON}
          </button>
        </div>

        <!-- Seek -->
        <div class="overlay-seek-wrap">
          <div class="overlay-seek-bar-wrap" id="overlay-seek-wrap">
            <div class="overlay-seek-track">
              <div class="overlay-seek-fill" id="overlay-seek-fill" style="width:0%"></div>
            </div>
            <div class="overlay-seek-thumb" id="overlay-seek-thumb" style="left:0%"></div>
          </div>
          <div class="overlay-seek-times">
            <span id="overlay-cur">0:00</span>
            <span id="overlay-tot">0:00</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="overlay-controls">
          <button class="overlay-ctrl" id="ov-shuffle" aria-label="Shuffle" title="Shuffle">${ICON_SHUFFLE}</button>
          <button class="overlay-ctrl" id="ov-prev"    aria-label="Previous">${ICON_PREV}</button>
          <button class="overlay-play-btn" id="ov-play" aria-label="Play / Pause">${ICON_PLAY}</button>
          <button class="overlay-ctrl" id="ov-next"    aria-label="Next">${ICON_NEXT}</button>
          <button class="overlay-ctrl" id="ov-repeat"  aria-label="Repeat" title="Repeat">${ICON_REPEAT}</button>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="overlay-right">
        <div class="overlay-right-tabs" role="tablist">
          <button class="overlay-tab active" data-tab="lyrics" role="tab" aria-selected="true">🎵 Lyrics</button>
          <button class="overlay-tab"        data-tab="details" role="tab" aria-selected="false">📋 Details</button>
        </div>
        <div class="overlay-right-content" id="overlay-tab-content">
          <div class="lyrics-loading">
            <div class="panda-spinner"></div>
            <span style="font-size:13px">Fetching lyrics…</span>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  _bindOverlayEvents();
  _subscribeToState();
}

/** Open the overlay for the current song */
export function openOverlay() {
  const overlay = document.getElementById('song-overlay');
  if (!overlay) return;
  _isVisible = true;
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';

  // Update with current song
  const song = getCurrentSong();
  if (song) {
    _populateOverlay(song);
    _loadLyrics(song);
  }
}

/** Close overlay */
export function closeOverlay() {
  const overlay = document.getElementById('song-overlay');
  if (!overlay) return;
  _isVisible = false;
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

function _bindOverlayEvents() {
  const overlay = document.getElementById('song-overlay');

  // Close on backdrop click (not panel)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeOverlay();
  });

  // Close button
  document.getElementById('overlay-close-btn')?.addEventListener('click', closeOverlay);

  // ESC key
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _isVisible) closeOverlay();
  });

  // Playback controls
  document.getElementById('ov-play'   )?.addEventListener('click', togglePlay);
  document.getElementById('ov-prev'   )?.addEventListener('click', playPrev);
  document.getElementById('ov-next'   )?.addEventListener('click', playNext);
  document.getElementById('ov-shuffle')?.addEventListener('click', toggleShuffle);
  document.getElementById('ov-repeat' )?.addEventListener('click', cycleRepeat);

  // Like
  document.getElementById('overlay-like-btn')?.addEventListener('click', () => {
    const song = getCurrentSong();
    if (song) { toggleLike(song.id); _updateLikeBtn(song.id); }
  });

  // Share
  document.getElementById('overlay-share-btn')?.addEventListener('click', () => {
    const song = getCurrentSong();
    if (!song) return;
    if (navigator.share) {
      navigator.share({ title: song.title, text: `Listening to "${song.title}" by ${song.artist} on Pandoos Library 🐼`, url: song.shareUrl || window.location.href });
    } else {
      navigator.clipboard?.writeText(`${song.title} - ${song.artist}`);
      import('./topbar.js').then(m => m.showToast('🐼 Copied to clipboard!'));
    }
  });

  // Tabs
  document.querySelector('.overlay-right-tabs')?.addEventListener('click', e => {
    const tab = e.target.closest('.overlay-tab');
    if (!tab) return;
    _activeTab = tab.dataset.tab;
    document.querySelectorAll('.overlay-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === _activeTab);
      t.setAttribute('aria-selected', String(t.dataset.tab === _activeTab));
    });
    const song = getCurrentSong();
    if (song) _renderTabContent(song);
  });

  // Seek bar
  const seekWrap = document.getElementById('overlay-seek-wrap');
  if (seekWrap) {
    const frac = e => {
      const r = seekWrap.getBoundingClientRect();
      return clamp((e.clientX - r.left) / r.width, 0, 1);
    };
    seekWrap.addEventListener('mousedown', e => {
      _isDragging = true;
      _setSeekUI(frac(e));
    });
    window.addEventListener('mousemove', throttle(e => {
      if (_isDragging) _setSeekUI(frac(e));
    }, 16));
    window.addEventListener('mouseup', e => {
      if (!_isDragging) return;
      _isDragging = false;
      seekTo(frac(e));
    });
    // Touch
    seekWrap.addEventListener('touchstart', e => { _isDragging = true; _setSeekUI(frac(e.touches[0])); }, { passive: true });
    seekWrap.addEventListener('touchmove',  e => { if (_isDragging) _setSeekUI(frac(e.touches[0])); }, { passive: true });
    seekWrap.addEventListener('touchend',   () => { _isDragging = false; });
  }
}

function _subscribeToState() {
  subscribe('player:songChange', song => {
    if (_isVisible) {
      _populateOverlay(song);
      _loadLyrics(song);
    }
  });
  subscribe('change:isPlaying', () => _updatePlayBtn());
  subscribe('change:currentTime', () => { if (!_isDragging) _updateSeek(); });
  subscribe('change:shuffle', () => _updateCtrlState());
  subscribe('change:repeat',  () => _updateCtrlState());
  subscribe('change:likedSongs', () => {
    const s = getCurrentSong();
    if (s) _updateLikeBtn(s.id);
  });
}

function _populateOverlay(song) {
  const art    = document.getElementById('overlay-art');
  const title  = document.getElementById('overlay-title');
  const artist = document.getElementById('overlay-artist');
  const album  = document.getElementById('overlay-album');
  const bg     = document.getElementById('overlay-bg');

  if (art) {
    if (song.coverUrl) {
      art.innerHTML = `<img src="${song.coverUrl}" alt="${song.title}" onerror="this.outerHTML='<div class=\\'thumb-f\\' style=\\'background:${song.gradient}\\'>${song.emoji}</div>'">`;
    } else {
      art.innerHTML = `<div class="thumb-f" style="background:${song.gradient}">${song.emoji}</div>`;
    }
  }
  if (bg)     bg.style.backgroundImage = song.coverUrl ? `url(${song.coverUrl})` : 'none';
  if (title)  title.textContent  = song.title;
  if (artist) artist.textContent = song.artist;
  if (album)  album.textContent  = song.album;

  _updatePlayBtn();
  _updateLikeBtn(song.id);
  _updateCtrlState();
  _updateSeek();
}

async function _loadLyrics(song) {
  _activeTab = 'lyrics'; // reset to lyrics tab
  document.querySelectorAll('.overlay-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === 'lyrics');
  });

  const content = document.getElementById('overlay-tab-content');
  if (!content) return;

  // Show spinner
  content.innerHTML = `
    <div class="lyrics-container">
      <div class="lyrics-loading">
        <div class="panda-spinner"></div>
        <span style="font-size:13px;color:var(--color-text-muted)">🐼 Searching for lyrics…</span>
      </div>
    </div>`;

  // Check cache
  const cacheKey = `${song.artist}::${song.title}`;
  if (_lyricsCache[cacheKey]) {
    _renderLyrics(content, song, _lyricsCache[cacheKey]);
    return;
  }

  // Try lyrics.ovh (completely free, no auth)
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`;
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      if (data.lyrics) {
        _lyricsCache[cacheKey] = data.lyrics;
        _renderLyrics(content, song, data.lyrics);
        return;
      }
    }
  } catch { /* fall through */ }

  // fallback: render details
  _renderNoLyrics(content, song);
}

function _renderLyrics(container, song, text) {
  const lines = text.split('\n');
  container.innerHTML = `
    <div class="lyrics-container">
      <div class="lyrics-title">
        <div style="width:6px;height:6px;border-radius:50%;background:var(--meadow-mid)"></div>
        Lyrics — ${song.title}
      </div>
      <div class="lyrics-text">
        ${lines.map(l => `<div class="lyrics-line">${l || '&nbsp;'}</div>`).join('')}
      </div>
      <div style="margin-top:24px;font-size:10px;color:var(--color-text-muted);text-align:center">
        Lyrics via lyrics.ovh · For entertainment only
      </div>
    </div>`;
}

function _renderNoLyrics(container, song) {
  container.innerHTML = `
    <div class="lyrics-container">
      <div class="lyrics-unavailable">
        <div class="lyr-icon">🐼</div>
        <h4>Lyrics not found</h4>
        <p>Panda couldn't find lyrics for this track.<br>Try the Details tab for more info.</p>
      </div>
    </div>`;
}

function _renderTabContent(song) {
  const content = document.getElementById('overlay-tab-content');
  if (!content || !song) return;

  if (_activeTab === 'details') {
    const dur   = song.duration > 0 ? formatTime(song.duration) : '—';
    const tags  = (song.tags||[]).slice(0, 4).join(', ') || '—';
    content.innerHTML = `
      <div>
        <div class="details-grid" style="margin-bottom:24px">
          <div class="detail-item">
            <div class="detail-label">Title</div>
            <div class="detail-value">${song.title}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Artist</div>
            <div class="detail-value">${song.artist}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Album</div>
            <div class="detail-value">${song.album}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">${dur}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Genre Tags</div>
            <div class="detail-value" style="text-transform:capitalize">${tags}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Source</div>
            <div class="detail-value" style="text-transform:capitalize">
              ${song.source === 'jamendo' ? '🎵 Jamendo API' : '📁 Local File'}
            </div>
          </div>
        </div>

        <div class="related-tracks-label">
          <div style="width:6px;height:6px;border-radius:50%;background:var(--meadow-mid)"></div>
          About the Artist
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;font-size:13px;color:var(--color-text-muted);line-height:1.7">
          🐼 <strong style="color:var(--color-text-secondary)">${song.artist}</strong> — 
          Music available via Pandoos Library, powered by the Jamendo open music platform.
          Free and legal music for everyone.
        </div>
      </div>`;
  } else {
    // switch back to lyrics
    const cacheKey = `${song.artist}::${song.title}`;
    if (_lyricsCache[cacheKey]) {
      _renderLyrics(content, song, _lyricsCache[cacheKey]);
    } else {
      _loadLyrics(song);
    }
  }
}

// ---- State updaters ----
function _updatePlayBtn() {
  const { isPlaying } = getState();
  const art = document.getElementById('overlay-art');
  const btn = document.getElementById('ov-play');
  if (btn) btn.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
  if (art) {
    art.classList.toggle('playing', isPlaying);
    art.classList.toggle('paused', !isPlaying);
  }
}
function _updateSeek() {
  const { currentTime, duration } = getState();
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fill  = document.getElementById('overlay-seek-fill');
  const thumb = document.getElementById('overlay-seek-thumb');
  const cur   = document.getElementById('overlay-cur');
  const tot   = document.getElementById('overlay-tot');
  if (fill)  fill.style.width = `${pct}%`;
  if (thumb) thumb.style.left = `${pct}%`;
  if (cur)   cur.textContent  = formatTime(currentTime);
  if (tot)   tot.textContent  = formatTime(duration);
}
function _setSeekUI(f) {
  const pct = f * 100;
  const fill  = document.getElementById('overlay-seek-fill');
  const thumb = document.getElementById('overlay-seek-thumb');
  if (fill)  fill.style.width = `${pct}%`;
  if (thumb) thumb.style.left = `${pct}%`;
}
function _updateLikeBtn(songId) {
  const btn = document.getElementById('overlay-like-btn');
  if (!btn) return;
  const liked = isLiked(songId);
  btn.classList.toggle('liked', liked);
  btn.innerHTML = liked ? ICON_HEART_FILL : ICON_HEART;
}
function _updateCtrlState() {
  const { shuffle, repeat } = getState();
  document.getElementById('ov-shuffle')?.classList.toggle('active', shuffle);
  const rep = document.getElementById('ov-repeat');
  if (rep) {
    rep.classList.toggle('active', repeat !== 'none');
    rep.dataset.active = repeat;
  }
}
