import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import { searchYouTube, DEMO_SONGS } from '../services/youtube.js';
import { APP_CONFIG } from '../config.js';
import SongRow from '../components/UI/SongRow.jsx';
import './Search.css';

export default function Search() {
  const { actions } = usePlayer();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
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

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  const genres = [
    { name: 'Pop Hits', color: '#FF6B6B', icon: '🔥' },
    { name: 'Hip Hop', color: '#4E65FF', icon: '🎤' },
    { name: 'Chill Vibes', color: '#667EEA', icon: '🌙' },
    { name: 'Workout', color: '#00C9FF', icon: '💪' },
    { name: 'Electronic', color: '#F953C6', icon: '⚡' },
    { name: 'Acoustic', color: '#F2994A', icon: '🎸' },
    { name: 'K-Pop', color: '#a78bfa', icon: '✨' },
    { name: 'Indie', color: '#10b981', icon: '🌿' },
  ];

  return (
    <div className="search-container">
      {/* ── Search Hero ── */}
      <div className="search-page-hero">
        <h1 className="search-page-title">
          Search <span style={{ background:'var(--gradient-brand)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>anything</span> 🍃
        </h1>

        <div className="search-input-wrapper">
          <svg className="search-input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={handleQueryChange}
            autoFocus
          />
          {query && (
            <button className="search-clear-btn" onClick={clearSearch}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <div className="search-input-glow"></div>
        </div>
      </section>

      {/* ── Results ── */}
      {loading ? (
        <div style={{ padding: 'var(--space-6)' }}>
          <Skeleton type="list" count={8} />
        </div>
      ) : searched && results.length > 0 ? (
        <div style={{ padding: 'var(--space-2) var(--space-4) var(--space-6)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-4)', padding:'0 var(--space-2)' }}>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-muted)' }}>
              {results.length} results for "{query}"
            </h2>
          </div>
          <div className="song-list">
            {results.map((song, i) => (
              <SongRow key={song.id + i} song={song} index={i} queue={results} />
            ))}
          </div>
        </div>
      ) : searched && results.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-icon">🐼</div>
          <div className="empty-title">No results</div>
          <div className="empty-desc">Try a different search term</div>
        </div>
      ) : (
        <div className="content-section">
          <h2 className="section-title">Browse Frequencies</h2>
          <div className="premium-genre-grid">
            {genres.map(g => (
              <div 
                key={g.name} 
                className="premium-genre-card"
                style={{ '--genre-color': g.color }}
                onClick={() => handleQueryChange({ target: { value: g.name } })}
              >
                <div className="genre-bg-glow"></div>
                <div className="genre-particles"></div>
                <div className="genre-content">
                  <div className="genre-label">{g.name}</div>
                  <div className="genre-emoji">{g.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
