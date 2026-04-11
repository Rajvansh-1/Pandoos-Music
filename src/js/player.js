/**
 * Pandoos Library — Audio Player Engine
 * Wraps the native HTMLAudioElement with a full playback engine:
 * play, pause, next, prev, seek, volume, shuffle, repeat.
 * Uses Web Audio API AnalyserNode for visualizer data.
 */

import { getState, setState, publish, getCurrentSong } from './store.js';
import { shuffle as shuffleArr, clamp, lsGet, lsSet } from './utils.js';

let _audio = null;
let _audioCtx = null;
let _analyser = null;
let _sourceNode = null;
let _gainNode = null;
let _contextConnected = false;

/** Get the audio frequencyData buffer for visualizer */
export function getAnalyserData() {
  if (!_analyser) return null;
  const data = new Uint8Array(_analyser.frequencyBinCount);
  _analyser.getByteFrequencyData(data);
  return data;
}

/** Get the analyser node directly */
export function getAnalyser() {
  return _analyser;
}

/**
 * Initialize the audio player.
 * Must be called once after songs are loaded into the store.
 */
export function initPlayer() {
  _audio = new Audio();
  _audio.preload = 'none';
  _audio.crossOrigin = 'anonymous';

  // Restore volume from localStorage
  const savedVol = lsGet('pandoos_volume', 0.8);
  _audio.volume = clamp(savedVol, 0, 1);
  setState({ volume: _audio.volume });

  // Event listeners
  _audio.addEventListener('timeupdate', _onTimeUpdate);
  _audio.addEventListener('loadedmetadata', _onMetadata);
  _audio.addEventListener('ended', _onEnded);
  _audio.addEventListener('play', () => setState({ isPlaying: true }));
  _audio.addEventListener('pause', () => setState({ isPlaying: false }));
  _audio.addEventListener('error', _onError);
  _audio.addEventListener('waiting', () => publish('player:buffering', true));
  _audio.addEventListener('canplay', () => publish('player:buffering', false));

  // Restore last played song
  const lastSongId = lsGet('pandoos_last_song', null);
  const { songs } = getState();
  if (lastSongId && songs.length) {
    const idx = songs.findIndex(s => s.id === lastSongId);
    if (idx !== -1) {
      _buildQueue(songs.map(s => s.id), idx);
    } else {
      _buildQueue(songs.map(s => s.id), 0);
    }
  } else if (songs.length) {
    _buildQueue(songs.map(s => s.id), 0);
  }
}

/**
 * Set up Web Audio API context (must be called after user gesture)
 */
function _initAudioContext() {
  if (_contextConnected || !_audio) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    _audioCtx = new AudioContext();
    _analyser = _audioCtx.createAnalyser();
    _analyser.fftSize = 256;
    _analyser.smoothingTimeConstant = 0.75;
    _gainNode = _audioCtx.createGain();
    _sourceNode = _audioCtx.createMediaElementSource(_audio);
    _sourceNode.connect(_gainNode);
    _gainNode.connect(_analyser);
    _analyser.connect(_audioCtx.destination);
    _contextConnected = true;
  } catch (err) {
    console.warn('Player: AudioContext init failed (non-critical):', err);
  }
}

/**
 * Build queue from song ids, set current index
 * @param {string[]} ids
 * @param {number} startIndex
 */
function _buildQueue(ids, startIndex = 0) {
  setState({
    queue: ids,
    currentIndex: startIndex,
  });
}

// =================== PLAYBACK CONTROLS ===================

/**
 * Play a specific song by id (adds to queue at current position)
 * @param {string} songId
 * @param {string[]} [contextQueue] - optional new queue context
 */
export function playSong(songId, contextQueue = null) {
  _initAudioContext();
  if (_audioCtx && _audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }

  const { songs } = getState();
  const song = songs.find(s => s.id === songId);
  if (!song) return;

  // Build queue context
  if (contextQueue) {
    const idx = contextQueue.indexOf(songId);
    _buildQueue(contextQueue, idx < 0 ? 0 : idx);
  } else {
    const { queue } = getState();
    const existing = queue.indexOf(songId);
    if (existing !== -1) {
      setState({ currentIndex: existing });
    } else {
      const allIds = songs.map(s => s.id);
      const idx = allIds.indexOf(songId);
      _buildQueue(allIds, idx < 0 ? 0 : idx);
    }
  }

  _loadAndPlay(song);
}

/**
 * Toggle play/pause for current song
 */
export function togglePlay() {
  _initAudioContext();
  if (_audioCtx && _audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }

  if (!_audio) return;
  const song = getCurrentSong();
  if (!song) return;

  // If no src loaded yet, load and play
  if (!_audio.src || _audio.src === window.location.href) {
    _loadAndPlay(song);
    return;
  }

  if (_audio.paused) {
    _audio.play().catch(_onPlayError);
  } else {
    _audio.pause();
  }
}

