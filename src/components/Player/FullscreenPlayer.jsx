import { useState, useEffect, useRef, useCallback } from 'react';
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

  const [lyrics, setLyrics] = useState(null);
  const [lyricsStatus, setLyricsStatus] = useState('idle');
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const lyricsContainerRef = useRef(null);
  const lastActiveLineRef = useRef(-1);
  const vinylRef = useRef(null);
  const rotationRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const isLiked = currentSong ? likedSongs.has(currentSong.id) : false;

  // ── Resize handler ──────────────────────────────────────────
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
    lastActiveLineRef.current = -1;
    fetchLyrics(currentSong.artist, currentSong.title, currentSong.duration)
      .then(l => {
        setLyrics(l);
        setLyricsStatus(l && (l.synced.length > 0 || l.plain) ? 'found' : 'not-found');
      })
      .catch(() => setLyricsStatus('not-found'));
  }, [currentSong?.id]); // eslint-disable-line

  // ── Smooth Vinyl Rotation via requestAnimationFrame ──────────
  const spinVinyl = useCallback((timestamp) => {
    if (!vinylRef.current) return;
    if (lastTimeRef.current !== null) {
      const delta = timestamp - lastTimeRef.current;
      // 33 RPM = 0.55 rotations/sec = 198 deg/sec
      rotationRef.current = (rotationRef.current + (delta * 0.198)) % 360;
      vinylRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
    lastTimeRef.current = timestamp;
    rafRef.current = requestAnimationFrame(spinVinyl);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(spinVinyl);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, spinVinyl]);

  // ── Auto-scroll Lyrics (fixed) ──────────────────────────────
  useEffect(() => {
    if (!lyrics?.synced?.length || lyricsStatus !== 'found') return;
    const currentTime = state.currentTime;

    let activeIdx = -1;
    for (let i = lyrics.synced.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics.synced[i].time) {
        activeIdx = i;
        break;
      }
    }

    if (activeIdx === lastActiveLineRef.current) return;
    lastActiveLineRef.current = activeIdx;

    if (activeIdx >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const lines = container.querySelectorAll('.fs-lyric-line');
      if (lines[activeIdx]) {
        lines[activeIdx].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [state.currentTime, lyrics, lyricsStatus]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(actions.toggleFullscreen, 400);
  };

  if (!currentSong) return null;

  // Find current active lyric index
  let activeIdx = -1;
  if (lyrics?.synced?.length) {
    for (let i = lyrics.synced.length - 1; i >= 0; i--) {
      if (state.currentTime >= lyrics.synced[i].time) {
        activeIdx = i;
        break;
      }
    }
  }

  return (
    <div className={`fullscreen-player${closing ? ' closing' : ''}`}>
      {/* ── Ambient Backgrounds ── */}
      {currentSong.coverUrl && (
        <div className="fs-bg-media-container">
          <img src={currentSong.coverUrl} alt="" className="fs-bg-media" aria-hidden="true" />
        </div>
      )}
      <div className="fs-overlay" />
      <div className="fs-particles" aria-hidden="true" />

      <div className="fs-content">
        {/* ── Header ── */}
        <div className="fs-header">
          <button className="icon-btn fs-close-btn" onClick={handleClose} aria-label="Close fullscreen">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="ambient-text fs-now-playing-label">
            NOW PLAYING FROM {currentSong.source?.toUpperCase()}
          </span>
          <div style={{ width: 40 }} />
        </div>

        {/* ── Mobile Tabs ── */}
        <div className="fs-mobile-tabs" role="tablist">
          <button
            className={`fs-tab-btn${activeTab === 'info' ? ' active' : ''}`}
            onClick={() => setActiveTab('info')}
            role="tab"
            aria-selected={activeTab === 'info'}
          >
            Song Info
          </button>
          <button
            className={`fs-tab-btn${activeTab === 'lyrics' ? ' active' : ''}`}
            onClick={() => setActiveTab('lyrics')}
            role="tab"
            aria-selected={activeTab === 'lyrics'}
          >
            Lyrics
          </button>
        </div>

        {/* ── Main (Art + Lyrics) ── */}
        <div className="fs-main">
          {/* Left: Vinyl */}
          {(!isMobile || activeTab === 'info') && (
            <div className="fs-art-container">
              {/* Vinyl Record */}
              <div className="fs-vinyl-wrapper">
                {/* The record disc */}
                <div
                  className="fs-vinyl-record"
                  ref={vinylRef}
                  style={{ willChange: 'transform', transform: 'rotate(0deg)' }}
                >
                  {/* Outer groove rings */}
                  <div className="vinyl-grooves" aria-hidden="true" />
                  {/* Shimmer overlay */}
                  <div className="vinyl-shimmer" aria-hidden="true" />
                  {/* Center label with album art */}
                  <div className="fs-vinyl-label-ring">
                    {currentSong.coverUrl ? (
                      <img
                        src={currentSong.coverUrl}
                        alt={currentSong.title}
                        className="fs-vinyl-label-img"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="fs-vinyl-label-placeholder">🎵</div>
                    )}
                    {/* Center spindle hole */}
                    <div className="vinyl-spindle" aria-hidden="true" />
                  </div>
                </div>

                {/* Stylus arm — positioned outside and above the record */}
                <div
                  className={`fs-vinyl-needle${isPlaying ? ' playing' : ''}`}
                  aria-hidden="true"
                >
                  {/* Arm body */}
                  <div className="needle-arm" />
                  {/* Needle head / cartridge */}
                  <div className="needle-head" />
                  {/* Needle tip */}
                  <div className="needle-tip" />
                </div>
              </div>

              {/* Ambient vinyl glow ring */}
              <div className={`vinyl-ambient-ring${isPlaying ? ' active' : ''}`} aria-hidden="true" />
            </div>
          )}

          {/* Right: Lyrics */}
          {(!isMobile || activeTab === 'lyrics') && (
            <div className="fs-lyrics-container" ref={lyricsContainerRef} role="region" aria-label="Song lyrics">
              {lyricsStatus === 'loading' && (
                <div className="lyrics-loading" aria-label="Loading lyrics">
                  <div className="lyrics-skeleton" />
                  <div className="lyrics-skeleton w-80" />
                  <div className="lyrics-skeleton w-60" />
                  <div className="lyrics-skeleton w-75" />
                  <div className="lyrics-skeleton w-50" />
                </div>
              )}

              {lyricsStatus === 'not-found' && (
                <div className="lyrics-empty">
                  <div className="lyrics-empty-icon" aria-hidden="true">🎵</div>
                  <p>Instrumental or Lyrics not found</p>
                  <span className="lyrics-empty-sub">Enjoy the pure music</span>
                </div>
              )}

              {lyricsStatus === 'found' && lyrics && lyrics.synced.length > 0 && (
                <div className="lyrics-synced-wrapper">
                  {lyrics.synced.map((line, i) => {
                    const isPast = i < activeIdx;
                    const isCurrent = i === activeIdx;
                    return (
                      <div
                        key={i}
                        className={`fs-lyric-line${isCurrent ? ' active' : isPast ? ' past' : ''}`}
                        onClick={() => actions.seek(line.time / (state.duration || 1))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && actions.seek(line.time / (state.duration || 1))}
                        aria-label={`Seek to: ${line.text}`}
                      >
                        {line.text || '♪'}
                      </div>
                    );
                  })}
                </div>
              )}

              {lyricsStatus === 'found' && lyrics && lyrics.synced.length === 0 && lyrics.plain && (
                <div className="lyrics-plain">
                  {lyrics.plain.split(/\n\n+/).map((verse, i) => (
                    <div key={i} className="lyrics-verse">
                      {verse}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom Controls — Flex Column Layout ── */}
        <div className="fs-bottom">
          {/* Row 1: Song Info + Like */}
          <div className="fs-info-row">
            <div className="fs-info-text">
              <div className="fs-title" title={currentSong.title}>{currentSong.title}</div>
              <div
                className="fs-artist"
                onClick={() => { handleClose(); navigate(`/artist/${encodeURIComponent(currentSong.artist)}`); }}
                role="link"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleClose()}
              >
                {currentSong.artist}
              </div>
            </div>
            <LikeButton liked={isLiked} onClick={() => actions.toggleLike(currentSong.id)} size={28} />
          </div>

          {/* Row 2: SeekBar — full width */}
          <div className="fs-seekbar-row">
            <SeekBar />
          </div>

          {/* Row 3: Playback Controls */}
          <div className="fs-controls-row">
            <button
              className={`icon-btn fs-ctrl-btn${shuffle ? ' active' : ''}`}
              onClick={actions.toggleShuffle}
              aria-label="Shuffle"
              title="Shuffle"
            >
              <ShuffleIcon />
            </button>
            <button className="icon-btn fs-ctrl-btn" onClick={actions.prevTrack} aria-label="Previous track">
              <PrevIcon />
            </button>
            <button
              className="fs-btn-play luxury-play"
              onClick={actions.togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button className="icon-btn fs-ctrl-btn" onClick={actions.nextTrack} aria-label="Next track">
              <NextIcon />
            </button>
            <button
              className={`icon-btn fs-ctrl-btn${repeat !== 'none' ? ' active' : ''}`}
              onClick={actions.cycleRepeat}
              aria-label="Repeat"
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────
const PlayIcon  = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;

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
