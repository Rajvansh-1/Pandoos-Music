import { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { fetchLyrics } from '../../services/lyrics.js';
import { formatDuration } from '../../services/youtube.js';
import LikeButton from '../UI/LikeButton.jsx';
import SeekBar from './SeekBar.jsx';

export default function FullscreenPlayer() {
  const { state, actions } = usePlayer();
  const { currentSong, isPlaying, shuffle, repeat, likedSongs, volume, isMuted, queue, queueIndex } = state;

  const [tab,          setTab]          = useState('player');
  const [lyrics,       setLyrics]       = useState(null);
  const [lyricsStatus, setLyricsStatus] = useState('idle'); // 'idle'|'loading'|'found'|'not-found'
  const [closing,      setClosing]      = useState(false);

  const isLiked = currentSong ? likedSongs.has(currentSong.id) : false;

  // Fetch lyrics when tab = lyrics
  useEffect(() => {
    if (tab !== 'lyrics' || !currentSong) return;
    setLyricsStatus('loading');
    setLyrics(null);
    fetchLyrics(currentSong.artist, currentSong.title)
      .then(l => { setLyrics(l); setLyricsStatus(l ? 'found' : 'not-found'); })
      .catch(()  => setLyricsStatus('not-found'));
  }, [currentSong?.id, tab]); // eslint-disable-line

  const handleClose = () => {
    setClosing(true);
    setTimeout(actions.toggleFullscreen, 280);
  };

  if (!currentSong) return null;

  return (
    <div
      className={`fullscreen-player${closing ? ' closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Full player"
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="fullscreen-header">
        <button className="topbar-btn" onClick={handleClose} aria-label="Close player">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <span className="fullscreen-label">Now Playing</span>
        <div style={{ width: 32 }} />
      </div>

      {/* ── Tab selector ───────────────────────────────── */}
      <div style={{ display:'flex', gap:4, background:'var(--bg-surface)', borderRadius:'var(--radius-full)', padding:4, width:'100%', maxWidth:400 }}>
        {['player', 'lyrics', 'queue'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex:1, padding:'6px 0', borderRadius:'var(--radius-full)',
              fontSize:'0.8125rem', fontWeight:700,
              background: tab === t ? 'var(--bg-active)' : 'transparent',
              color:      tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'var(--transition-fast)',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ══════════ PLAYER TAB ══════════════════════════ */}
      {tab === 'player' && (
        <>
          {/* Album art disc */}
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {currentSong.coverUrl ? (
              <img
                className="fullscreen-album-art"
                src={currentSong.coverUrl}
                alt={currentSong.title}
                style={{ animation: isPlaying ? 'albumSpin 30s linear infinite' : 'none' }}
              />
            ) : (
              <div
                className="fullscreen-album-art-placeholder"
                style={{ background:'linear-gradient(135deg,#0d2b1e,#1a0d2b)' }}
              >
                🎵
              </div>
            )}
            {isPlaying && (
              <div style={{
                position:'absolute', inset:-20, borderRadius:'var(--radius-xl)',
                border:'2px solid rgba(34,197,94,0.15)',
                animation:'pulse 2.5s ease infinite',
                pointerEvents:'none',
              }} />
            )}
          </div>

          {/* Title + Like */}
          <div className="fullscreen-info" style={{ maxWidth:440, width:'100%' }}>
            <div style={{ minWidth:0 }}>
              <div className="fullscreen-title" style={{ fontSize:'clamp(1.25rem,4vw,1.75rem)' }}>
                {currentSong.title}
              </div>
              <div className="fullscreen-artist">{currentSong.artist}</div>
            </div>
            <LikeButton liked={isLiked} onClick={() => actions.toggleLike(currentSong.id)} size={26} />
          </div>

          {/* Seek bar */}
          <div style={{ width:'100%', maxWidth:440 }}>
            <SeekBar />
          </div>

          {/* Controls */}
          <div className="player-buttons" style={{ gap:'var(--space-5)' }}>
            <button
              className={`ctrl-btn${shuffle ? ' active' : ''}`}
              onClick={actions.toggleShuffle}
              title="Shuffle (S)"
            >
              <ShuffleIcon />
            </button>

            <button className="ctrl-btn" style={{ width:44, height:44 }} onClick={actions.prevTrack}>
              <PrevIcon />
            </button>

            <button
              className="ctrl-btn ctrl-play"
              style={{ width:60, height:60 }}
              onClick={actions.togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
            </button>

            <button className="ctrl-btn" style={{ width:44, height:44 }} onClick={actions.nextTrack}>
              <NextIcon />
            </button>

            <button
              className={`ctrl-btn${repeat !== 'none' ? ' active' : ''}`}
              onClick={actions.cycleRepeat}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
            </button>
          </div>

          {/* Volume */}
          <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', width:'100%', maxWidth:440 }}>
            <button className="ctrl-btn" onClick={actions.toggleMute}>
              {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
            </button>
            <input
              type="range" min={0} max={1} step={0.02}
              value={isMuted ? 0 : volume}
              onChange={e => actions.setVolume(parseFloat(e.target.value))}
              className="volume-slider"
              style={{
                flex:1,
                background: `linear-gradient(to right, var(--brand-green) ${(isMuted ? 0 : volume) * 100}%, var(--bg-active) ${(isMuted ? 0 : volume) * 100}%)`,
              }}
              aria-label="Volume"
            />
          </div>
        </>
      )}

      {/* ══════════ LYRICS TAB ══════════════════════════ */}
      {tab === 'lyrics' && (
        <div style={{ width:'100%', maxWidth:500, flex:1, overflowY:'auto', padding:'0 var(--space-2)' }}>
          {lyricsStatus === 'loading' && (
            <div style={{ textAlign:'center', padding:'var(--space-10)', color:'var(--text-muted)' }}>
              <div style={{ fontSize:'2rem', animation:'pandaBounce 1s ease infinite' }}>🎵</div>
              <div style={{ marginTop:'var(--space-3)', fontWeight:600 }}>Fetching lyrics…</div>
            </div>
          )}
          {lyricsStatus === 'not-found' && (
            <div className="empty-state">
              <div className="empty-icon">🎤</div>
              <div className="empty-title">Lyrics Not Found</div>
              <div className="empty-desc">
                Couldn't find lyrics for "{currentSong.title}". Try a different song!
              </div>
            </div>
          )}
          {lyricsStatus === 'found' && lyrics && (
            <div style={{
              fontFamily:  'var(--font-body)',
              fontSize:    '1rem',
              lineHeight:  2.1,
              color:       'var(--text-secondary)',
              whiteSpace:  'pre-wrap',
              padding:     'var(--space-2) var(--space-4)',
              textAlign:   'center',
            }}>
              {lyrics}
            </div>
          )}
        </div>
      )}

      {/* ══════════ QUEUE TAB ═══════════════════════════ */}
      {tab === 'queue' && (
        <div style={{ width:'100%', maxWidth:500, flex:1, overflowY:'auto' }}>
          {queue.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">Queue is empty</div>
            </div>
          ) : (
            <div className="queue-list" style={{ padding:'var(--space-2)' }}>
              {queue.map((s, i) => (
                <div
                  key={`${s.id}_${i}`}
                  className={`queue-item${i === queueIndex ? ' active' : ''}`}
                  onClick={() => actions.playSong(s, queue, i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && actions.playSong(s, queue, i)}
                >
                  {s.coverUrl ? (
                    <img className="queue-item-art" src={s.coverUrl} alt={s.title} loading="lazy" />
                  ) : (
                    <div className="queue-item-art" style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-surface)', fontSize:'1rem' }}>
                      🎵
                    </div>
                  )}
                  <div className="queue-item-info">
                    <div className="queue-item-title">{s.title}</div>
                    <div className="queue-item-artist">{s.artist}</div>
                  </div>
                  {i === queueIndex && (
                    <span style={{ color:'var(--brand-green)', fontSize:'0.75rem', fontWeight:800, flexShrink:0 }}>▶ Playing</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Icon components ── */
const PlayIcon  = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;

function ShuffleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>;
}
function RepeatIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>;
}
function RepeatOneIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    <path d="M11 10h1v4" strokeLinecap="round"/>
  </svg>;
}
function VolumeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/>
  </svg>;
}
function MuteIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>;
}
