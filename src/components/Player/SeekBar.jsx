import { useState, useRef, useCallback, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatDuration } from '../../services/youtube.js';
import './SeekBar.css';

export default function SeekBar() {
  const { state, actions } = usePlayer();
  const { progress, currentTime, duration } = state;

  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, time: 0 });
  const isDraggingRef = useRef(false);

  // Compute the displayed progress (use drag value while dragging for instant feedback)
  const displayProgress = isDragging ? dragProgress : progress;

  // ── Ratio from mouse/touch event ────────────────────────────────────────
  const getRatio = useCallback((clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  // ── Pointer Down (start drag) ────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    if (!trackRef.current) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    const ratio = getRatio(e.clientX);
    setDragProgress(ratio);
    trackRef.current.setPointerCapture(e.pointerId);
  }, [getRatio]);

  // ── Pointer Move ─────────────────────────────────────────────────────────
  const handlePointerMove = useCallback((e) => {
    const ratio = getRatio(e.clientX);

    // Always update tooltip on mouse move
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      setTooltip({ visible: true, x, time: ratio * (duration || 0) });
    }

    if (isDraggingRef.current) {
      setDragProgress(ratio);
    }
  }, [getRatio, duration]);

  // ── Pointer Up (end drag, seek) ──────────────────────────────────────────
  const handlePointerUp = useCallback((e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    const ratio = getRatio(e.clientX);
    actions.seek(ratio);
  }, [getRatio, actions]);

  // ── Mouse Leave (hide tooltip) ───────────────────────────────────────────
  const handlePointerLeave = useCallback(() => {
    if (!isDraggingRef.current) {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, []);

  // ── Click seek (non-drag click) ──────────────────────────────────────────
  const handleClick = useCallback((e) => {
    const ratio = getRatio(e.clientX);
    actions.seek(ratio);
  }, [getRatio, actions]);

  // ── Keyboard seek ────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); actions.seek(Math.min(1, progress + 0.02)); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); actions.seek(Math.max(0, progress - 0.02)); }
    if (e.key === 'Home')       { e.preventDefault(); actions.seek(0); }
    if (e.key === 'End')        { e.preventDefault(); actions.seek(1); }
  }, [actions, progress]);

  return (
    <div className="seek-container">
      <span className="seek-time seek-time-current">
        {formatDuration(isDragging ? dragProgress * (duration || 0) : currentTime)}
      </span>

      <div
        className={`seek-track-wrapper${isDragging ? ' dragging' : ''}`}
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Seek bar"
        aria-valuenow={Math.round(displayProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={formatDuration(currentTime)}
      >
        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="seek-tooltip"
            style={{ left: `${tooltip.x}px` }}
            aria-hidden="true"
          >
            {formatDuration(tooltip.time)}
          </div>
        )}

        {/* Track */}
        <div className="seek-track">
          {/* Buffered indicator */}
          <div
            className="seek-buffered"
            style={{ width: `${Math.min(100, displayProgress * 100 * 1.15 + 5)}%` }}
            aria-hidden="true"
          />
          {/* Filled progress */}
          <div
            className="seek-fill"
            style={{ width: `${displayProgress * 100}%` }}
            aria-hidden="true"
          />
          {/* Thumb */}
          <div
            className="seek-thumb"
            style={{ left: `${displayProgress * 100}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <span className="seek-time seek-time-total">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
