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

  const [lyrics, setLyrics] = useState(null);
  const [lyricsStatus, setLyricsStatus] = useState('idle'); // idle | loading | found | not-found
  const [closing, setClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'lyrics'
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  const isLiked = currentSong ? likedSongs.has(currentSong.id) : false;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Fetch Lyrics ────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSong) return;
    setLyricsStatus('loading');
    setLyrics(null);
    fetchLyrics(currentSong.artist, currentSong.title, currentSong.duration)
      .then(l => { 
        setLyrics(l); 
        setLyricsStatus(l && (l.synced.length > 0 || l.plain) ? 'found' : 'not-found'); 
      })
      .catch(() => setLyricsStatus('not-found'));
  }, [currentSong?.id]); // eslint-disable-line

  // ── Auto-scroll Lyrics ──────────────────────────────────────────
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeEl = activeLyricRef.current;
      const offsetTop = activeEl.offsetTop - container.offsetTop;
      
      container.scrollTo({
        top: offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [state.currentTime]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(actions.toggleFullscreen, 400);
  };

  if (!currentSong) return null;

  return (
    <div className={`fullscreen-player${closing ? ' closing' : ''}`}>
      {/* ── Ambient Backgrounds ── */}
      {currentSong.coverUrl && (
        <div className="fs-bg-media-container">
          <img src={currentSong.coverUrl} alt="Background" className="fs-bg-media" />
        </div>
      )}
      <div className="fs-overlay" />

      {/* ── CSS Particles ── */}
      <div className="fs-particles"></div>

      <div className="fs-content">
        {/* ── Header ── */}
        <div className="fs-header">
          <button className="icon-btn close-btn" onClick={handleClose} aria-label="Close">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <span className="ambient-text fs-now-playing-label">
            NOW PLAYING FROM {currentSong.source.toUpperCase()}
          </span>
          <div style={{ width: 32 }} />
        </div>

        {/* ── Mobile Tabs Switcher ── */}
        <div className="fs-mobile-tabs">
          <button 
            className={`fs-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Song Info
          </button>
          <button 
            className={`fs-tab-btn ${activeTab === 'lyrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('lyrics')}
          >
            Lyrics
          </button>
        </div>

        {/* ── Main (Art + Lyrics) ── */}
        <div className="fs-main">
          {/* Left: Cinematic Art Container */}
          {(!isMobile || activeTab === 'info') && (
            <div className="fs-art-container">
              <div className={`fs-vinyl-record ${isPlaying ? 'spinning' : ''}`}>
                <div className="vinyl-grooves"></div>
                <img 
                  src={currentSong.coverUrl || ''} 
                  alt={currentSong.title} 
                  className="fs-vinyl-label"
                />
              </div>
              {/* Playback Needle */}
              <div className={`fs-vinyl-needle ${isPlaying ? 'playing' : ''}`}>
                 {/* Needle visual made with CSS in FullscreenPlayer.css */}
              </div>
            </div>
          )}

          {/* Right: Karaoke Lyrics */}
          {(!isMobile || activeTab === 'lyrics') && (
            <div className="fs-lyrics-container" ref={lyricsContainerRef}>
            {lyricsStatus === 'loading' && (
              <div className="lyrics-loading">
                <div className="lyrics-skeleton"></div>
                <div className="lyrics-skeleton w-80"></div>
                <div className="lyrics-skeleton w-60"></div>
              </div>
            )}
            {lyricsStatus === 'not-found' && (
              <div className="lyrics-empty">
                <div className="lyrics-empty-icon">🎵</div>
                <p>Instrumental or Lyrics not found</p>
                <span className="lyrics-empty-sub">Enjoy the pure music</span>
              </div>
            )}
            {lyricsStatus === 'found' && lyrics && lyrics.synced.length > 0 ? (
              <div className="lyrics-synced-wrapper">
                {lyrics.synced.map((line, i) => {
                  const isPast = state.currentTime >= line.time;
                  const isCurrent = isPast && (i === lyrics.synced.length - 1 || state.currentTime < lyrics.synced[i+1].time);
                  
                  return (
                    <div 
                      key={i}
                      ref={isCurrent ? activeLyricRef : null}
                      className={`fs-lyric-line ${isCurrent ? 'active' : isPast ? 'past' : ''}`}
                      onClick={() => actions.seek(line.time / state.duration)}
                    >
                      {line.text || "♪"}
                    </div>
                  );
                })}
              </div>
            ) : lyricsStatus === 'found' && lyrics && lyrics.plain ? (
              <div className="lyrics-plain">
                {lyrics.plain}
              </div>
            ) : null}
          </div>
          )}
        </div>

        {/* ── Bottom Controls ── */}
        <div className="fs-bottom">
          <div className="fs-info">
            <div>
              <div className="fs-title" title={currentSong.title}>{currentSong.title}</div>
              <div 
                className="fs-artist" 
                onClick={() => { handleClose(); navigate(`/artist/${encodeURIComponent(currentSong.artist)}`); }}
              >
                {currentSong.artist}
              </div>
            </div>
            <LikeButton liked={isLiked} onClick={() => actions.toggleLike(currentSong.id)} size={32} />
          </div>

          <SeekBar />

          <div className="fs-controls">
            <button className={`icon-btn fs-control-btn ${shuffle ? 'active' : ''}`} onClick={actions.toggleShuffle}>
              <ShuffleIcon />
            </button>
            <button className="icon-btn fs-control-btn" onClick={actions.prevTrack}>
              <PrevIcon />
            </button>
            <button className="fs-btn-play luxury-play" onClick={actions.togglePlay}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button className="icon-btn fs-control-btn" onClick={actions.nextTrack}>
              <NextIcon />
            </button>
            <button className={`icon-btn fs-control-btn ${repeat !== 'none' ? 'active' : ''}`} onClick={actions.cycleRepeat}>
              {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Icons ──
const PlayIcon  = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;

function ShuffleIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>;
}
function RepeatIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>;
}
function RepeatOneIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
    <path d="M11 10h1v4" strokeLinecap="round"/>
  </svg>;
}
