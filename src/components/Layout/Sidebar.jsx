import { NavLink } from 'react-router-dom';
import PandaLogo from '../Brand/PandaLogo.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';

export default function Sidebar() {
  const { state } = usePlayer();
  const streak = state.currentStreak || 0;

  return (
    <aside className="sidebar">
      {/* ── Luxury Logo ── */}
      <div className="sidebar-logo">
        <PandaLogo size={48} />
        <span className="logo-text">Pandoos</span>
      </div>
      
      {/* ── Bamboo Streaks ── */}
      <div className="streak-badge" title={`${streak} Day Streak!`}>
        <span className="streak-icon">🎋</span>
        <span className="streak-count">{streak}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '16px' }}>
        {/* ── Main Nav ── */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Discover</div>
          <NavItem to="/" icon={<HomeIcon />} label="Home" />
          <NavItem to="/search" icon={<SearchIcon />} label="Explore" />
        </nav>

        {/* ── Library Nav ── */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Your Space</div>
          <NavItem to="/library" icon={<LibraryIcon />} label="Library" />
          <NavItem to="/playlist/liked" icon={<HeartIcon />} label="Liked Songs" />
        </nav>

        {/* ── Gamification Nav (New) ── */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Activity</div>
          <NavItem to="/stats" icon={<FlameIcon />} label="Your Stats" />
        </nav>
      </div>

      {/* ── Footer / Premium Badge ── */}
      <div style={{ padding: '24px 0', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ 
          background: 'var(--ambient-gradient-subtle)', 
          padding: '16px', 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--ambient-glow-subtle)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            <span className="ambient-text">Premium Active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            High-Fidelity Audio + Sync
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

/* ── Icons ── */
function HomeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function SearchIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function LibraryIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>; }
function HeartIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function FlameIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>; }
