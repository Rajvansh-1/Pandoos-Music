/**
 * Pandoos Library — Playbar UI
 * Fixed: volume slider properly tracks with custom CSS gradient
 * Fixed: seek bar drag interactions
 */

import {
  togglePlay, playNext, playPrev,
  seekTo, setVolume, toggleMute,
  toggleShuffle, cycleRepeat
} from '../player.js';
import { getState, subscribe, getCurrentSong } from '../store.js';
import { formatTime, clamp, throttle } from '../utils.js';
import { openOverlay } from './overlay.js';
import {
  ICON_PLAY, ICON_PAUSE, ICON_PREV, ICON_NEXT,
  ICON_SHUFFLE, ICON_REPEAT,
  ICON_VOL_ON, ICON_VOL_OFF,
  ICON_HEART, ICON_HEART_FILL
} from '../assets.js';

let _isDragging = false;

export function initPlaybar() {
  const playbar = document.getElementById('playbar');
  if (!playbar) return;
  playbar.innerHTML = _render();
  _bind(playbar);

  subscribe('change:isPlaying',    () => _updatePlay());
  subscribe('change:currentTime',  () => { if (!_isDragging) _updateSeek(); });
  subscribe('change:shuffle',      () => _updateShuffle());
  subscribe('change:repeat',       () => _updateRepeat());
  subscribe('change:volume',       () => _updateVolume());
  subscribe('change:isMuted',      () => _updateVolume());
  subscribe('player:songChange',   (s) => _updateNowPlaying(s));
  subscribe('change:likedSongs',   () => _updateLike());
}

function _render() {
  const { volume } = getState();
  const volPct = Math.round(volume * 100);
  return `
    <canvas id="visualizer-canvas" aria-hidden="true"></canvas>

    <!-- LEFT: Now Playing -->
    <div class="playbar-left">
      <div class="np-thumb" id="np-thumb" style="cursor:pointer;flex-shrink:0" title="View song details (U)" aria-label="View song details">
        <div class="thumb-f" style="background:linear-gradient(135deg,#1a3a2a,#0c0f0b);font-size:1.4rem">🐼</div>
      </div>
      <div class="np-info" id="np-info" style="cursor:pointer" id="np-info-click" title="View song details">
        <div class="np-title" id="np-title"><span class="np-empty" style="font-style:italic;font-size:12px">Choose a song to play</span></div>
        <div class="np-artist" id="np-artist"></div>
      </div>
      <button class="like-btn" id="np-like-btn" aria-label="Like" title="Like">${ICON_HEART}</button>
    </div>

    <!-- CENTER: Controls + Seek -->
    <div class="playbar-center">
      <div class="controls-row">
        <button class="control-btn" id="btn-shuffle" aria-label="Shuffle" title="Shuffle">${ICON_SHUFFLE}</button>
        <button class="control-btn" id="btn-prev"    aria-label="Previous">${ICON_PREV}</button>
        <button class="play-pause-btn" id="btn-play" aria-label="Play / Pause">${ICON_PLAY}</button>
        <button class="control-btn" id="btn-next"    aria-label="Next">${ICON_NEXT}</button>
        <button class="control-btn" id="btn-repeat"  aria-label="Repeat" title="Repeat">${ICON_REPEAT}</button>
      </div>

      <div class="seek-row">
        <span class="seek-time" id="seek-cur">0:00</span>
        <div class="seek-wrap" id="seek-wrap" role="slider" aria-label="Seek position"
             tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="seek-track">
            <div class="seek-fill" id="seek-fill" style="width:0%"></div>
          </div>
          <div class="seek-thumb" id="seek-thumb" style="left:0%"></div>
        </div>
        <span class="seek-time right" id="seek-tot">0:00</span>
      </div>
    </div>

    <!-- RIGHT: Volume + expand -->
    <div class="playbar-right">
      <button class="control-btn" id="btn-expand" aria-label="View song details" title="View song details"
        style="opacity:0.6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="14" height="14">
          <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>

      <div class="volume-section">
        <button class="vol-icon" id="btn-mute" aria-label="Toggle mute" title="Mute">
          ${ICON_VOL_ON}
        </button>
        <!-- Custom volume slider -->
        <div class="vol-slider-wrap" id="vol-wrap" role="slider" aria-label="Volume"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="${volPct}" tabindex="0">
          <div class="vol-track">
            <div class="vol-fill" id="vol-fill" style="width:${volPct}%"></div>
          </div>
          <div class="vol-thumb" id="vol-thumb" style="left:${volPct}%"></div>
        </div>
        <span id="vol-label" style="font-size:10px;color:var(--color-text-muted);width:24px;text-align:right;font-family:var(--font-mono)">${volPct}</span>
      </div>
    </div>
  `;
}

