/**
 * Pandoos Music — AI Mood Engine v1 🧠
 *
 * Client-side mood graph + weighted scoring system.
 * No server needed — runs entirely in the browser.
 *
 * Architecture:
 *  1. Song mood tagging via title/artist keyword matching
 *  2. Listening signal tracking (skip / complete / like)
 *  3. Time-of-day bias (morning=energetic, night=chill)
 *  4. Rolling vibe window (last 5 songs = current mood context)
 *  5. Next song prediction via weighted scoring
 */

const SIGNAL_KEY = 'pandoos_mood_signals';

// ── Mood definitions ───────────────────────────────────────────────────────
export const MOODS = {
  romantic:   { label: 'Romantic',   emoji: '💕', color: '#ff6b8a' },
  melancholic:{ label: 'Melancholic',emoji: '🌧️', color: '#7b9ee8' },
  energetic:  { label: 'Energetic',  emoji: '⚡', color: '#f59e0b' },
  chill:      { label: 'Chill',      emoji: '🌙', color: '#6366f1' },
  happy:      { label: 'Happy',      emoji: '☀️', color: '#4ade80' },
  devotional: { label: 'Devotional', emoji: '🙏', color: '#f97316' },
};

// ── Keyword sets for mood detection ────────────────────────────────────────
const MOOD_KEYWORDS = {
  romantic: [
    'love', 'pyaar', 'ishq', 'mohabbat', 'dil', 'romance', 'tere', 'tera',
    'meri', 'sanam', 'jaan', 'baby', 'sweetheart', 'beautiful', 'lovely',
    'valentine', 'humsafar', 'tumse', 'tujhe', 'tumhari', 'piya', 'sajana',
  ],
  melancholic: [
    'sad', 'dard', 'dukh', 'rona', 'aansu', 'judai', 'bichhad', 'tanha',
    'akela', 'rain', 'broken', 'tears', 'alone', 'miss', 'farewell', 'goodbye',
    'bewafa', 'yaad', 'bichad', 'intezaar', 'pal', 'khwaab', 'rootha',
  ],
  energetic: [
    'dance', 'party', 'bang', 'beats', 'dhol', 'bhangra', 'garba', 'naach',
    'zinda', 'josh', 'power', 'fire', 'hard', 'rock', 'pump', 'drop',
    'dj', 'remix', 'mashup', 'jump', 'bounce', 'go', 'run', 'hit',
  ],
  chill: [
    'lofi', 'chill', 'acoustic', 'slow', 'peaceful', 'calm', 'relax',
    'rainy', 'coffee', 'night', 'sleep', 'soft', 'gentle', 'quiet',
    'ambient', 'background', 'study', 'indie',
  ],
  happy: [
    'happy', 'joy', 'khushi', 'celebration', 'masti', 'fun', 'smile',
    'laugh', 'sunshine', 'bright', 'yaar', 'dost', 'festival', 'holi',
    'eid', 'wedding', 'shaadi', 'mehendi',
  ],
  devotional: [
    'bhajan', 'aarti', 'mantra', 'shiv', 'ram', 'krishna', 'hanuman',
    'ganesh', 'mata', 'devi', 'jai', 'om', 'prayer', 'god', 'divine',
    'kirtan', 'sufi', 'qawwali', 'allah',
  ],
};

// ── Tag a song with a mood ─────────────────────────────────────────────────
export function tagSongMood(song) {
  if (!song) return 'chill';
  const text = `${song.title} ${song.artist}`.toLowerCase();
  const scores = {};

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    scores[mood] = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) scores[mood] += 1;
    }
  }

  // Duration fallback: short songs skew energetic, long skew chill
  if (song.duration) {
    if (song.duration < 180) scores.energetic = (scores.energetic || 0) + 0.5;
    if (song.duration > 300) scores.chill     = (scores.chill     || 0) + 0.5;
  }

  // Pick highest scoring mood
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return sorted[0][1] > 0 ? sorted[0][0] : 'chill';
}

// ── Listening signals (persist in localStorage) ───────────────────────────
function loadSignals() {
  try { return JSON.parse(localStorage.getItem(SIGNAL_KEY) || '{}'); }
  catch { return {}; }
}

function saveSignals(signals) {
  try { localStorage.setItem(SIGNAL_KEY, JSON.stringify(signals)); }
  catch { /* storage full */ }
}

/**
 * Record a listening event for a song.
 * event: 'complete' | 'skip' | 'like' | 'unlike'
 */
export function updateListeningSignal(songId, event) {
  if (!songId) return;
  const signals = loadSignals();
  if (!signals[songId]) signals[songId] = { completes: 0, skips: 0, likes: 0 };

  switch (event) {
    case 'complete': signals[songId].completes++; break;
    case 'skip':     signals[songId].skips++;     break;
    case 'like':     signals[songId].likes++;     break;
    case 'unlike':   signals[songId].likes = Math.max(0, signals[songId].likes - 1); break;
    default: break;
  }
  saveSignals(signals);
}

