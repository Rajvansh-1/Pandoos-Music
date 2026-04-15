import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';

export default function PlaylistCard({ playlist }) {
  const navigate  = useNavigate();
  const { state, actions } = usePlayer();

  const songCount = playlist.id === 'pl_liked'
    ? state.likedSongs.size
    : playlist.songIds.length;

  const handlePlay = (e) => {
    e.stopPropagation();
    const s = playlist.id === 'pl_liked'
      ? state.songs.filter(s => state.likedSongs.has(s.id))
      : playlist.songIds.map(id => state.songs.find(s => s.id === id)).filter(Boolean);
    if (s.length) actions.playSong(s[0], s, 0);
  };

  return (
    <div
      className="playlist-card"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/playlist/${playlist.id}`)}
      aria-label={`Open playlist ${playlist.name}`}
    >
      {/* Art */}
      <div style={{ position: 'relative' }}>
        <div
          className="card-art-placeholder"
          style={{ background: playlist.gradient, fontSize: '2.5rem', borderRadius:'var(--radius-md)', marginBottom:'var(--space-3)' }}
        >
          {playlist.emoji}
        </div>
        <div className="card-play-btn" onClick={handlePlay}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--bg-base)">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <div className="card-title">{playlist.name}</div>
      <div className="card-subtitle">{songCount} songs</div>
    </div>
  );
}
