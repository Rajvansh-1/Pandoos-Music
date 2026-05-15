/**
 * Pandoos Music — Mood Reactive Background
 *
 * Renders GPU-composited visual atmosphere based on current mood.
 * Uses only opacity + transform (no layout triggers).
 * Each mood has distinct particle/ambient system.
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import type { Mood } from '../../types/index';
import './MoodBackground.css';

// Number of particles per mood
const PARTICLE_CONFIG: Record<string, { count: number; type: string; speed: string }> = {
  romantic:    { count: 12, type: 'heart',    speed: 'slow' },
  melancholic: { count: 20, type: 'rain',     speed: 'medium' },
  energetic:   { count: 8,  type: 'energy',   speed: 'fast' },
  chill:       { count: 15, type: 'dot',      speed: 'slow' },
  happy:       { count: 18, type: 'star',     speed: 'medium' },
  devotional:  { count: 10, type: 'circle',   speed: 'slow' },
};

function Particle({ type, index, speed }: { type: string; index: number; speed: string }) {
  const delay  = `${(index * 0.3) % 3}s`;
  const x      = `${10 + (index * 7) % 80}%`;
  const drift  = `${(index % 2 === 0 ? 1 : -1) * (10 + (index % 20))}px`;
  const dur    = speed === 'fast' ? '1.5s' : speed === 'medium' ? '2.5s' : '4s';
  const size   = `${8 + (index % 12)}px`;

  const content = {
    heart:  '💕',
    rain:   '',
    energy: '',
    dot:    '',
    star:   '✨',
    circle: '',
  }[type] || '';

  const isRain   = type === 'rain';
  const isEnergy = type === 'energy';

  return (
    <div
      className={`mood-particle mood-particle--${type} mood-particle--${speed}`}
      style={{
        left: x,
        top: isRain ? '-20px' : '90%',
        animationDelay: delay,
        animationDuration: dur,
        '--particle-drift': drift,
        '--rain-drift': drift,
        width: isRain ? '2px' : size,
        height: isRain ? `${16 + (index % 20)}px` : size,
        fontSize: content ? size : undefined,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      {content}
    </div>
  );
}

function EnergyRings() {
  return (
    <div className="energy-rings">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="energy-ring"
          style={{ animationDelay: `${i * 0.6}s`, animationDuration: `${1.2 + i * 0.4}s` }}
        />
      ))}
    </div>
  );
}

export default function MoodReactiveBackground() {
  const { state } = usePlayer();
  const { currentMood, ambientColors } = state;
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply mood data attribute to <html> for CSS theme switching
  useEffect(() => {
    document.documentElement.setAttribute('data-mood', currentMood || 'chill');
  }, [currentMood]);

  const config = PARTICLE_CONFIG[currentMood] || PARTICLE_CONFIG.chill;

  return (
    <div
      ref={containerRef}
      className={`mood-background mood-background--${currentMood}`}
      aria-hidden="true"
    >
      {/* ── Primary gradient layer (CSS-driven via mood tokens) ── */}
      <div className="mood-gradient-layer" />

      {/* ── Blurred album art glow (subtle) ── */}
      {ambientColors && (
        <div
          className="mood-album-glow"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${ambientColors.primary}18 0%, transparent 70%)`,
          }}
        />
      )}

      {/* ── Aurora wave (for chill / romantic / devotional) ── */}
      {['chill', 'romantic', 'devotional', 'happy'].includes(currentMood) && (
        <div className="mood-aurora" />
      )}

      {/* ── Energy pulse rings (energetic mode) ── */}
      {currentMood === 'energetic' && <EnergyRings />}

      {/* ── Particles ── */}
      <div className="mood-particles-container">
        {[...Array(config.count)].map((_, i) => (
          <Particle
            key={`${currentMood}-${i}`}
            type={config.type}
            index={i}
            speed={config.speed}
          />
        ))}
      </div>

      {/* ── Vignette overlay (keeps content readable) ── */}
      <div className="mood-vignette" />
    </div>
  );
}
