import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatDuration } from '../../services/youtube.js';

export default function MiniPlayer() {
  const { state, actions } = usePlayer();
  const { currentSong, isPlaying, progress } = state;

  if (!currentSong) return null;

  return (
    <div
      className="mini-player"
      role="complementary"
      aria-label="Mini player"
    >
      {/* Progress bar at bottom */}
      <div
        className="mini-player-progress"
        style={{ width: `${progress * 100}%` }}
      />

      <div className="mini-player-inner">
        {/* Art */}
        {currentSong.coverUrl ? (
          <img
            className="mini-player-art"
            src={currentSong.coverUrl}
            alt={currentSong.title}
            onClick={actions.toggleFullscreen}
          />
        ) : (
          <div
            className="mini-player-art"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-surface)', fontSize:'1.25rem' }}
            onClick={actions.toggleFullscreen}
          >
            🎵
          </div>
        )}

        {/* Info */}
        <div className="mini-player-info" onClick={actions.toggleFullscreen}>
          <div className="mini-player-title">{currentSong.title}</div>
          <div className="mini-player-artist">{currentSong.artist}</div>
        </div>

        {/* Controls */}
        <button
          style={{ padding:'8px', color: 'var(--text-secondary)', flexShrink:0 }}
          onClick={(e) => { e.stopPropagation(); actions.prevTrack(); }}
          aria-label="Previous"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--text-primary)', color: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          onClick={(e) => { e.stopPropagation(); actions.togglePlay(); }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          }
        </button>

        <button
          style={{ padding:'8px', color: 'var(--text-secondary)', flexShrink:0 }}
          onClick={(e) => { e.stopPropagation(); actions.nextTrack(); }}
          aria-label="Next"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
