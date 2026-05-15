import { usePlayer } from '../context/PlayerContext.jsx';
import { useNavigate } from 'react-router-dom';
import PandaLogo from '../components/Brand/PandaLogo.jsx';
import { useGamificationStore, BADGE_DEFINITIONS } from '../stores/useGamificationStore';
import XPProgress from '../features/gamification/XPProgress';
import './Stats.css';

export default function Stats() {
  const { state } = usePlayer();
  const navigate = useNavigate();
  const gamification = useGamificationStore();

  const totalPlays = gamification.totalSongsPlayed;
  const streak = gamification.currentStreak;
  
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

      {/* ── Gamification XP & Badges ── */}
      <section className="content-section">
        <h2 className="section-title">Your Progress</h2>
        <div style={{ marginBottom: 32 }}>
          <XPProgress />
        </div>

        <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: 32 }}>Unlocked Badges</h3>
        <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {gamification.unlockedBadges.length === 0 ? (
            <div className="text-secondary" style={{ gridColumn: '1 / -1', padding: 32, textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 16 }}>
              Play music to unlock your first badge!
            </div>
          ) : (
            gamification.unlockedBadges.map((badgeId) => {
              const badge = BADGE_DEFINITIONS[badgeId];
              if (!badge) return null;
              return (
                <div key={badgeId} style={{ 
                  background: 'var(--bg-surface)', 
                  padding: 16, 
                  borderRadius: 16, 
                  textAlign: 'center',
                  border: '1px solid var(--border-glass)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                }}>
                  <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                    {badge.emoji}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem' }}>
                    {badge.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {badge.description}
                  </div>
                </div>
              );
            })
          )}
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
