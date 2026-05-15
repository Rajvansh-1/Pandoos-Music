/**
 * Pandoos Music — Badge Unlock Celebration
 *
 * Full-screen animated overlay when user unlocks a badge.
 * Panda does a happy dance, badge animates in, confetti falls.
 * Auto-dismisses after 4 seconds or on click.
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore, BADGE_DEFINITIONS } from '../../stores/useGamificationStore';
import PandaAvatar from '../panda/PandaAvatar';
import type { BadgeId } from '../../types/index';
import './BadgeUnlock.css';

const RARITY_COLORS = {
  common:    { bg: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)', label: 'COMMON' },
  rare:      { bg: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)',  label: 'RARE' },
  epic:      { bg: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', label: 'EPIC' },
  legendary: { bg: '#fbbf24', glow: 'rgba(251, 191, 36, 0.7)',  label: 'LEGENDARY' },
};

// Simple confetti particle
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#ff6b8a', '#4ade80', '#60a5fa', '#fbbf24', '#c084fc', '#fb7185'];
  const color  = colors[index % colors.length];
  const x      = `${5 + (index * 11) % 90}%`;
  const delay  = `${(index * 0.08) % 1.2}s`;
  const dur    = `${1.2 + (index % 8) * 0.15}s`;
  const size   = `${6 + (index % 6)}px`;

  return (
    <div
      className="confetti-particle"
      style={{
        left: x,
        top: '-10px',
        width: size,
        height: size,
        background: color,
        animationDelay: delay,
        animationDuration: dur,
        borderRadius: index % 3 === 0 ? '50%' : '2px',
        '--confetti-rotate': `${(index * 47) % 360}deg`,
      } as React.CSSProperties}
    />
  );
}

export default function BadgeUnlockCelebration() {
  const { pendingBadgeUnlock, clearPendingBadge } = useGamificationStore();

  const dismiss = useCallback(() => {
    clearPendingBadge();
  }, [clearPendingBadge]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!pendingBadgeUnlock) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [pendingBadgeUnlock, dismiss]);

  if (!pendingBadgeUnlock) return null;

  const badge = BADGE_DEFINITIONS[pendingBadgeUnlock as BadgeId];
  if (!badge) return null;

  const rarity = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common;

  return (
    <AnimatePresence>
      <motion.div
        className="badge-unlock-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={dismiss}
        role="dialog"
        aria-label={`Badge unlocked: ${badge.name}`}
        aria-modal="true"
      >
        {/* Confetti rain */}
        <div className="confetti-container" aria-hidden="true">
          {[...Array(30)].map((_, i) => <ConfettiParticle key={i} index={i} />)}
        </div>

        {/* Card */}
        <motion.div
          className="badge-unlock-card"
          initial={{ scale: 0.4, y: 60, opacity: 0 }}
          animate={{ scale: 1,   y: 0,  opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 280, delay: 0.1 }}
          onClick={(e) => e.stopPropagation()}
          style={{ '--rarity-glow': rarity.glow } as React.CSSProperties}
        >
          {/* Celebrating panda */}
          <div className="badge-unlock-panda">
            <PandaAvatar state="celebrating" size={96} />
          </div>

          {/* Badge icon */}
          <motion.div
            className="badge-unlock-icon"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 300, delay: 0.3 }}
            style={{
              background: `radial-gradient(circle, ${rarity.bg}33 0%, transparent 70%)`,
              border: `2px solid ${rarity.bg}66`,
              boxShadow: `0 0 32px ${rarity.glow}`,
            }}
          >
            <span className="badge-emoji">{badge.emoji}</span>
          </motion.div>

          {/* Rarity label */}
          <motion.div
            className="badge-rarity-label"
            style={{ color: rarity.bg }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {rarity.label}
          </motion.div>

          {/* Unlock text */}
          <motion.div
            className="badge-unlock-header"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="badge-unlock-title">Badge Unlocked!</div>
            <div className="badge-name">{badge.name}</div>
          </motion.div>

          {/* Description */}
          <motion.p
            className="badge-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            {badge.description}
          </motion.p>

          {/* XP reward */}
          <motion.div
            className="badge-xp-reward"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65, type: 'spring' }}
          >
            <span className="xp-icon">⚡</span>
            <span>+{badge.xpReward} XP</span>
          </motion.div>

          {/* Dismiss hint */}
          <p className="badge-dismiss-hint">Tap anywhere to continue</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
