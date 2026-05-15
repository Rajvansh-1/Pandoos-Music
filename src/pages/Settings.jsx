import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';

const AUDIO_QUALITIES = ['Low (64kbps)', 'Medium (128kbps)', 'High (320kbps)'];
const EQ_BANDS = ['60Hz', '170Hz', '310Hz', '600Hz', '1kHz', '3kHz', '6kHz', '12kHz', '14kHz', '16kHz'];
const EQ_PRESETS = {
  Flat:        [0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
  'Bass Boost':[7,  6,  4,  2,  0,  0,  0,  0,  0,  0],
  Treble:      [0,  0,  0,  0,  2,  4,  5,  6,  6,  5],
  Vocal:       [-2,-1,  1,  3,  4,  3,  2,  1,  0, -1],
  Pop:         [2,  1,  0,  1,  3,  3,  2,  1,  0,  0],
};

export default function Settings() {
  const { user, logout } = useAuth();
  const { state, actions } = usePlayer();
  const [quality, setQuality] = useState(
    localStorage.getItem('pandoos_quality') || 'High (320kbps)'
  );
  const [crossfade, setCrossfade] = useState(
    localStorage.getItem('pandoos_crossfade') === 'true'
  );
  const [eqValues, setEqValues] = useState(
    JSON.parse(localStorage.getItem('pandoos_eq') || 'null') || EQ_PRESETS['Flat']
  );
  const [activePreset, setActivePreset] = useState('Flat');
  const [sleepMinutes, setSleepMinutes] = useState('');

  const handleQuality = (q) => {
    setQuality(q);
    localStorage.setItem('pandoos_quality', q);
  };

  const handleCrossfade = () => {
    const v = !crossfade;
    setCrossfade(v);
    localStorage.setItem('pandoos_crossfade', String(v));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const vals = EQ_PRESETS[preset];
    setEqValues(vals);
    localStorage.setItem('pandoos_eq', JSON.stringify(vals));
  };

  const handleEqBand = (i, val) => {
    const next = [...eqValues];
    next[i] = Number(val);
    setEqValues(next);
    setActivePreset('Custom');
    localStorage.setItem('pandoos_eq', JSON.stringify(next));
  };

  const handleSleep = () => {
    const mins = parseInt(sleepMinutes);
    if (!mins || mins < 1) return;
    actions.setSleepTimer(mins);
    setSleepMinutes('');
  };

  const SHORTCUTS = [
    { key: 'Space', action: 'Play / Pause' },
    { key: '→', action: 'Next Track' },
    { key: '←', action: 'Previous Track' },
    { key: 'M', action: 'Mute / Unmute' },
    { key: 'S', action: 'Toggle Shuffle' },
    { key: 'L', action: 'Like Current Song' },
    { key: 'F', action: 'Fullscreen Player' },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">⚙️ Settings</h1>
        <p className="settings-subtitle">Customize your Pandoos experience</p>
      </div>

      <div className="settings-grid">

        {/* Profile */}
        <motion.section className="settings-card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
          <h2 className="settings-card-title">🐼 Profile</h2>
          {user ? (
            <div className="settings-profile">
              <div className="settings-avatar">{user.avatar || '🐼'}</div>
              <div>
                <div className="settings-profile-name">{user.name}</div>
                <div className="settings-profile-email">{user.email}</div>
              </div>
              <button className="settings-logout-btn" onClick={logout}>Sign Out</button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Not signed in</p>
          )}
        </motion.section>

        {/* Audio Quality */}
        <motion.section className="settings-card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <h2 className="settings-card-title">🎵 Audio Quality</h2>
          <div className="settings-options">
            {AUDIO_QUALITIES.map(q => (
              <button
                key={q}
                className={`settings-option-btn${quality === q ? ' active' : ''}`}
                onClick={() => handleQuality(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Playback */}
        <motion.section className="settings-card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>
          <h2 className="settings-card-title">▶️ Playback</h2>
          <div className="settings-toggle-row">
            <div>
              <div className="settings-toggle-label">Crossfade</div>
              <div className="settings-toggle-desc">Smooth transitions between songs</div>
            </div>
            <button
              className={`settings-toggle${crossfade ? ' on' : ''}`}
              onClick={handleCrossfade}
              aria-label="Toggle crossfade"
            >
              <span className="settings-toggle-thumb" />
            </button>
          </div>
        </motion.section>

        {/* Sleep Timer */}
        <motion.section className="settings-card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <h2 className="settings-card-title">😴 Sleep Timer</h2>
          {state.sleepTimer ? (
            <div className="settings-sleep-active">
              <span>⏰ Stops in {Math.max(0, Math.round((state.sleepTimer.endsAt - Date.now()) / 60000))} min</span>
              <button className="settings-option-btn" onClick={() => actions.setSleepTimer(null)}>Cancel</button>
            </div>
          ) : (
            <div className="settings-sleep-row">
              <div className="settings-sleep-presets">
                {[15, 30, 45, 60].map(m => (
                  <button key={m} className="settings-option-btn" onClick={() => actions.setSleepTimer(m)}>{m}m</button>
                ))}
              </div>
              <div className="settings-sleep-custom">
                <input
                  className="auth-input"
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Custom mins"
                  value={sleepMinutes}
                  onChange={e => setSleepMinutes(e.target.value)}
                  style={{ width: 120 }}
                />
                <button className="settings-option-btn active" onClick={handleSleep}>Set</button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Equalizer */}
        <motion.section className="settings-card settings-card-wide" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <h2 className="settings-card-title">🎚️ Equalizer</h2>
          <div className="eq-presets">
            {Object.keys(EQ_PRESETS).map(p => (
              <button key={p} className={`settings-option-btn${activePreset === p ? ' active' : ''}`} onClick={() => applyPreset(p)}>{p}</button>
            ))}
          </div>
          <div className="eq-bands">
            {EQ_BANDS.map((band, i) => (
              <div key={band} className="eq-band">
                <div className="eq-band-value">{eqValues[i] > 0 ? '+' : ''}{eqValues[i]}</div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="1"
                  value={eqValues[i]}
                  onChange={e => handleEqBand(i, e.target.value)}
                  className="eq-slider"
                  orient="vertical"
                  aria-label={band}
                />
                <div className="eq-band-label">{band}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Keyboard Shortcuts */}
        <motion.section className="settings-card" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <h2 className="settings-card-title">⌨️ Keyboard Shortcuts</h2>
          <div className="shortcuts-list">
            {SHORTCUTS.map(s => (
              <div key={s.key} className="shortcut-row">
                <kbd className="shortcut-key">{s.key}</kbd>
                <span className="shortcut-action">{s.action}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