function _bind(playbar) {
  playbar.querySelector('#btn-play'   )?.addEventListener('click', togglePlay);
  playbar.querySelector('#btn-prev'   )?.addEventListener('click', playPrev);
  playbar.querySelector('#btn-next'   )?.addEventListener('click', playNext);
  playbar.querySelector('#btn-shuffle')?.addEventListener('click', toggleShuffle);
  playbar.querySelector('#btn-repeat' )?.addEventListener('click', cycleRepeat);
  playbar.querySelector('#btn-mute'   )?.addEventListener('click', toggleMute);
  playbar.querySelector('#btn-expand' )?.addEventListener('click', openOverlay);
  // Both thumbnail and info area open overlay
  playbar.querySelector('#np-thumb')?.addEventListener('click', () => { if (getCurrentSong()) openOverlay(); });
  playbar.querySelector('#np-info')?.addEventListener('click',  () => { if (getCurrentSong()) openOverlay(); });

  // ======= CUSTOM VOLUME SLIDER =======
  const volWrap = playbar.querySelector('#vol-wrap');
  if (volWrap) {
    let _volDragging = false;
    const getFrac = e => {
      const r = volWrap.getBoundingClientRect();
      return clamp((e.clientX - r.left) / r.width, 0, 1);
    };
    const applyVol = f => {
      setVolume(f);
      _setVolUI(f * 100);
    };
    volWrap.addEventListener('mousedown', e => {
      _volDragging = true;
      applyVol(getFrac(e));
    });
    window.addEventListener('mousemove', throttle(e => {
      if (_volDragging) applyVol(getFrac(e));
    }, 16));
    window.addEventListener('mouseup', e => {
      if (!_volDragging) return;
      _volDragging = false;
      applyVol(getFrac(e));
    });
    // Touch
    volWrap.addEventListener('touchstart', e => { _volDragging = true; applyVol(getFrac(e.touches[0])); }, { passive: true });
    volWrap.addEventListener('touchmove',  e => { if (_volDragging) applyVol(getFrac(e.touches[0])); }, { passive: true });
    volWrap.addEventListener('touchend',   () => { _volDragging = false; });
    // Keyboard
    volWrap.addEventListener('keydown', e => {
      const { volume } = getState();
      if (e.key === 'ArrowRight') applyVol(clamp(volume + 0.05, 0, 1));
      if (e.key === 'ArrowLeft')  applyVol(clamp(volume - 0.05, 0, 1));
    });
    // Mouse wheel
    volWrap.addEventListener('wheel', e => {
      e.preventDefault();
      const { volume } = getState();
      applyVol(clamp(volume - e.deltaY * 0.005, 0, 1));
    }, { passive: false });
  }

  // ======= SEEK SLIDER =======
  const seekWrap = playbar.querySelector('#seek-wrap');
  if (seekWrap) {
    const getFrac = e => {
      const r = seekWrap.getBoundingClientRect();
      return clamp((e.clientX - r.left) / r.width, 0, 1);
    };
    seekWrap.addEventListener('mousedown', e => {
      _isDragging = true;
      seekWrap.classList.add('dragging');
      _setSeekUI(getFrac(e));
    });
    window.addEventListener('mousemove', throttle(e => {
      if (_isDragging) _setSeekUI(getFrac(e));
    }, 16));
    window.addEventListener('mouseup', e => {
      if (!_isDragging) return;
      _isDragging = false;
      seekWrap.classList.remove('dragging');
      seekTo(getFrac(e));
    });
    seekWrap.addEventListener('touchstart', e => {
      _isDragging = true;
      _setSeekUI(getFrac(e.touches[0]));
    }, { passive: true });
    seekWrap.addEventListener('touchmove', e => {
      if (_isDragging) _setSeekUI(getFrac(e.touches[0]));
    }, { passive: true });
    seekWrap.addEventListener('touchend', () => {
      if (!_isDragging) return;
      _isDragging = false;
    });
    // Keyboard
    seekWrap.addEventListener('keydown', e => {
      const { currentTime, duration } = getState();
      if (!duration) return;
      if (e.key === 'ArrowRight') seekTo(clamp(currentTime / duration + 5/duration, 0, 1));
      if (e.key === 'ArrowLeft')  seekTo(clamp(currentTime / duration - 5/duration, 0, 1));
    });
    // Scroll on seek
    seekWrap.addEventListener('wheel', e => {
      e.preventDefault();
      const { currentTime, duration } = getState();
      if (!duration) return;
      seekTo(clamp(currentTime / duration - e.deltaY * 0.002, 0, 1));
    }, { passive: false });
  }

  // Like button
  playbar.querySelector('#np-like-btn')?.addEventListener('click', async () => {
    const song = getCurrentSong();
    if (!song) return;
    const { toggleLike } = await import('../store.js');
    toggleLike(song.id);
  });

  // Global keyboard shortcuts
  window.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.code === 'Space')                    { e.preventDefault(); togglePlay(); }
    if (e.code === 'KeyM')                     toggleMute();
    if (e.code === 'ArrowRight' && e.altKey)   { e.preventDefault(); playNext(); }
    if (e.code === 'ArrowLeft'  && e.altKey)   { e.preventDefault(); playPrev(); }
    if (e.code === 'KeyU')                     openOverlay();
  });
}

