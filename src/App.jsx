import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { usePlayer } from './context/PlayerContext.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';
import PlayerBar from './components/Player/PlayerBar.jsx';
import FullscreenPlayer from './components/Player/FullscreenPlayer.jsx';
import MiniPlayer from './components/Player/MiniPlayer.jsx';
import YouTubePlayer from './components/Player/YouTubePlayer.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Library from './pages/Library.jsx';
import Playlist from './pages/Playlist.jsx';
import Artist from './pages/Artist.jsx';
import Stats from './pages/Stats.jsx';

function ToastContainer() {
  const { state } = usePlayer();
  if (!state.error) return null;
  return (
    <div className="toast-container">
      <div className="toast error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{state.error}</span>
      </div>
    </div>
  );
}

function MobileNav() {
  const navigate = useNavigate();
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        <div className="mobile-nav-item" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Home</span>
        </div>
        <div className="mobile-nav-item" onClick={() => navigate('/search')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Explore</span>
        </div>
        <div className="mobile-nav-item" onClick={() => navigate('/library')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>
          <span>Library</span>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const { state } = usePlayer();

  return (
    /*
     * LAYOUT ARCHITECTURE (Spotify pattern):
     *
     *  .app-shell  ← flex column, fills 100dvh
     *  ├── .app-layout  ← grid (sidebar | main), flex:1 grows to fill space
     *  │   ├── <Sidebar>
     *  │   └── <main.main-area>
     *  └── <PlayerBar>  ← natural flex child, locked 90px height at bottom
     *
     *  No position:fixed needed — zero clipping issues.
     */
    <div className="app-shell">
      {/* Hidden audio engine */}
      <YouTubePlayer />

      {/* Sidebar + Main content grid */}
      <div className="app-layout">
        <Sidebar />

        <main className="main-area">
          <header className="topbar">
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="topbar-btn" onClick={() => window.history.back()} aria-label="Go back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="topbar-btn" onClick={() => window.history.forward()} aria-label="Go forward">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <div className="user-avatar" title="Your Profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          </header>

          <div className="page-content" id="scrollable-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="/artist/:name" element={<Artist />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Player bar: second flex child — always visible at the bottom */}
      <PlayerBar />

      {/* Mobile-only overlays */}
      <MiniPlayer />
      <MobileNav />

      {/* Fullscreen player + toasts */}
      {state.showFullscreen && <FullscreenPlayer />}
      <ToastContainer />
    </div>
  );
}
