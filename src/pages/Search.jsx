import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { searchYouTube, DEMO_SONGS } from '../services/youtube.js';
import { APP_CONFIG } from '../config.js';
import SongRow from '../components/UI/SongRow.jsx';

export default function Search() {
  const { actions } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (APP_CONFIG.hasYouTubeKey) {
          const res = await searchYouTube(query, 12);
          setResults(res);
        } else {
          // Demo mode fallback
          const q = query.toLowerCase();
          const filtered = DEMO_SONGS.filter(s => 
            s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
          );
          setResults(filtered);
        }
      } catch (err) {
        setError(err.message || 'Failed to search');
      } finally {
        setIsLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const genres = [
    { name: 'Pop Hits', color: 'linear-gradient(135deg, #FF6B6B, #FF8E53)', icon: '🔥' },
    { name: 'Hip Hop', color: 'linear-gradient(135deg, #4E65FF, #92EFFD)', icon: '🎤' },
    { name: 'Chill Vibes', color: 'linear-gradient(135deg, #667EEA, #764BA2)', icon: '🌙' },
    { name: 'Workout', color: 'linear-gradient(135deg, #00C9FF, #92FE9D)', icon: '💪' },
    { name: 'Electronic', color: 'linear-gradient(135deg, #F953C6, #B91D73)', icon: '⚡' },
    { name: 'Acoustic', color: 'linear-gradient(135deg, #F2994A, #F2C94C)', icon: '🎸' },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* ── Search Hero ── */}
      <section className="search-page-hero">
        <h1 className="search-page-title">Explore Universe</h1>
        
        <div className="search-input-wrapper">
          <svg className="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button 
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}
              onClick={() => setQuery('')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* ── Results or Genres ── */}
      {query.trim() ? (
        <div className="content-section">
          {isLoading ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: 0.7 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--ambient-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              <span>Scanning audio network...</span>
            </div>
          ) : error ? (
            <div style={{ color: 'var(--brand-red)' }}>{error}</div>
          ) : results.length > 0 ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)', padding: '12px' }}>
              {results.map((song, i) => (
                <SongRow key={song.id} song={song} queue={results} index={i} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', opacity: 0.5 }}>🪐</div>
              <div className="empty-title" style={{ fontSize: '1.25rem' }}>No signals found</div>
              <div className="empty-desc">Try searching for a different artist, song, or frequency.</div>
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          <h2 className="section-title">Browse Frequencies</h2>
          <div className="genre-grid">
            {genres.map(g => (
              <div 
                key={g.name} 
                className="genre-card"
                style={{ background: g.color }}
                onClick={() => setQuery(g.name)}
              >
                <div className="genre-card-label">{g.name}</div>
                <div className="genre-card-emoji">{g.icon}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
