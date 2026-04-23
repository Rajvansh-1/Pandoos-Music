import { usePlayer } from '../context/PlayerContext.jsx';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ paddingBottom: 100 }}>
      {/* ── Hero ── */}
      <section className="home-hero" style={{ padding: '80px 32px 40px', background: 'var(--ambient-gradient)' }}>
        <h1 className="home-greeting" style={{ fontSize: '3rem' }}>Your Vibes</h1>
        <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: 600 }}>
          Here is a breakdown of your musical journey. See what you've been listening to the most.
        </p>
      </section>

      {/* ── Stats Grid ── */}
      <section className="content-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {/* Streak Card */}
          <div style={{
            background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: 'var(--shadow-float)'
          }}>
            <div style={{ fontSize: '3rem' }}>🔥</div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Streak</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{streak} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Days</span></div>
            </div>
            {streak === 0 ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Play a song to start your streak!</div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--brand-green)', fontWeight: 600 }}>You're on fire! Keep it up tomorrow.</div>
            )}
          </div>

          {/* Plays Card */}
          <div style={{
            background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: 'var(--shadow-float)'
          }}>
            <div style={{ fontSize: '3rem' }}>🎧</div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Plays</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{totalPlays}</div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tracks enjoyed on Pandoos Music.</div>
          </div>
          
          {/* Library Card */}
          <div style={{
            background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: 'var(--shadow-float)'
          }}>
            <div style={{ fontSize: '3rem' }}>❤️</div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Liked Songs</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{state.likedSongs.size}</div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your curated collection.</div>
          </div>
        </div>
      </section>

      {/* ── Top Songs ── */}
      {topSongs.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">Your Top Anthems</h2>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '12px' }}>
            {topSongs.map((song, index) => (
              <div 
                key={song.id} 
                style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 16, alignItems: 'center',
                  padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  borderBottom: index < topSongs.length - 1 ? '1px solid var(--border-glass)' : 'none'
                }}
              >
                <img src={song.coverUrl} alt={song.title} style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{song.artist}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {state.playStats[song.id]} plays
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {topSongs.length === 0 && (
        <section className="content-section">
          <div className="empty-state">
            <div className="empty-title">No top songs yet</div>
            <div className="empty-desc">Start playing some music to see your top anthems here!</div>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/search')}>
              Explore Music
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
