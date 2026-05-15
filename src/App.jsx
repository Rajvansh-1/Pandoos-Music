import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './context/PlayerContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';
import PlayerBar from './components/Player/PlayerBar.jsx';
import FullscreenPlayer from './components/Player/FullscreenPlayer.jsx';
import MiniPlayer from './components/Player/MiniPlayer.jsx';
import YouTubePlayer from './components/Player/YouTubePlayer.jsx';
import Toast from './components/UI/Toast.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Library from './pages/Library.jsx';
import Playlist from './pages/Playlist.jsx';
import Artist from './pages/Artist.jsx';
import Auth from './pages/Auth.jsx';
import Settings from './pages/Settings.jsx';
import Downloads from './pages/Downloads.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function ToastContainer() {
  const { state } = usePlayer();
  const { user } = useAuth();

  return (
    <div className={`app-layout${state.isPlaying ? ' app-is-playing' : ''}`}>
      <YouTubePlayer />

      {user && <Sidebar />}

      <div className="main-area" style={!user ? { gridColumn: '1 / -1' } : {}}>
        {user && <Topbar />}
        <div className="page-content" id="page-scroll">
          <Routes>
            <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
            <Route path="/"            element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/search"      element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/library"     element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/favorites"   element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
            <Route path="/downloads"   element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/playlist/:id" element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
            <Route path="/artist/:name" element={<ProtectedRoute><Artist /></ProtectedRoute>} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {user && (
        <>
          <PlayerBar />
          <MiniPlayer />
          <MobileNav />
        </>
      )}

      {state.showFullscreen && <FullscreenPlayer />}
      <Toast />
      {state.isPlaying && <div className="playing-ambient" aria-hidden="true" />}
    </div>
  );
}

function MobileNav() {
  const navigate = useNavigate();
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <AppShell />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
