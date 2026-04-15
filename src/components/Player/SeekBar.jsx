import { useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatDuration } from '../../services/youtube.js';

export default function SeekBar() {
  const { state, actions } = usePlayer();
  const { progress, currentTime, duration } = state;

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    actions.seek(Math.max(0, Math.min(1, ratio)));
  }, [actions]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') actions.seek(Math.min(1, progress + 0.02));
    if (e.key === 'ArrowLeft')  actions.seek(Math.max(0, progress - 0.02));
  }, [actions, progress]);

  return (
    <div className="seek-container">
      <span className="seek-time">{formatDuration(currentTime)}</span>
      <div
        className="seek-bar"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="seek-track">
          <div
            className="seek-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <span className="seek-time">{formatDuration(duration)}</span>
    </div>
  );
}