// ── Time-of-day mood bias ─────────────────────────────────────────────────
function getTimeOfDayBias() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 10)  return 'energetic'; // morning
  if (hour >= 10 && hour < 17)  return 'happy';     // afternoon
  if (hour >= 17 && hour < 21)  return 'romantic';  // evening
  return 'chill';                                     // late night
}

// ── Detect current mood from recent songs ─────────────────────────────────
/**
 * @param {Song[]} recentSongs — last 5–10 played
 * @param {Set}    likedSongs  — liked song IDs
 * @returns {{ mood: string, confidence: number, moodData: object }}
 */
export function detectMood(recentSongs = [], likedSongs = new Set()) {
  const signals = loadSignals();
  const moodScores = {};

  // Score from recent songs (most recent = highest weight)
  const vibeWindow = recentSongs.slice(0, 7);
  vibeWindow.forEach((song, idx) => {
    const mood = tagSongMood(song);
    const recencyWeight = Math.max(1, 7 - idx);
    moodScores[mood] = (moodScores[mood] || 0) + recencyWeight;

    // Boost if song was liked
    if (likedSongs.has(song.id)) {
      moodScores[mood] = (moodScores[mood] || 0) + 3;
    }

    // Boost if song had many completions, penalise if mostly skipped
    const sig = signals[song.id];
    if (sig) {
      if (sig.completes > sig.skips) moodScores[mood] = (moodScores[mood] || 0) + 2;
      if (sig.skips > sig.completes) moodScores[mood] = Math.max(0, (moodScores[mood] || 0) - 1);
    }
  });

  // Blend in time-of-day bias
  const timeBias = getTimeOfDayBias();
  moodScores[timeBias] = (moodScores[timeBias] || 0) + 2;

  // No data? return time-based default
  const totalScore = Object.values(moodScores).reduce((a, b) => a + b, 0);
  if (totalScore === 0) {
    return { mood: timeBias, confidence: 0.4, moodData: moodScores };
  }

  const sorted = Object.entries(moodScores).sort(([, a], [, b]) => b - a);
  const topMood = sorted[0][0];
  const confidence = Math.min(0.95, sorted[0][1] / totalScore);

  return { mood: topMood, confidence, moodData: moodScores };
}

// ── Predict next songs based on mood ──────────────────────────────────────
/**
 * @param {Song}    currentSong
 * @param {string}  currentMood
 * @param {Song[]}  candidatePool — all available songs
 * @param {Set}     excludeIds    — already in queue or recently played
 * @param {Map|Set} likedSongs
 * @returns {Song[]} — top 5 predicted songs
 */
export function predictNextSongs(currentSong, currentMood, candidatePool, excludeIds = new Set(), likedSongs = new Set()) {
  if (!candidatePool?.length) return [];
  const signals = loadSignals();

  const scored = candidatePool
    .filter(s => s.id !== currentSong?.id && !excludeIds.has(s.id))
    .map(song => {
      let score = 0;

      // Mood match
      const songMood = tagSongMood(song);
      if (songMood === currentMood) score += 6;
      else if (areMoodsCompatible(songMood, currentMood)) score += 2;

      // Artist affinity (same or related artist)
      if (currentSong?.artist && song.artist) {
        const curArtist = currentSong.artist.toLowerCase();
        const songArtist = song.artist.toLowerCase();
        if (songArtist === curArtist) score += 3;
        else if (curArtist.includes(songArtist) || songArtist.includes(curArtist)) score += 1;
      }

      // Listening signal score
      const sig = signals[song.id];
      if (sig) {
        score += sig.likes * 4;
        score += sig.completes * 2;
        score -= sig.skips * 3;
      }

      // Like boost
      if (likedSongs.has(song.id)) score += 5;

      // Small random tie-breaker (prevents same order every time)
      score += Math.random() * 0.5;

      return { song, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ song }) => song);

  return scored;
}

// ── Mood compatibility matrix ──────────────────────────────────────────────
function areMoodsCompatible(mood1, mood2) {
  const compatible = {
    romantic:    ['melancholic', 'happy', 'chill'],
    melancholic: ['romantic', 'chill'],
    energetic:   ['happy'],
    chill:       ['melancholic', 'romantic', 'devotional'],
    happy:       ['energetic', 'romantic'],
    devotional:  ['chill', 'melancholic'],
  };
  return compatible[mood1]?.includes(mood2) || false;
}

export function clearMoodSignals() {
  localStorage.removeItem(SIGNAL_KEY);
}
