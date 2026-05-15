import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { fetchLyrics } from '../../services/lyrics.js';
import LikeButton from '../UI/LikeButton.jsx';
import SeekBar from './SeekBar.jsx';
import './FullscreenPlayer.css';

export default function FullscreenPlayer() {
  const navigate = useNavigate();
  const { state, actions } = usePlayer();
  const { currentSong, isPlaying, shuffle, repeat, likedSongs } = state;

  const [tab,          setTab]          = useState('player');
  const [lyrics,       setLyrics]       = useState(null);
  const [lyricsStatus, setLyricsStatus] = useState('idle');
  const [closing,      setClosing]      = useState(false);
  const [mounted,      setMounted]      = useState(false);

  const isLiked = currentSong ? likedSongs.has(currentSong.id) : false;

  // Trigger entrance animation
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Fetch Lyrics ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentSong) return;
    setLyricsStatus('loading');
    setLyrics(null);
    fetchLyrics(currentSong.artist, currentSong.title)
      .then(l => { setLyrics(l); setLyricsStatus(l ? 'found' : 'not-found'); })
      .catch(() => setLyricsStatus('not-found'));
  }, [currentSong?.id, tab]); // eslint-disable-line

  const handleClose = () => {
    setClosing(true);
    setMounted(false);
    setTimeout(actions.toggleFullscreen, 400);
  };

  if (!currentSong) return null;

  const bgArt = currentSong.coverUrl;

  return (
    <div
      className={`fs-overlay${mounted && !closing ? ' fs-visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Full player"
    >
      {/* ── Blurred art background ── */}
      <div className="fs-bg">
        {bgArt && (
          <img src={bgArt} className="fs-bg-img" alt="" aria-hidden="true" />
        )}
        <div className="fs-bg-tint" />
      </div>

      {/* ── Floating panda leaf decoration ── */}
      <div className="fs-panda-deco" aria-hidden="true">🎋</div>

      {/* ── Glass panel ── */}
      <div className="fs-glass-panel">

        {/* Header */}
        <div className="fs-header">
          <button className="fs-close-btn" onClick={handleClose} aria-label="Close player">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="fs-header-label">Now Playing</span>
          <div style={{ width: 36 }} />
        </div>

        {/* Tab selector */}
        <div className="fs-tabs">
          {['player', 'lyrics', 'queue'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`fs-tab-btn${tab === t ? ' active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ══ PLAYER TAB ══ */}
        {tab === 'player' && (
          <div className="fs-player-content">
            {/* Album art */}
            <div className="fs-art-wrapper">
              {bgArt ? (
                <img
                  className={`fs-art${isPlaying ? ' spinning' : ''}`}
                  src={bgArt}
                  alt={currentSong.title}
                />
              ) : (
                <div className="fs-art-placeholder">🎋</div>
              )}
              {isPlaying && <div className="fs-art-ring" />}
              {isPlaying && <div className="fs-art-ring fs-art-ring-2" />}
            </div>

            {/* Title + like */}
            <div className="fs-track-info">
              <div className="fs-track-text">
                <div className="fs-track-title">{currentSong.title}</div>
                <div
                  className="fs-track-artist"
                  onClick={() => {
                    actions.toggleFullscreen();
                    navigate(`/artist/${encodeURIComponent(currentSong.artist)}`);
                  }}
                >
                  {currentSong.artist}
                </div>
              </div>
              <LikeButton liked={isLiked} onClick={() => actions.toggleLike(currentSong.id)} size={26} />
            </div>

            {/* Seek bar */}
            <div className="fs-seekbar-wrap">
              <SeekBar />
            </div>

            {/* Controls */}
            <div className="fs-controls">
              <button
                className={`ctrl-btn${shuffle ? ' active' : ''}`}
                onClick={actions.toggleShuffle}
                title="Shuffle"
              >
                <ShuffleIcon />
              </button>

              <button className="ctrl-btn" style={{ width:44, height:44 }} onClick={actions.prevTrack}>
                <PrevIcon />
              </button>

              <button
                className="ctrl-btn ctrl-play fs-play-btn"
                onClick={actions.togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon size={26} /> : <PlayIcon size={26} />}
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
            <div className="fs-volume">
              <button className="ctrl-btn" onClick={actions.toggleMute}>
                {isMuted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </button>
              <input
                type="range" min={0} max={1} step={0.02}
                value={isMuted ? 0 : volume}
                onChange={e => actions.setVolume(parseFloat(e.target.value))}
                className="volume-slider"
                style={{
                  flex: 1,
                  background: `linear-gradient(to right, var(--brand-green) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) ${(isMuted ? 0 : volume) * 100}%)`,
                }}
                aria-label="Volume"
              />
            </div>
          </div>
        )}

        {/* ══ LYRICS TAB ══ */}
        {tab === 'lyrics' && (
          <div className="fs-scroll-content">
            {lyricsStatus === 'loading' && (
              <div style={{ textAlign:'center', padding:'var(--space-10)', color:'var(--text-muted)' }}>
                <div style={{ fontSize:'2.5rem', animation:'pandaBounce 1s ease infinite' }}>🎋</div>
                <div style={{ marginTop:'var(--space-3)', fontWeight:700, letterSpacing:'0.05em' }}>Fetching lyrics…</div>
              </div>
            )}
            {lyricsStatus === 'not-found' && (
              <div className="empty-state">
                <div className="empty-icon">🎤</div>
                <div className="empty-title">Lyrics Not Found</div>
                <div className="empty-desc">Couldn't find lyrics for "{currentSong.title}"</div>
              </div>
            )}
            {lyricsStatus === 'found' && lyrics && (
              <div className="lyrics-container" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)', padding:'var(--space-4) 0', textAlign:'center' }}>
                {lyrics.synced && lyrics.synced.length > 0 ? (
                  lyrics.synced.map((line, i) => {
                    const isPast    = state.currentTime >= line.time;
                    const isCurrent = isPast && (i === lyrics.synced.length - 1 || state.currentTime < lyrics.synced[i+1].time);
                    return (
                      <div
                        key={i}
                        className={`lyric-line${isCurrent ? ' active' : ''}`}
                        style={{
                          fontSize:   isCurrent ? 'clamp(1.5rem,4vw,2rem)' : 'clamp(1rem,3vw,1.25rem)',
                          fontWeight: isCurrent ? 800 : 600,
                          color:      isCurrent ? 'var(--brand-green)' : (isPast ? 'var(--text-primary)' : 'var(--text-muted)'),
                          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                          transform:  isCurrent ? 'scale(1.05)' : 'scale(1)',
                          filter:     isCurrent ? 'none' : 'blur(0.5px)',
                          opacity:    isCurrent ? 1 : 0.55,
                          lineHeight: 1.4,
                        }}
                        ref={isCurrent ? el => { if (el) el.scrollIntoView({ behavior:'smooth', block:'center' }); } : null}
                      >
                        {line.text}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize:'1rem', lineHeight:2.1, color:'var(--text-secondary)', whiteSpace:'pre-wrap' }}>
                    {lyrics.plain}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ QUEUE TAB ══ */}
        {tab === 'queue' && (
          <div className="fs-scroll-content">
            {queue.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🐼</div>
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
                      <div className="queue-item-art" style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.08)', fontSize:'1rem' }}>🎋</div>
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
    </div>
  );
}

/* ── Icon components ── */
const PlayIcon  = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;
function ShuffleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>;
}
function RepeatIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>;
}
function RepeatOneIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    <path d="M11 10h1v4" strokeLinecap="round"/>
  </svg>;
}
