import { NavLink, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';

const NAV = [
  { to: '/',        label: 'Home',    icon: HomeIcon },
  { to: '/search',  label: 'Search',  icon: SearchIcon },
  { to: '/library', label: 'Library', icon: LibraryIcon },
];

export default function Sidebar() {
  const { state, actions } = usePlayer();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">🐼</div>
        <span className="logo-text">Pandoos</span>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="nav-section-label">Menu</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon"><Icon /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Playlists */}
      {state.playlists.length > 0 && (
        <div className="sidebar-playlists">
          <div className="nav-section-label">Playlists</div>
          {state.playlists.map(pl => (
            <div
              key={pl.id}
              className="playlist-nav-item"
              onClick={() => navigate(`/playlist/${pl.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/playlist/${pl.id}`)}
            >
              <span className="pl-emoji">{pl.emoji}</span>
              <span>{pl.name}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}
