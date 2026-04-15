import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = usePlayer();
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (val.trim()) navigate(`/search?q=${encodeURIComponent(val.trim())}`);
  }, [navigate]);

  const handleSearchKey = useCallback((e) => {
    if (e.key === 'Enter' && !searchVal.trim()) navigate('/search');
  }, [navigate, searchVal]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '☀️ Morning' : hour < 17 ? '🌤 Afternoon' : hour < 21 ? '🌆 Evening' : '🌙 Night';

  return (
    <header className="topbar">
      {/* Back/Forward nav arrows */}
      <div className="topbar-nav-arrows">
        <button
          className="topbar-btn"
          onClick={() => window.history.back()}
          aria-label="Go back"
          title="Back"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="topbar-btn"
          onClick={() => window.history.forward()}
          aria-label="Go forward"
          title="Forward"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Search bar — only show on desktop */}
      <div className="search-bar" style={{ display: location.pathname === '/search' ? 'none' : undefined }}>
        <input
          type="text"
          placeholder="Search songs, artists…"
          value={searchVal}
          onChange={handleSearch}
          onKeyDown={handleSearchKey}
          aria-label="Search music"
          id="topbar-search"
        />
        <span className="search-icon">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{greeting}</span>
        <div className="user-avatar" aria-label="Profile" title="Profile" role="button" tabIndex={0}>
          🐼
        </div>
      </div>
    </header>
  );
}