/**
 * Play next song in queue
 */
export function playNext() {
  const state = getState();
  const { queue, currentIndex, repeat, shuffle: isShuffle } = state;
  if (!queue.length) return;

  if (repeat === 'one') {
    _audio.currentTime = 0;
    _audio.play().catch(_onPlayError);
    return;
  }

  let next = currentIndex + 1;
  if (next >= queue.length) {
    if (repeat === 'all') next = 0;
    else return; // end of queue
  }

  setState({ currentIndex: next });
  const { songs } = state;
  const song = songs.find(s => s.id === queue[next]);
  if (song) _loadAndPlay(song);
}

/**
 * Play previous song or restart current
 */
export function playPrev() {
  if (!_audio) return;

  // If > 3s into song, restart
  if (_audio.currentTime > 3) {
    _audio.currentTime = 0;
    return;
  }

  const state = getState();
  const { queue, currentIndex, songs, repeat } = state;
  let prev = currentIndex - 1;
  if (prev < 0) {
    if (repeat === 'all') prev = queue.length - 1;
    else { _audio.currentTime = 0; return; }
  }

  setState({ currentIndex: prev });
  const song = songs.find(s => s.id === queue[prev]);
  if (song) _loadAndPlay(song);
}

/**
 * Seek to a fraction (0–1) of total duration
 * @param {number} fraction
 */
export function seekTo(fraction) {
  if (!_audio || !isFinite(_audio.duration)) return;
  _audio.currentTime = clamp(fraction, 0, 1) * _audio.duration;
}

/**
 * Set volume (0–1)
 * @param {number} vol
 */
export function setVolume(vol) {
  const v = clamp(vol, 0, 1);
  if (_audio) _audio.volume = v;
  if (_gainNode) _gainNode.gain.value = v;
  setState({ volume: v, isMuted: v === 0 });
  lsSet('pandoos_volume', v);
}

/**
 * Toggle mute
 */
export function toggleMute() {
  const { volume, isMuted } = getState();
  if (isMuted) {
    const restored = lsGet('pandoos_volume_pre_mute', 0.8);
    setVolume(restored);
    setState({ isMuted: false });
  } else {
    lsSet('pandoos_volume_pre_mute', volume);
    if (_audio) _audio.volume = 0;
    setState({ isMuted: true });
  }
}

/**
 * Toggle shuffle mode
 */
export function toggleShuffle() {
  const { shuffle: isShuffle, songs, queue, currentIndex } = getState();
  const next = !isShuffle;

  if (next) {
    // Build shuffled queue keeping current song at position 0
    const currentId = queue[currentIndex];
    const remaining = queue.filter(id => id !== currentId);
    const shuffled = [currentId, ...shuffleArr(remaining)];
    setState({ shuffle: true, queue: shuffled, currentIndex: 0 });
  } else {
    // Restore original order
    const currentId = queue[currentIndex];
    const allIds = songs.map(s => s.id);
    const idx = allIds.indexOf(currentId);
    setState({ shuffle: false, queue: allIds, currentIndex: idx < 0 ? 0 : idx });
  }

  publish('player:shuffle', next);
}

/**
 * Cycle repeat mode: none → all → one → none
 */
export function cycleRepeat() {
  const modes = ['none', 'all', 'one'];
  const { repeat } = getState();
  const next = modes[(modes.indexOf(repeat) + 1) % modes.length];
  setState({ repeat: next });
  publish('player:repeat', next);
}

// =================== INTERNAL HELPERS ===================

function _loadAndPlay(song) {
  if (!_audio) return;
  _audio.pause();
  _audio.src = song.src;
  _audio.load();
  const playPromise = _audio.play();
  if (playPromise) playPromise.catch(_onPlayError);
  lsSet('pandoos_last_song', song.id);
  publish('player:songChange', song);
}

function _onTimeUpdate() {
  const ct = _audio.currentTime || 0;
  const dur = _audio.duration || 0;
  setState({ currentTime: ct, duration: dur });
}

function _onMetadata() {
  const dur = _audio.duration || 0;
  setState({ duration: dur });
  // Update song duration in songs array
  const song = getCurrentSong();
  if (song && song.duration === 0) {
    const { songs } = getState();
    const updated = songs.map(s => s.id === song.id ? { ...s, duration: dur } : s);
    setState({ songs: updated });
  }
}

function _onEnded() {
  const { repeat } = getState();
  if (repeat === 'one') {
    _audio.currentTime = 0;
    _audio.play().catch(_onPlayError);
  } else {
    playNext();
  }
}

function _onError(e) {
  console.error('Player audio error:', e);
  publish('player:error', e);
}

function _onPlayError(err) {
  if (err?.name !== 'AbortError') {
    console.warn('Player play() rejected:', err?.message || err);
  }
}
