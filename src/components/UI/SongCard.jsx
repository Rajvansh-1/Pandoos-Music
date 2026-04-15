import { usePlayer } from '../../context/PlayerContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function SongCard({ song, queue, index = 0 }) {
  const navigate = useNavigate();
  const { state, actions } = usePlayer();
  const isCurrent = state.currentSong?.id === song.id;
  const isPlaying  = isCurrent && state.isPlaying;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) { actions.togglePlay(); }
    else { actions.playSong(song, queue || [song], index); }
  };

  return (
    <div
      className={`song-card${isCurrent ? ' is-playing' : ''}`}
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handlePlay(e)}
      aria-label={`Play ${song.title}`}
    >
      {/* Art */}
      <div style={{ position: 'relative' }}>
        {song.coverUrl ? (
          <img
            className="card-art"
            src={song.coverUrl}
            alt={song.title}
            loading="lazy"
          />
        ) : (
          <div
            className="card-art-placeholder"
            style={{ background: 'linear-gradient(135deg,#0d2b1e,#1a0d2b)' }}
          >
            🎵
          </div>
        )}

        {/* Play button overlay */}
        <div className="card-play-btn" onClick={handlePlay}>
          {isPlaying
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--bg-base)"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--bg-base)"><path d="M8 5v14l11-7z"/></svg>
          }
        </div>

        {/* Playing indicator */}
        {isPlaying && (
          <div style={{
            position:'absolute', top:8, left:8,
            display:'flex', gap:2, alignItems:'flex-end', height:18,
          }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                width:3, borderRadius:2,
                background:'var(--brand-green)',
                height: `${10 + i * 4}px`,
                animation:`visualizerBounce ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
        )}
      </div>

      <div className="card-title" title={song.title}>{song.title}</div>
      <div 
        className="card-subtitle hover-link" 
        title={song.artist}
        onClick={(e) => { e.stopPropagation(); navigate(`/artist/${encodeURIComponent(song.artist)}`); }}
        style={{ cursor: 'pointer', display: 'inline-block' }}
      >
        {song.artist}
      </div>
    </div>
  );
}
