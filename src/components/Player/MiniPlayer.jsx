import { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import './MiniPlayer.css';

export default function MiniPlayer() {
  const { state, actions } = usePlayer();
  const { currentSong, isPlaying, progress } = state;
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  if (!currentSong) return null;

  const handleTouchStart = (e) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.x || !touchStart.y) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const dx = touchStart.x - touchEndX;
    const dy = touchStart.y - touchEndY;
    
    // Thresholds
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) actions.nextTrack(); // Swipe Left -> Next
      else actions.prevTrack();        // Swipe Right -> Prev
    } else if (Math.abs(dy) > 50 && dy > 0) {
      actions.toggleFullscreen();      // Swipe Up -> Fullscreen
    }
    
    setTouchStart({ x: 0, y: 0 });
  };

  return (
    <div
      className={`mini-player luxury-mini-player ${isPlaying ? 'is-playing' : ''}`}
      role="complementary"
      aria-label="Mini player"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={actions.toggleFullscreen}
    >
      <div className="mini-player-glass-bg"></div>

      {/* Progress bar at top/bottom */}
      <div
        className="mini-player-progress"
        style={{ width: `${progress * 100}%` }}
      />

      <div className="mini-player-inner">
        {/* Art */}
        <div className="mini-art-wrapper">
          {currentSong.coverUrl ? (
            <img
              className="mini-player-art luxury-mini-art"
              src={currentSong.coverUrl}
              alt={currentSong.title}
            />
          ) : (
            <div className="mini-player-art luxury-mini-art flex-center bg-surface text-lg">
              🎵
            </div>
          )}
          {isPlaying && <div className="mini-playing-indicator"></div>}
        </div>

        {/* Info */}
        <div className="mini-player-info">
          <div className="mini-player-title truncate">{currentSong.title}</div>
          <div className="mini-player-artist truncate">{currentSong.artist}</div>
        </div>

        {/* Controls */}
        <div className="mini-controls" onClick={e => e.stopPropagation()}>
          <button
            className="icon-btn"
            onClick={actions.prevTrack}
            aria-label="Previous"
          >
            <PrevIcon />
          </button>

          <button
            className="mini-play-btn"
            onClick={actions.togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            className="icon-btn"
            onClick={actions.nextTrack}
            aria-label="Next"
          >
            <NextIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

const PlayIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>;
const NextIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>;
