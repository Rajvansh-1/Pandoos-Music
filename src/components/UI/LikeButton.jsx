import { useCallback } from 'react';

export default function LikeButton({ liked, onClick, size = 22 }) {
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onClick?.();
  }, [onClick]);

  return (
    <button
      className={`icon-btn${liked ? ' active' : ''}`}
      onClick={handleClick}
      aria-label={liked ? 'Unlike' : 'Like'}
      title={liked ? 'Unlike (L)' : 'Like (L)'}
      style={{ animation: liked ? 'heartbeat 0.4s ease' : 'none' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        style={{ color: liked ? 'var(--brand-green)' : undefined }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
