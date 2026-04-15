import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongRow from '../components/UI/SongRow.jsx';

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = usePlayer();

  const playlist = state.playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="empty-state" style={{ minHeight:'80vh' }}>
        <div className="empty-icon">🐼</div>
        <div className="empty-title">Playlist not found</div>
        <button className="btn-primary" style={{marginTop:'var(--space-4)'}} onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  // Resolve song IDs to song objects
  const songs = id === 'pl_liked'
    ? state.songs.filter(s => state.likedSongs.has(s.id))
    : playlist.songIds.map(sid => state.songs.find(s => s.id === sid)).filter(Boolean);

  const handlePlayAll = () => {
    if (songs.length) actions.playSong(songs[0], songs, 0);
  };

  const handleShuffle = () => {
    if (!songs.length) return;
    actions.toggleShuffle();
    const idx = Math.floor(Math.random() * songs.length);
    actions.playSong(songs[idx], songs, idx);
  };

  return (
    <div>
      {/* ── Hero banner ── */}
      <div className="playlist-hero" style={{ background: playlist.gradient }}>
        {/* Overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(6,6,8,0.8) 0%, transparent 60%)', pointerEvents:'none' }} />

        <div className="playlist-hero-art" style={{ background: playlist.gradient }}>
          <span style={{ fontSize:'5rem' }}>{playlist.emoji}</span>
        </div>

        <div className="playlist-hero-info" style={{ position:'relative', zIndex:1 }}>
          <div className="playlist-hero-type">Playlist</div>
          <h1 className="playlist-hero-name">{playlist.name}</h1>
          <p className="playlist-hero-desc">{playlist.description}</p>
          <div className="playlist-hero-meta">
            {songs.length} songs
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="playlist-actions">
        <button className="btn-primary" onClick={handlePlayAll} disabled={!songs.length}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Play All
        </button>
        <button className="btn-ghost" onClick={handleShuffle} disabled={!songs.length}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            <line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
          Shuffle
        </button>
      </div>

      {/* ── Song list ── */}
      <div style={{ padding: '0 var(--space-4) var(--space-8)' }}>
        {songs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{playlist.emoji}</div>
            <div className="empty-title">No songs yet</div>
            <div className="empty-desc">
              {id === 'pl_liked' ? 'Like songs to add them here' : 'This playlist is empty'}
            </div>
          </div>
        ) : (
          <div className="song-list">
            {songs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={songs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
