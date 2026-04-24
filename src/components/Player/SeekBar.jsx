import { useCallback, useState, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatDuration } from '../../services/youtube.js';

export default function SeekBar({ large = false }) {
  const { state, actions } = usePlayer();
  const { progress, currentTime, duration } = state;
  const [isDragging, setIsDragging] = useState(false);
  const [hoverRatio, setHoverRatio] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const trackRef = useRef(null);

  const getRatio = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    const ratio = getRatio(e);
    setHoverRatio(ratio);

    const onMove = (mv) => {
      const r = Math.max(0, Math.min(1, (mv.clientX - trackRef.current.getBoundingClientRect().left) / trackRef.current.getBoundingClientRect().width));
      setHoverRatio(r);
    };
    const onUp = (up) => {
      const r = Math.max(0, Math.min(1, (up.clientX - trackRef.current.getBoundingClientRect().left) / trackRef.current.getBoundingClientRect().width));
      actions.seek(r);
      setIsDragging(false);
      setHoverRatio(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [actions]); // eslint-disable-line

  const handleMouseMove = useCallback((e) => {
    if (isDragging) return;
    setHoverRatio(getRatio(e));
  }, [isDragging]); // eslint-disable-line

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') actions.seek(Math.min(1, progress + 0.02));
    if (e.key === 'ArrowLeft')  actions.seek(Math.max(0, progress - 0.02));
  }, [actions, progress]);

  const displayRatio = isDragging && hoverRatio !== null ? hoverRatio : progress;
  const displayTime  = isDragging && hoverRatio !== null
    ? hoverRatio * (duration || 0)
    : currentTime;
  const active = isHovering || isDragging;

  return (
    <div className={`seek-container${large ? ' seek-container--large' : ''}`}>
      <span className="seek-time">{formatDuration(displayTime)}</span>

      <div
        className={`seek-bar${active ? ' seek-bar--active' : ''}`}
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); if (!isDragging) setHoverRatio(null); }}
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      >
        <div className="seek-track">
          {/* Buffer ghost (faded fill slightly ahead) */}
          <div className="seek-buffer" style={{ width: `${Math.min(100, displayRatio * 100 + 8)}%` }} />
          {/* Playback fill */}
          <div className="seek-fill" style={{ width: `${displayRatio * 100}%` }}>
            {/* Glowing dot thumb */}
            <div className={`seek-thumb${active ? ' seek-thumb--active' : ''}`} />
          </div>
        </div>
      </div>

      <span className="seek-time">{formatDuration(duration)}</span>
    </div>
  );
}
