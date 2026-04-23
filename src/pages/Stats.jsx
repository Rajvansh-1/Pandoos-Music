import { usePlayer } from '../context/PlayerContext.jsx';
import { useNavigate } from 'react-router-dom';
import PandaLogo from '../components/Brand/PandaLogo.jsx';
import './Stats.css';

export default function Stats() {
  const { state } = usePlayer();
  const navigate = useNavigate();

  const totalPlays = Object.values(state.playStats || {}).reduce((a, b) => a + b, 0);
  const streak = state.currentStreak || 0;
  
  // Get top songs
  const topSongIds = Object.entries(state.playStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id]) => id);
    
  const topSongs = topSongIds.map(id => state.songs.find(s => s.id === id)).filter(Boolean);

  return (
    <div className="stats-container">
      {/* ── Wrapped Style Hero ── */}
      <section className="stats-hero">
        <div className="stats-hero-bg"></div>
        <div className="stats-hero-content">
          <PandaLogo size={80} className="stats-panda" />
          <h1 className="stats-title">Your Aura</h1>
          <p className="stats-subtitle">
            A reflection of your musical journey. Here's your personalized Pandoos Wrapped.
          </p>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section className="content-section" style={{ position: 'relative', zIndex: 2, marginTop: -40 }}>
        <div className="stats-grid">
          {/* Streak Card */}
          <div className="stats-card premium-border">
            <div className="stats-card-bg streak-bg"></div>
            <div className="stats-card-content">
              <div className="stats-icon">🔥</div>
              <div>
                <div className="stats-label">Bamboo Streak</div>
                <div className="stats-value">{streak} <span className="stats-unit">Days</span></div>
              </div>
              {streak === 0 ? (
                <div className="stats-msg text-secondary">Start playing to build your streak!</div>
              ) : (
                <div className="stats-msg text-green">You're on fire! Keep it up tomorrow.</div>
              )}
            </div>
          </div>

          {/* Plays Card */}
          <div className="stats-card premium-border">
            <div className="stats-card-bg plays-bg"></div>
            <div className="stats-card-content">
              <div className="stats-icon">🎧</div>
              <div>
                <div className="stats-label">Total Plays</div>
                <div className="stats-value">{totalPlays}</div>
              </div>
              <div className="stats-msg text-secondary">Tracks enjoyed on Pandoos.</div>
            </div>
          </div>
          
          {/* Library Card */}
          <div className="stats-card premium-border">
            <div className="stats-card-bg liked-bg"></div>
            <div className="stats-card-content">
              <div className="stats-icon">❤️</div>
              <div>
                <div className="stats-label">Liked Songs</div>
                <div className="stats-value">{state.likedSongs.size}</div>
              </div>
              <div className="stats-msg text-secondary">Your curated collection.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Songs ── */}
      {topSongs.length > 0 && (
        <section className="content-section pb-32">
          <h2 className="section-title">Top Anthems</h2>
          <div className="stats-top-songs premium-border">
            {topSongs.map((song, index) => (
              <div key={song.id} className="stats-song-row">
                <div className="stats-song-rank">#{index + 1}</div>
                <img src={song.coverUrl} alt={song.title} className="stats-song-art" />
                <div className="stats-song-info">
                  <div className="stats-song-title">{song.title}</div>
                  <div className="stats-song-artist">{song.artist}</div>
                </div>
                <div className="stats-song-plays">
                  {state.playStats[song.id]} plays
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {topSongs.length === 0 && (
        <section className="content-section">
          <div className="stats-empty premium-border">
            <div className="stats-empty-title">No top songs yet</div>
            <div className="stats-empty-desc">Start playing some music to see your top anthems here!</div>
            <button className="btn-primary luxury-btn-sm" onClick={() => navigate('/search')}>
              Explore Music
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
