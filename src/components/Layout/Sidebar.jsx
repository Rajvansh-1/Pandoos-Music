import { NavLink } from 'react-router-dom';
import PandaLogo from '../Brand/PandaLogo.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Home, Search, Library, Heart, Download, Settings, Music2, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_TOP = [
  { to: '/',        label: 'Home',      Icon: Home },
  { to: '/search',  label: 'Search',    Icon: Search },
  { to: '/library', label: 'Library',   Icon: Library },
];
const NAV_BOTTOM = [
  { to: '/favorites', label: 'Favorites', Icon: Heart },
  { to: '/downloads', label: 'Downloads', Icon: Download },
  { to: '/settings',  label: 'Settings',  Icon: Settings },
];

export default function Sidebar() {
  const { state } = usePlayer();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-mark">🐼</div>
        <div className="logo-text-block">
          <span className="logo-pandoos">Pandoos</span>
          <span className="logo-music">Music</span>
        </div>
      </div>
      
      {/* ── Gamification XP ── */}
      <div style={{ padding: '0 16px' }}>
        <XPProgress compact />
      </div>

      {/* Top Nav */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="nav-section-label">Discover</div>
        {NAV_TOP.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <span className="nav-icon-wrap">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="nav-label">{label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="nav-active-dot"
                  />
                )}
              </>
            )}
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
              <span className="pl-name">{pl.name}</span>
              <ChevronRight size={14} className="pl-arrow" />
            </div>
          ))}
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="sidebar-nav sidebar-nav-bottom" aria-label="Secondary navigation">
        <div className="nav-section-label">Your Space</div>
        {NAV_BOTTOM.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <span className="nav-icon-wrap">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="nav-label">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Panda footer */}
      <div className="sidebar-panda-footer">
        {user ? (
          <div className="sidebar-user">
            <span className="sidebar-user-avatar">{user.avatar || '🐼'}</span>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-footer-text">munching bamboo & beats</span>
            </div>
          </div>
        ) : (
          <>
            <span className="sidebar-footer-panda">🐼</span>
            <span className="sidebar-footer-text">munching bamboo & beats</span>
          </>
        )}
      </div>
    </aside>
  );
}
