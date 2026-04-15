import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';
import Topbar from './components/Layout/Topbar.jsx';
import MobileNav from './components/Layout/MobileNav.jsx';
import PlayerBar from './components/Player/PlayerBar.jsx';
import MiniPlayer from './components/Player/MiniPlayer.jsx';
import FullscreenPlayer from './components/Player/FullscreenPlayer.jsx';
import YouTubePlayer from './components/Player/YouTubePlayer.jsx';
import Toast from './components/UI/Toast.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Library from './pages/Library.jsx';
import Playlist from './pages/Playlist.jsx';
import Artist from './pages/Artist.jsx';

function AppShell() {
  const { state } = usePlayer();

  return (
    <div className="app-layout">
      {/* ── Hidden YouTube audio engine ── */}
      <YouTubePlayer />

      {/* ── Desktop Sidebar ── */}
      <Sidebar />

      {/* ── Main content area ── */}
      <div className="main-area">
        <Topbar />
        <div className="page-content" id="page-scroll">
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/search"       element={<Search />} />
            <Route path="/library"      element={<Library />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/artist/:name" element={<Artist />} />
            <Route path="*"             element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* ── Desktop Player Bar ── */}
      <PlayerBar />

      {/* ── Mobile: Mini player + bottom nav ── */}
      <MiniPlayer />
      <MobileNav />

      {/* ── Fullscreen overlay ── */}
      {state.showFullscreen && <FullscreenPlayer />}

      {/* ── Toast notifications ── */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <AppShell />
      </PlayerProvider>
    </BrowserRouter>
  );
}
