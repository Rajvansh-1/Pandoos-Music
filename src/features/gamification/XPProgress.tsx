/**
 * Pandoos Music — XP Progress Bar
 *
 * Displays the user's current level, XP progress, and level name
 * in the sidebar. Animated fill on mount and XP changes.
 */

import { useEffect, useRef } from 'react';
import { useGamificationStore } from '../../stores/useGamificationStore';
import './XPProgress.css';

interface XPProgressProps {
  compact?: boolean;  // Compact mode for sidebar
}

export default function XPProgress({ compact = false }: XPProgressProps) {
  const { xp, level, levelName, levelColor, xpToNextLevel, xpProgress } = useGamificationStore();
  const barRef = useRef<HTMLDivElement>(null);

  // Animate bar on progress change
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${xpProgress})`;
    }
  }, [xpProgress]);

  if (compact) {
    return (
      <div className="xp-progress-compact">
        <div className="xp-compact-header">
          <span className="xp-level-badge" style={{ background: `${levelColor}22`, color: levelColor, borderColor: `${levelColor}44` }}>
            Lv.{level}
          </span>
          <span className="xp-level-name" style={{ color: levelColor }}>{levelName}</span>
          <span className="xp-amount">{xp.toLocaleString()} XP</span>
        </div>
        <div className="xp-bar-track">
          <div
            ref={barRef}
            className="xp-bar-fill"
            style={{
              transform: `scaleX(${xpProgress})`,
              background: `linear-gradient(90deg, ${levelColor}88, ${levelColor})`,
              boxShadow: `0 0 8px ${levelColor}66`,
            }}
          />
        </div>
        <div className="xp-to-next">{xpToNextLevel.toLocaleString()} XP to next level</div>
      </div>
    );
  }

  return (
    <div className="xp-progress-full">
      {/* Level circle */}
      <div className="xp-level-circle" style={{ borderColor: levelColor, boxShadow: `0 0 16px ${levelColor}44` }}>
        <span className="xp-level-number" style={{ color: levelColor }}>{level}</span>
        <span className="xp-level-sub">Level</span>
      </div>

      <div className="xp-details">
        <div className="xp-level-name-full" style={{ color: levelColor }}>
          {levelName}
        </div>
        <div className="xp-bar-track xp-bar-track--full">
          <div
            ref={barRef}
            className="xp-bar-fill"
            style={{
              transform: `scaleX(${xpProgress})`,
              background: `linear-gradient(90deg, ${levelColor}88, ${levelColor})`,
              boxShadow: `0 0 10px ${levelColor}55`,
            }}
          />
        </div>
        <div className="xp-stats-row">
          <span className="xp-current">{xp.toLocaleString()} XP</span>
          <span className="xp-next">{xpToNextLevel.toLocaleString()} to next</span>
        </div>
      </div>
    </div>
  );
}
