/**
 * Pandoos Library — Utility Functions
 * Shared helpers used across all modules.
 */

/**
 * Format seconds into m:ss string
 * @param {number} secs
 * @returns {string}
 */
export function formatTime(secs) {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Debounce a function call
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Throttle a function call
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Clean up a song filename into a display name
 * Removes .mp3, bracketed info like (pagalall.com), extra spaces
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeName(filename) {
  return filename
    .replace(/\.mp3$/i, '')
    .replace(/\(pagalall\.com\)/gi, '')
    .replace(/\(koshalworld\.com\)/gi, '')
    .replace(/\(pagal world\)/gi, '')
    .replace(/\s*-\s*copy\s*/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stable hash from string → number
 * @param {string} str
 * @returns {number}
 */
export function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a deterministic gradient CSS value based on seed string
 * @param {string} seed
 * @returns {string} CSS gradient string
 */
export function generateGradient(seed) {
  const palettes = [
    ['#2d5a27', '#4ea63c'],  // meadow green
    ['#1a4a3a', '#3da6a6'],  // forest teal
    ['#3a2a15', '#8a6240'],  // earthy panda brown
    ['#1e3a1a', '#6cc257'],  // bright meadow
    ['#0d2b2b', '#56c0c0'],  // deep teal
    ['#2a1a10', '#c47c3a'],  // warm amber
    ['#1a2a1a', '#8ed87a'],  // light meadow
    ['#1e2a10', '#a3d45a'],  // yellow-green
    ['#0a1f0a', '#4ea63c'],  // dark forest
    ['#251a0a', '#c4843a'],  // amber sunset
  ];
  const idx = hashCode(seed) % palettes.length;
  const [a, b] = palettes[idx];
  const deg = (hashCode(seed + 'deg') % 70) + 110;
  return `linear-gradient(${deg}deg, ${a} 0%, ${b} 100%)`;
}

/**
 * Generate emoji based on song name hash
 * @param {string} seed
 * @returns {string}
 */
export function generateEmoji(seed) {
  const emojis = ['🎵', '🎶', '🎤', '🎸', '🥁', '🎹', '🎺', '🎻', '🎼', '🎧', '✨', '💜', '🌙', '⭐', '🔥', '💫'];
  return emojis[hashCode(seed) % emojis.length];
}

/**
 * Clamp a number between min and max
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Fisher-Yates shuffle (returns a new array)
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pluralize a word
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 * @returns {string}
 */
export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : (plural || singular + 's')}`;
}

/**
 * Get initials from a name (up to 2 chars)
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

/** Safe localStorage get with JSON parse */
export function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Safe localStorage set with JSON stringify */
export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}
