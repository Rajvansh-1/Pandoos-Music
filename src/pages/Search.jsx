import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import { searchYouTube, DEMO_SONGS } from '../services/youtube.js';
import { APP_CONFIG, GENRE_CARDS } from '../config.js';
import { showToast } from '../components/UI/Toast.jsx';
import SongRow from '../components/UI/SongRow.jsx';
import Skeleton from '../components/UI/Skeleton.jsx';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const { state } = usePlayer();
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Run initial search from URL params
  useEffect(() => {
    if (initialQ) runSearch(initialQ);
  }, []); // eslint-disable-line

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      let found;
      if (APP_CONFIG.hasYouTubeKey) {
        found = await searchYouTube(q, 20);
      } else {
        // Filter demo songs + state songs
        const all = state.songs.length ? state.songs : DEMO_SONGS;
        const ql = q.toLowerCase();
        found = all.filter(s =>
          s.title.toLowerCase().includes(ql) ||
          s.artist.toLowerCase().includes(ql)
        );
      }
      setResults(found);
      if (!found.length) showToast('No results found', 'info');
    } catch (err) {
      showToast('Search failed — check your API key', 'error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [state.songs]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), APP_CONFIG.searchDebounce);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') { clearTimeout(debounceRef.current); runSearch(query); }
  };

  return (
    <div>
      {/* ── Search Hero ── */}
      <div className="search-page-hero">
        <h1 className="search-page-title">
          Search <span style={{ background:'var(--gradient-brand)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>anything</span> 🎵
        </h1>

        <div className="search-input-wrapper">
          <span className="search-input-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Song, artist, mood…"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKey}
            aria-label="Search music"
            id="search-input"
            autoComplete="off"
          />
        </div>
      </div>

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
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No results</div>
          <div className="empty-desc">Try a different search term</div>
        </div>
      ) : (
        /* ── Genre Browse ── */
        <div style={{ padding:'var(--space-2) var(--space-4) var(--space-6)' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.125rem', fontWeight:800, marginBottom:'var(--space-4)', color:'var(--text-primary)' }}>
            Browse by Genre
          </h2>
          <div className="genre-grid">
            {GENRE_CARDS.map(g => (
              <div
                key={g.label}
                className="genre-card"
                style={{ background: g.color }}
                onClick={() => { setQuery(g.query); runSearch(g.query); }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && runSearch(g.query)}
                aria-label={`Browse ${g.label}`}
              >
                <span className="genre-card-emoji">{g.emoji}</span>
                <span className="genre-card-label">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
