/**
 * Pandoos Music — Gamification Store (Zustand)
 *
 * Manages XP, levels, badges, streaks, and listening stats.
 * Fully persisted to localStorage.
 * Separate from PlayerContext to keep audio logic clean.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GamificationState, BadgeId, BadgeRarity, Mood, XPLevel,
} from '../types/index';

// ─── XP Thresholds ────────────────────────────────────────
const XP_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  450,   // Level 4
  700,   // Level 5 — Bamboo Learner
  1000,  // Level 6
  1400,  // Level 7
  1900,  // Level 8
  2500,  // Level 9
  3200,  // Level 10 — Vibe Seeker
  4000,  // Level 11
  5000,  // Level 12
  6200,  // Level 13
  7600,  // Level 14
  9200,  // Level 15
  11000, // Level 16
  13000, // Level 17
  15200, // Level 18
  17600, // Level 19
  20000, // Level 20 — Mood Master
  23000, // Level 21
  26500, // Level 22
  30500, // Level 23
  35000, // Level 24
  40000, // Level 25
  46000, // Level 26
  53000, // Level 27
  61000, // Level 28
  70000, // Level 29
  80000, // Level 30 — Panda Legend
];

function getLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getLevelName(level: number): XPLevel {
  if (level < 5)  return 'Panda Cub';
  if (level < 10) return 'Bamboo Learner';
  if (level < 20) return 'Vibe Seeker';
  if (level < 30) return 'Mood Master';
  return 'Panda Legend';
}

function getLevelColor(level: number): string {
  if (level < 5)  return '#94a3b8';
  if (level < 10) return '#4ade80';
  if (level < 20) return '#38bdf8';
  if (level < 30) return '#a78bfa';
  return '#fbbf24';
}

function getXPProgress(xp: number, level: number): { xpToNext: number; progress: number } {
  const current = XP_THRESHOLDS[level - 1] ?? 0;
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const progress = next > current ? (xp - current) / (next - current) : 1;
  return { xpToNext: Math.max(0, next - xp), progress: Math.min(1, Math.max(0, progress)) };
}

// ─── Badge Definitions ────────────────────────────────────
export const BADGE_DEFINITIONS: Record<BadgeId, {
  name: string; description: string; emoji: string;
  rarity: BadgeRarity; xpReward: number; unlockCondition: string;
}> = {
  panda_cub:         { name: 'Panda Cub',          emoji: '🐼', rarity: 'common',    xpReward: 50,   description: 'Your journey begins!',                   unlockCondition: 'Play your first song' },
  on_fire:           { name: 'On Fire',             emoji: '🔥', rarity: 'rare',      xpReward: 200,  description: '7 days in a row — unstoppable!',          unlockCondition: '7-day listening streak' },
  century:           { name: 'Century Club',        emoji: '💯', rarity: 'rare',      xpReward: 300,  description: 'You\'ve played 100 songs!',               unlockCondition: 'Play 100 songs total' },
  night_owl:         { name: 'Night Owl',           emoji: '🦉', rarity: 'rare',      xpReward: 150,  description: 'The best music plays after midnight.',     unlockCondition: 'Listen past midnight 10 times' },
  vibe_lord:         { name: 'Vibe Lord',           emoji: '💜', rarity: 'rare',      xpReward: 200,  description: 'Master of the chill dimension.',           unlockCondition: 'Play 50 lo-fi/chill songs' },
  energy_storm:      { name: 'Energy Storm',        emoji: '⚡', rarity: 'rare',      xpReward: 200,  description: 'Pure electric energy!',                   unlockCondition: 'Play 50 energetic songs' },
  hopeless_romantic: { name: 'Hopeless Romantic',   emoji: '💕', rarity: 'rare',      xpReward: 200,  description: 'Love is your soundtrack.',                 unlockCondition: 'Play 50 romantic songs' },
  mood_master:       { name: 'Mood Master',         emoji: '🌈', rarity: 'epic',      xpReward: 500,  description: 'You feel everything.',                    unlockCondition: 'Explore all 6 moods' },
  loyal_listener:    { name: 'Loyal Listener',      emoji: '📅', rarity: 'epic',      xpReward: 1000, description: '30 days with Pandoos — you\'re family.',   unlockCondition: '30-day listening streak' },
  panda_legend:      { name: 'Panda Legend',        emoji: '🏆', rarity: 'legendary', xpReward: 5000, description: '100 days — you ARE the panda.',           unlockCondition: '100-day listening streak' },
  genre_explorer:    { name: 'Genre Explorer',      emoji: '🗺️', rarity: 'common',    xpReward: 100,  description: 'No boundaries, just music.',              unlockCondition: 'Explore all genres' },
  morning_person:    { name: 'Morning Person',      emoji: '☀️', rarity: 'common',    xpReward: 100,  description: 'Mornings hit different with music.',       unlockCondition: 'Listen in the morning 10 times' },
  deep_dive:         { name: 'Deep Dive',           emoji: '🎧', rarity: 'rare',      xpReward: 250,  description: '60 minutes straight — you\'re in flow.',  unlockCondition: 'Listen for 1 hour continuously' },
  social_panda:      { name: 'Social Panda',        emoji: '📤', rarity: 'common',    xpReward: 75,   description: 'Spreading good vibes.',                   unlockCondition: 'Share a song for the first time' },
  devotee:           { name: 'Devotee',             emoji: '🙏', rarity: 'rare',      xpReward: 200,  description: 'Spiritual frequencies activated.',         unlockCondition: 'Play 50 devotional songs' },
  happy_vibes:       { name: 'Happy Vibes',         emoji: '😄', rarity: 'common',    xpReward: 150,  description: 'Positivity is your superpower.',           unlockCondition: 'Play 50 happy songs' },
  melancholy_soul:   { name: 'Melancholy Soul',     emoji: '🌧️', rarity: 'rare',      xpReward: 200,  description: 'Depth is your strength.',                 unlockCondition: 'Play 50 melancholic songs' },
  dj_panda:          { name: 'DJ Panda',            emoji: '🎛️', rarity: 'epic',      xpReward: 750,  description: '500 tracks — you ARE the playlist.',     unlockCondition: 'Play 500 songs total' },
  golden_panda:      { name: 'Golden Panda',        emoji: '🐼✨', rarity: 'legendary', xpReward: 3000, description: 'Ascending to the next level.',           unlockCondition: 'Reach Level 30' },
  bamboo_master:     { name: 'Bamboo Master',       emoji: '🎋', rarity: 'legendary', xpReward: 5000, description: 'Enlightened.',                            unlockCondition: 'Play 1000 songs total' },
};

// ─── XP Reward Rules ─────────────────────────────────────
export const XP_REWARDS = {
  songCompleted:    10,
  songLiked:         5,
  dailyLogin:       20,
  streak7:         100,
  streak30:        500,
  streak100:      2000,
  genreDiscovery:   25,
  badgeUnlocked:    50,  // Bonus on top of badge's own xpReward
} as const;

// ─── Initial State ────────────────────────────────────────
const initialState: GamificationState = {
  xp: 0,
  level: 1,
  levelName: 'Panda Cub',
  levelColor: '#94a3b8',
  xpToNextLevel: 100,
  xpProgress: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalSongsPlayed: 0,
  totalListeningTime: 0,
  unlockedBadges: [],
  pendingBadgeUnlock: null,
  genresExplored: [],
  sessionStart: null,
};

// ─── Store ────────────────────────────────────────────────
interface GamificationStore extends GamificationState {
  // Actions
  addXP: (amount: number, reason?: string) => void;
  recordSongPlayed: (mood: Mood, isComplete: boolean, listeningTime: number) => void;
  recordLike: () => void;
  recordShare: () => void;
  recordDailyLogin: () => void;
  checkBadges: () => void;
  clearPendingBadge: () => void;
  startSession: () => void;
  endSession: () => void;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (amount: number) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = getLevelFromXP(newXP);
          const levelName = getLevelName(newLevel);
          const levelColor = getLevelColor(newLevel);
          const { xpToNext, progress } = getXPProgress(newXP, newLevel);
          return {
            xp: newXP,
            level: newLevel,
            levelName,
            levelColor,
            xpToNextLevel: xpToNext,
            xpProgress: progress,
          };
        });
      },

      recordSongPlayed: (mood: Mood, isComplete: boolean, listeningTime: number) => {
        set((state) => {
          const newTotal = state.totalSongsPlayed + 1;
          const newTime = state.totalListeningTime + listeningTime;
          const newGenres = [...state.genresExplored];
          if (!newGenres.includes(mood)) {
            newGenres.push(mood);
          }

          return {
            totalSongsPlayed: newTotal,
            totalListeningTime: newTime,
            genresExplored: newGenres,
          };
        });

        if (isComplete) get().addXP(XP_REWARDS.songCompleted);
        get().checkBadges();
      },

      recordLike: () => {
        get().addXP(XP_REWARDS.songLiked);
      },

      recordShare: () => {
        const { unlockedBadges } = get();
        if (!unlockedBadges.includes('social_panda')) {
          set({ pendingBadgeUnlock: 'social_panda' });
          set((s) => ({ unlockedBadges: [...s.unlockedBadges, 'social_panda'] }));
          get().addXP(BADGE_DEFINITIONS.social_panda.xpReward);
        }
      },

      recordDailyLogin: () => {
        get().addXP(XP_REWARDS.dailyLogin);
      },

      checkBadges: () => {
        const state = get();
        const { unlockedBadges, totalSongsPlayed, currentStreak, genresExplored, level } = state;

        const tryUnlock = (id: BadgeId, condition: boolean) => {
          if (condition && !unlockedBadges.includes(id)) {
            set((s) => ({
              unlockedBadges: [...s.unlockedBadges, id],
              pendingBadgeUnlock: id,
            }));
            get().addXP(BADGE_DEFINITIONS[id].xpReward);
            return true;
          }
          return false;
        };

        tryUnlock('panda_cub',      totalSongsPlayed >= 1);
        tryUnlock('century',        totalSongsPlayed >= 100);
        tryUnlock('dj_panda',       totalSongsPlayed >= 500);
        tryUnlock('bamboo_master',  totalSongsPlayed >= 1000);
        tryUnlock('on_fire',        currentStreak >= 7);
        tryUnlock('loyal_listener', currentStreak >= 30);
        tryUnlock('panda_legend',   currentStreak >= 100);
        tryUnlock('mood_master',    genresExplored.length >= 6);
        tryUnlock('genre_explorer', genresExplored.length >= 6);
        tryUnlock('golden_panda',   level >= 30);

        // Night owl check
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 4) {
          const nightCount = parseInt(localStorage.getItem('pandoos_night_count') || '0', 10) + 1;
          localStorage.setItem('pandoos_night_count', String(nightCount));
          tryUnlock('night_owl', nightCount >= 10);
        }

        // Morning person check
        if (hour >= 5 && hour < 9) {
          const morningCount = parseInt(localStorage.getItem('pandoos_morning_count') || '0', 10) + 1;
          localStorage.setItem('pandoos_morning_count', String(morningCount));
          tryUnlock('morning_person', morningCount >= 10);
        }
      },

      clearPendingBadge: () => set({ pendingBadgeUnlock: null }),

      startSession: () => set({ sessionStart: Date.now() }),

      endSession: () => {
        const { sessionStart } = get();
        if (!sessionStart) return;
        const duration = (Date.now() - sessionStart) / 1000;
        if (duration >= 3600) {
          const { unlockedBadges } = get();
          if (!unlockedBadges.includes('deep_dive')) {
            set((s) => ({
              unlockedBadges: [...s.unlockedBadges, 'deep_dive'],
              pendingBadgeUnlock: 'deep_dive',
            }));
            get().addXP(BADGE_DEFINITIONS.deep_dive.xpReward);
          }
        }
        set({ sessionStart: null });
      },
    }),
    {
      name: 'pandoos-gamification',
    }
  )
);
