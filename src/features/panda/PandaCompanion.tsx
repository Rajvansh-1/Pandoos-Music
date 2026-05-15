/**
 * Pandoos Music — Panda Companion (Smart Emotional Guide)
 *
 * Bridges PlayerContext mood/state → PandaAvatar visual state.
 * Appears in: Home hero, Fullscreen player corner.
 * Reacts to: mood, playback state, streak, time of day, badge unlocks.
 */

import { useMemo } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useGamificationStore } from '../../stores/useGamificationStore';
import PandaAvatar from './PandaAvatar';
import type { PandaState, Mood } from '../../types/index';

interface PandaCompanionProps {
  size?: number;
  showMessage?: boolean;
  variant?: 'hero' | 'corner' | 'sidebar';
  className?: string;
}

// Mood → Panda state mapping
const MOOD_TO_PANDA: Record<Mood, PandaState> = {
  romantic:    'idle',
  melancholic: 'sad',
  energetic:   'excited',
  chill:       'idle',
  happy:       'excited',
  devotional:  'focused',
};

// Time-of-day messages
function getTimeMessage(hour: number): string {
  if (hour >= 0  && hour < 4)  return 'So late… you ok? 🌙';
  if (hour >= 4  && hour < 6)  return 'Early bird! 🌅';
  if (hour >= 6  && hour < 10) return 'Morning vibes! ☀️';
  if (hour >= 10 && hour < 14) return 'Midday energy! 🎵';
  if (hour >= 14 && hour < 17) return 'Afternoon flow ✨';
  if (hour >= 17 && hour < 21) return 'Evening mood 🌆';
  return 'Night session 🌙';
}

// Streak milestone messages
function getStreakMessage(streak: number): string | null {
  if (streak === 7)   return '7 days! You\'re on fire! 🔥';
  if (streak === 14)  return '2 weeks strong! 💪';
  if (streak === 30)  return 'A full month! Legendary! 🏆';
  if (streak === 100) return 'ONE HUNDRED DAYS! 🐼✨';
  if (streak > 0 && streak % 10 === 0) return `${streak} day streak! 🎉`;
  return null;
}

export default function PandaCompanion({
  size = 120,
  showMessage = true,
  variant = 'hero',
  className = '',
}: PandaCompanionProps) {
  const { state } = usePlayer();
  const { currentStreak, pendingBadgeUnlock } = useGamificationStore();

  const { currentMood, isPlaying, currentSong } = state;

  const { pandaState, message } = useMemo(() => {
    const hour = new Date().getHours();

    // Highest priority: badge unlock
    if (pendingBadgeUnlock) {
      return { pandaState: 'celebrating' as PandaState, message: '🎉 New badge!' };
    }

    // Milestone streak
    const streakMsg = getStreakMessage(currentStreak);
    if (streakMsg) {
      return { pandaState: 'celebrating' as PandaState, message: streakMsg };
    }

    // Not playing anything
    if (!currentSong) {
      // Late night = sleepy
      if (hour >= 0 && hour < 5) {
        return { pandaState: 'sleepy' as PandaState, message: showMessage ? '…zzz 😴' : null };
      }
      return {
        pandaState: 'idle' as PandaState,
        message: showMessage ? getTimeMessage(hour) : null,
      };
    }

    // Paused
    if (!isPlaying) {
      return {
        pandaState: 'idle' as PandaState,
        message: showMessage ? 'Paused… 🎵' : null,
      };
    }

    // Late night listening
    if (hour >= 0 && hour < 4) {
      return {
        pandaState: 'sleepy' as PandaState,
        message: showMessage ? 'Night session 🌙' : null,
      };
    }

    // Mood-based state
    const moodState = MOOD_TO_PANDA[currentMood as Mood] || 'listening';

    // Mood messages
    const moodMessages: Record<Mood, string> = {
      romantic:    '💕 In the feels…',
      melancholic: '🌧️ Feeling it deeply',
      energetic:   '⚡ Let\'s GO!',
      chill:       '🌙 Pure chill vibes',
      happy:       '☀️ Happy panda!',
      devotional:  '🙏 Inner peace',
    };

    return {
      pandaState: moodState,
      message: showMessage ? moodMessages[currentMood as Mood] : null,
    };
  }, [currentMood, isPlaying, currentSong, currentStreak, pendingBadgeUnlock, showMessage]);

  // Size adjustments per variant
  const sizeMap = { hero: size, corner: size * 0.6, sidebar: size * 0.7 };
  const finalSize = sizeMap[variant] || size;

  return (
    <PandaAvatar
      state={pandaState}
      size={finalSize}
      message={message}
      glowColor={`var(--ambient-primary)`}
      className={`panda-companion panda-companion--${variant} ${className}`}
    />
  );
}
