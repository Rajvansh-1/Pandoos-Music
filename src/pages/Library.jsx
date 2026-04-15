import { usePlayer } from '../context/PlayerContext.jsx';
import { useNavigate } from 'react-router-dom';
import SongRow from '../components/UI/SongRow.jsx';
import PlaylistCard from '../components/UI/PlaylistCard.jsx';

export default function Library() {
  const { state, actions } = usePlayer();
  const navigate = useNavigate();

  const likedSongs = state.songs.filter(s => state.likedSongs.has(s.id));
  const recentlyPlayed = state.recentlyPlayed;
  const allPlaylists = state.playlists;

  return (
    <div>
      {/* ── Header ── */}
      <div className="library-header">
        <h1 className="library-title">
          Your <span style={{ background:'var(--gradient-brand)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Library</span>
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', fontWeight:600, marginTop:'var(--space-2)' }}>
          {likedSongs.length} liked · {recentlyPlayed.length} recently played
        </p>
      </div>

      {/* ── Playlists ── */}
      {allPlaylists.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Playlists</h2>
          </div>
          <div className="card-grid">
            {allPlaylists.map(pl => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </div>
      )}

      {/* ── Liked Songs ── */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">❤️ Liked Songs</h2>
          {likedSongs.length > 0 && (
            <button
              className="btn-primary"
              style={{ padding:'var(--space-2) var(--space-4)', fontSize:'0.8125rem' }}
              onClick={() => {
                if (likedSongs.length) actions.playSong(likedSongs[0], likedSongs, 0);
              }}
            >
              ▶ Play All
            </button>
          )}
        </div>

        {likedSongs.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 200 }}>
            <div className="empty-icon">❤️</div>
            <div className="empty-title">No Liked Songs Yet</div>
            <div className="empty-desc">Hit the heart icon on any song to save it here</div>
          </div>
        ) : (
          <div className="song-list">
            {likedSongs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={likedSongs} />
            ))}
          </div>
        )}
      </div>

      {/* ── Recently Played ── */}
      {recentlyPlayed.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">🕐 Recently Played</h2>
          </div>
          <div className="song-list">
            {recentlyPlayed.slice(0, 10).map((song, i) => (
              <SongRow key={song.id + i} song={song} index={i} queue={recentlyPlayed} />
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 'var(--space-12)' }} />
    </div>
  );
}
