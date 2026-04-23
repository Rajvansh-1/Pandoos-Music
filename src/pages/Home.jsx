import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongCard from '../components/UI/SongCard.jsx';
import SongRow from '../components/UI/SongRow.jsx';
import { fetchTrendingMusic } from '../services/youtube.js';

export default function Home() {
  const { state, actions } = usePlayer();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ trending: [], playlists: [] });
  
  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

  useEffect(() => {
    // We already fetch global songs in App/index usually, but here we can load local page data
    if (state.songs.length > 0) {
      setIsLoading(false);
      setData({ trending: state.songs.slice(0, 10), playlists: state.playlists });
    } else {
      fetchTrendingMusic(20).then(res => {
        setData({ trending: res, playlists: [] });
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [state.songs]); // eslint-disable-line

  // Gamified sections
  const quickPicks = state.recentlyPlayed.slice(0, 6);
  const forYou = data.trending.slice(0, 6);
  const topHits = data.trending.slice(6, 10);

  if (isLoading) {
    return (
      <div style={{ padding: '120px 40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ fontSize: '2rem', animation: 'breathe 2s infinite' }}>✨</div>
      </div>
    );
  }

  return (
    <div className="home-container" style={{ paddingBottom: 100 }}>
      {/* ── Cinematic Hero ── */}
      <section className="home-hero">
        <div className="hero-bg-layer"></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            Your Daily Mix
          </div>
          <h1 className="home-greeting">{greeting}</h1>
          <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: 32, fontWeight: 500, maxWidth: 500 }}>
            Jump back into your rhythm or discover something entirely new, curated just for your mood today.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              style={{
                background: 'var(--ambient-primary)', color: '#000', padding: '14px 32px', borderRadius: 99,
                fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 24px var(--ambient-glow)', transition: 'var(--transition-spring)'
              }}
              onClick={() => {
                if (quickPicks.length > 0) actions.playSong(quickPicks[0], quickPicks, 0);
                else if (data.trending.length > 0) actions.playSong(data.trending[0], data.trending, 0);
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <PlayIcon /> Listen Now
            </button>
            <button
              style={{
                background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-glass)', padding: '14px 32px', borderRadius: 99,
                fontWeight: 700, fontSize: '1rem', transition: 'var(--transition-base)'
              }}
              onClick={() => navigate('/search')}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              Explore Vibes
            </button>
          </div>
        </div>
      </section>

      {/* ── Quick Picks (Spotify style 2x3 grid) ── */}
      {quickPicks.length > 0 && (
        <section className="content-section" style={{ marginTop: -40, position: 'relative', zIndex: 2 }}>
          <h2 className="section-title">Jump Back In</h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px'
          }}>
            {quickPicks.map((song, i) => (
              <div 
                key={song.id}
                style={{
                  display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'var(--transition-base)',
                  border: '1px solid var(--border-glass)'
                }}
                onClick={() => actions.playSong(song, quickPicks, i)}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <img src={song.coverUrl} alt="" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                <div style={{ padding: '0 16px', fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.title}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Made For You ── */}
      {forYou.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">
            Made For You
            <span style={{ marginLeft: 12, fontSize: '0.75rem', padding: '4px 8px', background: 'var(--ambient-glow)', color: 'var(--ambient-primary)', borderRadius: 12, fontWeight: 800 }}>
              AI CURATED
            </span>
          </h2>
          <div className="card-grid">
            {forYou.map((song, i) => (
              <SongCard key={song.id} song={song} queue={forYou} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Top Hits Row ── */}
      {topHits.length > 0 && (
        <section className="content-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Trending Globally</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-green)', display: 'inline-block', animation: 'pulseBeat 2s infinite' }}></span>
              Live Updates
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '12px' }}>
            {topHits.map((song, i) => (
              <SongRow key={song.id} song={song} queue={topHits} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Visual Mood Picker ── */}
      <section className="content-section">
        <h2 className="section-title">Vibe Check</h2>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
          {['Chill', 'Focus', 'Workout', 'Party', 'Sleep', 'Romance'].map(mood => (
            <div 
              key={mood}
              onClick={() => navigate('/search')}
              style={{
                minWidth: 160, height: 100, borderRadius: 'var(--radius-md)',
                background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.4))`,
                display: 'flex', alignItems: 'flex-end', padding: 16, cursor: 'pointer',
                border: '1px solid var(--border-glass)', transition: 'var(--transition-spring)',
                position: 'relative', overflow: 'hidden'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
            >
              <div style={{ position: 'relative', zIndex: 1, fontWeight: 800, fontSize: '1.25rem' }}>{mood}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
