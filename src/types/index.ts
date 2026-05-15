/**
 * Pandoos Music — Core TypeScript Types
 * Single source of truth for all shared types.
 */

// ─── Song ────────────────────────────────────────────────
export interface Song {
  id: string;
  videoId: string;
  title: string;
  rawTitle?: string;
  artist: string;
  album?: string;
  coverUrl: string;
  duration: number;       // seconds
  source: 'youtube' | 'r2' | 'demo';
  channelTitle?: string;
  publishedAt?: string;
  audioUrl?: string;      // For R2 direct audio (Phase 4)
  mood?: Mood;
}

// ─── Mood ────────────────────────────────────────────────
export type Mood = 'romantic' | 'melancholic' | 'energetic' | 'chill' | 'happy' | 'devotional';

export interface MoodInfo {
  label: string;
  emoji: string;
  color: string;
  pandaState: PandaState;
  bgStyle: string;
}

// ─── Panda ───────────────────────────────────────────────
export type PandaState =
  | 'idle'
  | 'listening'
  | 'excited'
  | 'sleepy'
  | 'celebrating'
  | 'sad'
  | 'focused';

// ─── Player ──────────────────────────────────────────────
export type RepeatMode = 'none' | 'all' | 'one';

export interface PlayerState {
  songs: Song[];
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  playerReady: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  showFullscreen: boolean;
  showQueue: boolean;
  likedSongs: Set<string>;
  recentlyPlayed: Song[];
  sleepTimer: { endsAt: number } | null;
  playStats: Record<string, number>;
  currentStreak: number;
  currentMood: Mood;
  lastPlayedDate: string | null;
  ambientColors: AmbientColors | null;
}

// ─── Playlist ────────────────────────────────────────────
export interface Playlist {
  id: string;
  name: string;
  emoji: string;
  description: string;
  songIds: string[];
  gradient: string;
  isPublic?: boolean;
  collaborative?: boolean;
  createdAt?: string;
}

// ─── Gamification ────────────────────────────────────────
export type BadgeId =
  | 'panda_cub'         // First song played
  | 'on_fire'           // 7-day streak
  | 'century'           // 100 songs played
  | 'night_owl'         // Late night listener
  | 'vibe_lord'         // 50 lo-fi songs
  | 'energy_storm'      // 50 energetic songs
  | 'hopeless_romantic' // 50 romantic songs
  | 'mood_master'       // All 6 moods detected
  | 'loyal_listener'    // 30-day streak
  | 'panda_legend'      // 100-day streak
  | 'genre_explorer'    // Played 6 different genres
  | 'morning_person'    // 10 morning sessions
  | 'deep_dive'         // 1 hour continuous listening
  | 'social_panda'      // First share
  | 'devotee'           // 50 devotional songs
  | 'happy_vibes'       // 50 happy songs
  | 'melancholy_soul'   // 50 melancholic songs
  | 'dj_panda'          // 500 songs played
  | 'golden_panda'      // Level 30 reached
  | 'bamboo_master';    // 1000 songs played

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  emoji: string;
  rarity: BadgeRarity;
  xpReward: number;
  unlockCondition: string;  // Human-readable description
}

export type XPLevel =
  | 'Panda Cub'        // 1-4
  | 'Bamboo Learner'   // 5-9
  | 'Vibe Seeker'      // 10-19
  | 'Mood Master'      // 20-29
  | 'Panda Legend';    // 30+

export interface GamificationState {
  xp: number;
  level: number;
  levelName: XPLevel;
  levelColor: string;
  xpToNextLevel: number;
  xpProgress: number;       // 0-1
  currentStreak: number;
  longestStreak: number;
  totalSongsPlayed: number;
  totalListeningTime: number; // seconds
  unlockedBadges: BadgeId[];
  pendingBadgeUnlock: BadgeId | null;  // Badge to celebrate
  genresExplored: Mood[];
  sessionStart: number | null;  // timestamp
}

// ─── Colors ──────────────────────────────────────────────
export interface AmbientColors {
  primary: string;
  secondary: string;
  dark: string;
  light: string;
  glow: string;
}

// ─── Recommendation Section ──────────────────────────────
export interface RecommendationSection {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  songs: Song[];
}

// ─── User (Supabase) ─────────────────────────────────────
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}
