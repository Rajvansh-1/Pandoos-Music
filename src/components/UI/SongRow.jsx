import { usePlayer } from '../../context/PlayerContext.jsx';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton.jsx';
import { formatDuration } from '../../services/youtube.js';

export default function SongRow({ song, index, queue, showIndex = true }) {
  const navigate = useNavigate();
  const { state, actions } = usePlayer();
  const isPlaying = state.currentSong?.id === song.id && state.isPlaying;
  const isCurrent = state.currentSong?.id === song.id;
  const isLiked = state.likedSongs.has(song.id);

  const handlePlay = () => {
    if (isCurrent) {
      actions.togglePlay();
    } else {
      actions.playSong(song, queue || [song], queue ? queue.findIndex(s => s.id === song.id) : 0);
    }
  };

  return (
    <div
      className={`song-row${isCurrent ? ' is-playing' : ''}`}
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handlePlay()}
      aria-label={`Play ${song.title} by ${song.artist}`}
    >
      {/* Index / play icon */}
      {showIndex && (
        <div className="song-row-num">
          <span className="row-num-text">{index + 1}</span>
          <span className="row-play-icon">
            {isPlaying
              ? <EqualizerIcon />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            }
          </span>
        </div>
      )}

      {/* Art + info */}
      <div className="song-row-art-and-info">
        {song.coverUrl ? (
          <img className="song-row-art" src={song.coverUrl} alt={song.title} />
        ) : (
          <div
            className="song-row-art"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-surface)', fontSize: '1rem',
            }}
          >
            🎵
          </div>
        )}
        <div className="song-row-text">
          <div className="song-row-title">{song.title}</div>
          <div 
            className="song-row-artist hover-link" 
            title={song.artist}
            onClick={(e) => { e.stopPropagation(); navigate(`/artist/${encodeURIComponent(song.artist)}`); }}
            style={{ cursor: 'pointer' }}
          >
            {song.artist}
          </div>
        </div>
      </div>

      {/* Duration */}
      <span className="song-row-duration">{formatDuration(song.duration)}</span>

      {/* Actions (visible on hover) */}
      <div className="song-row-actions" onClick={e => e.stopPropagation()}>
        <LikeButton liked={isLiked} onClick={() => actions.toggleLike(song.id)} size={18} />
      </div>
    </div>
  );
}

function EqualizerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--brand-green)">
      <rect x="2"  y="10" width="4" height="14" rx="1">
        <animate attributeName="height" values="14;6;14"  dur="0.8s" repeatCount="indefinite"/>
        <animate attributeName="y"      values="10;18;10" dur="0.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="10" y="6"  width="4" height="18" rx="1">
        <animate attributeName="height" values="18;8;18"  dur="0.6s" repeatCount="indefinite"/>
        <animate attributeName="y"      values="6;16;6"   dur="0.6s" repeatCount="indefinite"/>
      </rect>
      <rect x="18" y="12" width="4" height="12" rx="1">
        <animate attributeName="height" values="12;4;12"  dur="1s"   repeatCount="indefinite"/>
        <animate attributeName="y"      values="12;20;12" dur="1s"   repeatCount="indefinite"/>
      </rect>
    </svg>
  );
}
