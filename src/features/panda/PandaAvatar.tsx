/**
 * Pandoos Music — Animated Panda Avatar
 *
 * Full SVG panda with 7 emotional states.
 * GPU-safe CSS animations only.
 * No external dependencies.
 */

import { useEffect, useRef } from 'react';
import type { PandaState } from '../../types/index';
import './PandaAvatar.css';

interface PandaAvatarProps {
  state?: PandaState;
  size?: number;
  glowColor?: string;
  className?: string;
  /** Show a small speech bubble */
  message?: string | null;
}

export default function PandaAvatar({
  state = 'idle',
  size = 120,
  glowColor,
  className = '',
  message,
}: PandaAvatarProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Map panda state → CSS animation class
  const stateClass = `panda-${state}`;

  // Eye expression per state
  const eyeExpressions = {
    idle:        { leftEye: 'M30 50 Q33 46 36 50', rightEye: 'M64 50 Q67 46 70 50', eyeSize: 4 },
    listening:   { leftEye: 'M30 50 Q33 46 36 50', rightEye: 'M64 50 Q67 46 70 50', eyeSize: 4 },
    excited:     { leftEye: 'M29 48 Q33 44 37 48', rightEye: 'M63 48 Q67 44 71 48', eyeSize: 5 },
    sleepy:      { leftEye: 'M30 52 Q33 54 36 52', rightEye: 'M64 52 Q67 54 70 52', eyeSize: 2 },
    celebrating: { leftEye: 'M29 48 Q33 42 37 48', rightEye: 'M63 48 Q67 42 71 48', eyeSize: 5.5 },
    sad:         { leftEye: 'M30 52 Q33 56 36 52', rightEye: 'M64 52 Q67 56 70 52', eyeSize: 3 },
    focused:     { leftEye: 'M30 50 Q33 46 36 50', rightEye: 'M64 50 Q67 46 70 50', eyeSize: 3.5 },
  };

  // Mouth expression per state
  const mouthExpressions = {
    idle:        'M40 72 Q50 80 60 72',
    listening:   'M42 74 Q50 78 58 74',
    excited:     'M38 70 Q50 84 62 70',
    sleepy:      'M42 73 Q50 75 58 73',
    celebrating: 'M36 68 Q50 86 64 68',
    sad:         'M40 78 Q50 70 60 78',
    focused:     'M43 73 Q50 77 57 73',
  };

  // Eyebrow per state
  const eyebrowExpressions = {
    idle:        { left: 'M26 38 Q33 34 40 38', right: 'M60 38 Q67 34 74 38' },
    listening:   { left: 'M26 38 Q33 34 40 38', right: 'M60 38 Q67 34 74 38' },
    excited:     { left: 'M25 34 Q33 30 41 34', right: 'M59 34 Q67 30 75 34' },
    sleepy:      { left: 'M26 40 Q33 38 40 40', right: 'M60 40 Q67 38 74 40' },
    celebrating: { left: 'M24 33 Q33 28 42 33', right: 'M58 33 Q67 28 76 33' },
    sad:         { left: 'M26 42 Q33 46 40 42', right: 'M60 42 Q67 46 74 42' },
    focused:     { left: 'M26 36 Q33 32 40 36', right: 'M60 36 Q67 32 74 36' },
  };

  const eyes   = eyeExpressions[state]   || eyeExpressions.idle;
  const mouth  = mouthExpressions[state] || mouthExpressions.idle;
  const brows  = eyebrowExpressions[state] || eyebrowExpressions.idle;

  // Rosy cheeks — visible on happy states
  const showCheeks = ['excited', 'celebrating', 'happy'].includes(state as string);

  // Glow color from ambient or prop
  const glow = glowColor || 'var(--ambient-primary, #4ADE80)';

  return (
    <div
      className={`panda-avatar-wrapper ${className}`}
      style={{ width: size, height: message ? size + 48 : size }}
    >
      {/* Speech bubble */}
      {message && (
        <div className="panda-speech-bubble" aria-label={message}>
          {message}
        </div>
      )}

      {/* Ambient glow ring */}
      <div
        className="panda-glow-ring animate-glow-pulse"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          background: `radial-gradient(circle, ${glow}22 0%, transparent 70%)`,
        }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`panda-svg ${stateClass}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Panda is ${state}`}
      >
        {/* ── Drop Shadow Filter ── */}
        <defs>
          <filter id="panda-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.5)" />
          </filter>
          <radialGradient id="panda-face-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </radialGradient>
          <radialGradient id="panda-ear-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#333" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </radialGradient>
          <radialGradient id="panda-patch-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2d2d2d" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <radialGradient id="eye-glow-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#e0e0e0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ccc" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Ears (Left + Right — behind face) ── */}
        <ellipse
          cx="22" cy="22" rx="14" ry="13"
          fill="url(#panda-ear-grad)"
          className="panda-ear panda-left-ear"
          filter="url(#panda-shadow)"
        />
        <ellipse
          cx="78" cy="22" rx="14" ry="13"
          fill="url(#panda-ear-grad)"
          className="panda-ear panda-right-ear"
          filter="url(#panda-shadow)"
        />
        {/* Inner ear pink */}
        <ellipse cx="22" cy="22" rx="7" ry="6" fill="#d48fa0" opacity="0.5" className="panda-left-ear" />
        <ellipse cx="78" cy="22" rx="7" ry="6" fill="#d48fa0" opacity="0.5" className="panda-right-ear" />

        {/* ── Face (main body) ── */}
        <ellipse
          cx="50" cy="55" rx="38" ry="36"
          fill="url(#panda-face-grad)"
          filter="url(#panda-shadow)"
        />

        {/* ── Eye patches ── */}
        <ellipse
          cx="32" cy="49" rx="12" ry="11"
          fill="url(#panda-patch-grad)"
          transform="rotate(-10, 32, 49)"
        />
        <ellipse
          cx="68" cy="49" rx="12" ry="11"
          fill="url(#panda-patch-grad)"
          transform="rotate(10, 68, 49)"
        />

        {/* ── Eyebrows ── */}
        <path
          d={brows.left}
          stroke="#555" strokeWidth="1.5" strokeLinecap="round"
          style={{ transition: 'd 0.4s ease' }}
        />
        <path
          d={brows.right}
          stroke="#555" strokeWidth="1.5" strokeLinecap="round"
          style={{ transition: 'd 0.4s ease' }}
        />

        {/* ── Eyes (glowing white + iris) ── */}
        <circle cx="33" cy="50" r={eyes.eyeSize + 1} fill="url(#eye-glow-grad)" className="panda-blink" />
        <circle cx="67" cy="50" r={eyes.eyeSize + 1} fill="url(#eye-glow-grad)" className="panda-blink" />
        {/* Iris */}
        <circle cx="33" cy="51" r={eyes.eyeSize * 0.6} fill="#1a1a1a" />
        <circle cx="67" cy="51" r={eyes.eyeSize * 0.6} fill="#1a1a1a" />
        {/* Eye shine */}
        <circle cx="35" cy="49" r="1.2" fill="white" opacity="0.9" />
        <circle cx="69" cy="49" r="1.2" fill="white" opacity="0.9" />

        {/* Sleepy half-closed eyes */}
        {state === 'sleepy' && (
          <>
            <rect x="22" y="48" width="22" height="6" rx="3" fill="#2d2d2d" opacity="0.7" />
            <rect x="56" y="48" width="22" height="6" rx="3" fill="#2d2d2d" opacity="0.7" />
          </>
        )}

        {/* ── Nose ── */}
        <ellipse cx="50" cy="63" rx="4" ry="2.5" fill="#c44569" />

        {/* ── Mouth ── */}
        <path
          d={mouth}
          stroke="#555" strokeWidth="1.8" strokeLinecap="round" fill="none"
          style={{ transition: 'd 0.4s ease' }}
        />

        {/* ── Rosy Cheeks ── */}
        {showCheeks && (
          <>
            <ellipse cx="22" cy="62" rx="8" ry="5" fill="#ff9eb5" opacity="0.4" />
            <ellipse cx="78" cy="62" rx="8" ry="5" fill="#ff9eb5" opacity="0.4" />
          </>
        )}

        {/* ── Celebrating stars sparkle ── */}
        {state === 'celebrating' && (
          <>
            <text x="8" y="20" fontSize="10" className="panda-star" style={{ animationDelay: '0s' }}>✨</text>
            <text x="75" y="18" fontSize="8" className="panda-star" style={{ animationDelay: '0.2s' }}>⭐</text>
            <text x="82" y="35" fontSize="7" className="panda-star" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}

        {/* ── Music notes for listening state ── */}
        {state === 'listening' && (
          <>
            <text x="82" y="25" fontSize="9" className="panda-note" style={{ animationDelay: '0s' }}>♪</text>
            <text x="10" y="30" fontSize="7" className="panda-note" style={{ animationDelay: '0.3s' }}>♫</text>
          </>
        )}

        {/* ── Zzz for sleepy ── */}
        {state === 'sleepy' && (
          <>
            <text x="76" y="22" fontSize="8" className="panda-zzz" style={{ animationDelay: '0s' }}>z</text>
            <text x="82" y="14" fontSize="10" className="panda-zzz" style={{ animationDelay: '0.5s' }}>z</text>
            <text x="88" y="8"  fontSize="12" className="panda-zzz" style={{ animationDelay: '1s' }}>Z</text>
          </>
        )}
      </svg>
    </div>
  );
}