// ---- Helpers ----
function _setSeekUI(f) {
  const pct = f * 100;
  const fill  = document.getElementById('seek-fill');
  const thumb = document.getElementById('seek-thumb');
  if (fill)  fill.style.width = `${pct}%`;
  if (thumb) thumb.style.left = `${pct}%`;
}

function _setVolUI(pct) {
  const fill  = document.getElementById('vol-fill');
  const thumb = document.getElementById('vol-thumb');
  const label = document.getElementById('vol-label');
  const wrap  = document.getElementById('vol-wrap');
  if (fill)  fill.style.width  = `${pct}%`;
  if (thumb) thumb.style.left  = `${pct}%`;
  if (label) label.textContent = String(Math.round(pct));
  if (wrap)  wrap.setAttribute('aria-valuenow', String(Math.round(pct)));
}

// ---- State updaters ----
function _updatePlay() {
  const { isPlaying } = getState();
  const btn   = document.getElementById('btn-play');
  const thumb = document.getElementById('np-thumb');
  if (btn) btn.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;
  if (thumb) {
    thumb.classList.toggle('is-playing', isPlaying && !!getCurrentSong());
    thumb.classList.toggle('paused', !isPlaying && !!getCurrentSong());
  }
}

function _updateSeek() {
  const { currentTime, duration } = getState();
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  _setSeekUI(pct / 100);
  const cur = document.getElementById('seek-cur');
  const tot = document.getElementById('seek-tot');
  if (cur) cur.textContent = formatTime(currentTime);
  if (tot) tot.textContent = formatTime(duration);
  document.getElementById('seek-wrap')?.setAttribute('aria-valuenow', String(Math.round(pct)));
}

function _updateShuffle() {
  document.getElementById('btn-shuffle')?.classList.toggle('active', getState().shuffle);
}

function _updateRepeat() {
  const { repeat } = getState();
  const btn = document.getElementById('btn-repeat');
  if (!btn) return;
  btn.classList.toggle('active', repeat !== 'none');
  btn.dataset.active = repeat;
  btn.title = repeat === 'one' ? 'Repeat One' : repeat === 'all' ? 'Repeat All' : 'Repeat Off';
}

function _updateVolume() {
  const { volume, isMuted } = getState();
  _setVolUI(isMuted ? 0 : volume * 100);
  const mute = document.getElementById('btn-mute');
  if (mute) mute.innerHTML = (isMuted || volume === 0) ? ICON_VOL_OFF : ICON_VOL_ON;
}

function _updateNowPlaying(song) {
  if (!song) return;
  const title  = document.getElementById('np-title');
  const artist = document.getElementById('np-artist');
  const thumb  = document.getElementById('np-thumb');

  if (title)  title.innerHTML  = `<span>${song.title}</span>`;
  if (artist) artist.textContent = song.artist;
  if (thumb) {
    if (song.coverUrl) {
      thumb.innerHTML = `<img src="${song.coverUrl}" alt="${song.title}"
        onerror="this.outerHTML='<div class=\\'thumb-f\\' style=\\'background:${song.gradient}\\'>${song.emoji}</div>'">`;
    } else {
      thumb.innerHTML = `<div class="thumb-f" style="background:${song.gradient}">${song.emoji}</div>`;
    }
  }
  _updatePlay();
  _updateLike();
}

async function _updateLike() {
  const song = getCurrentSong();
  const btn  = document.getElementById('np-like-btn');
  if (!btn || !song) return;
  const { isLiked } = await import('../store.js');
  const liked = isLiked(song.id);
  btn.classList.toggle('liked', liked);
  btn.innerHTML = liked ? ICON_HEART_FILL : ICON_HEART;
}
