/**
 * Pandoos Library — Central State Store
 * Lightweight reactive pub/sub state management.
 * No external dependencies required.
 */

const _state = {
  // Audio
  songs:          [],        // All songs loaded from /songs/
  queue:          [],        // Current playback queue (song ids)
  currentIndex:   -1,        // Index into queue
  isPlaying:      false,
  currentTime:    0,
  duration:       0,
  volume:         0.8,
  isMuted:        false,
  shuffle:        false,
  repeat:         'none',    // 'none' | 'all' | 'one'

  // UI
  currentView:    'home',    // 'home' | 'search' | 'library' | 'playlist'
  currentPlaylistId: null,
  searchQuery:    '',

  // Playlists
  playlists:      [],
  likedSongs:     new Set(),

  // Loading
  isLoading:      true,
};

const _listeners = {};

/**
 * Subscribe to a state key change
 * @param {string} event
 * @param {Function} handler
 * @returns {Function} unsubscribe function
 */
export function subscribe(event, handler) {
  if (!_listeners[event]) _listeners[event] = new Set();
  _listeners[event].add(handler);
  return () => _listeners[event].delete(handler);
}

/**
 * Publish an event to all subscribers
 * @param {string} event
 * @param {*} [data]
 */
export function publish(event, data) {
  if (_listeners[event]) {
    _listeners[event].forEach(h => {
      try { h(data); } catch (e) { console.error(`Store handler error [${event}]:`, e); }
    });
  }
  // also fire wildcard listeners
  if (event !== '*' && _listeners['*']) {
    _listeners['*'].forEach(h => {
      try { h({ event, data }); } catch (e) { /* ignore */ }
    });
  }
}

/**
 * Get current state (readonly snapshot)
 * @returns {typeof _state}
 */
export function getState() {
  return { ..._state, likedSongs: new Set(_state.likedSongs) };
}

/**
 * Update state and publish change events
 * @param {Partial<typeof _state>} patch
 * @param {string[]} [events] — extra events to publish
 */
export function setState(patch, events = []) {
  const changed = [];
  for (const [key, val] of Object.entries(patch)) {
    if (_state[key] !== val) {
      _state[key] = val;
      changed.push(key);
    }
  }
  // Publish individual key events
  changed.forEach(key => publish(`change:${key}`, _state[key]));
  // Publish grouped event
  if (changed.length) publish('change', { keys: changed });
  // Extra events
  events.forEach(e => publish(e, getState()));
}

/**
 * Toggle like status for a song
 * @param {string} songId
 */
export function toggleLike(songId) {
  const liked = new Set(_state.likedSongs);
  if (liked.has(songId)) {
    liked.delete(songId);
    publish('song:unliked', songId);
  } else {
    liked.add(songId);
    publish('song:liked', songId);
  }
  _state.likedSongs = liked;
  publish('change:likedSongs', liked);
}

/**
 * Check if a song is liked
 * @param {string} songId
 * @returns {boolean}
 */
export function isLiked(songId) {
  return _state.likedSongs.has(songId);
}

/**
 * Get current song object or null
 * @returns {object|null}
 */
export function getCurrentSong() {
  const { songs, queue, currentIndex } = _state;
  if (currentIndex < 0 || currentIndex >= queue.length) return null;
  const id = queue[currentIndex];
  return songs.find(s => s.id === id) || null;
}
