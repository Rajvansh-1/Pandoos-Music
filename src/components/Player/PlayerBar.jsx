import { useRef, useCallback } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { formatDuration } from '../../services/youtube.js';
import SeekBar from './SeekBar.jsx';
import LikeButton from '../UI/LikeButton.jsx';

export default function PlayerBar() {
  const { state, actions } = usePlayer();
  const { currentSong, isPlaying, volume, isMuted, shuffle, repeat, currentTime, duration, likedSongs } = state;

  const isLiked = currentSong ? likedSongs.has(currentSong.id) : false;

  return (
    <footer className={`player-bar${isPlaying ? ' is-playing' : ''}`} aria-label="Music player">
      {/* ── Left: Now Playing ── */}
      <div className="now-playing-info">
        {currentSong ? (
          <>
            {currentSong.coverUrl ? (
              <img
                className={`now-playing-art${isPlaying ? ' is-playing' : ''}`}
                src={currentSong.coverUrl}
                alt={currentSong.title}
                onClick={actions.toggleFullscreen}
                style={isPlaying ? { animation: 'none' } : {}}
              />
            ) : (
              <div
                className="now-playing-art-placeholder"
                style={{ background: currentSong.gradient }}
                onClick={actions.toggleFullscreen}
              >
                {currentSong.emoji}
              </div>
            )}
            <div className="now-playing-text">
              <div className="now-playing-title" title={currentSong.title}>{currentSong.title}</div>
              <div className="now-playing-artist" title={currentSong.artist}>{currentSong.artist}</div>
            </div>
            <div className="now-playing-like">
              <LikeButton
                liked={isLiked}
                onClick={() => actions.toggleLike(currentSong.id)}
              />
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            🐼 Nothing playing yet
          </div>
        )}
      </div>

      {/* ── Centre: Controls + Seek ── */}
      <div className="player-controls">
        <div className="player-buttons">
          {/* Shuffle */}
          <button
            className={`ctrl-btn${shuffle ? ' active' : ''}`}
            onClick={actions.toggleShuffle}
            title="Shuffle"
            aria-label="Shuffle"
          >
            <ShuffleIcon />
          </button>

          {/* Prev */}
          <button className="ctrl-btn" onClick={actions.prevTrack} title="Previous (←)" aria-label="Previous">
            <PrevIcon />
          </button>

          {/* Play / Pause */}
          <button
            className="ctrl-btn ctrl-play"
            onClick={actions.togglePlay}
            title="Play / Pause (Space)"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={!currentSong}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Next */}
          <button className="ctrl-btn" onClick={actions.nextTrack} title="Next (→)" aria-label="Next">
            <NextIcon />
          </button>

          {/* Repeat */}
          <button
            className={`ctrl-btn${repeat !== 'none' ? ' active' : ''}`}
            onClick={actions.cycleRepeat}
            title={`Repeat: ${repeat}`}
            aria-label="Repeat"
          >
            {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
          </button>
        </div>

        {/* Seek bar */}
        <SeekBar />
      </div>

      {/* ── Right: Volume + extras ── */}
      <div className="player-extras">
        {/* Queue toggle */}
        <button
          className={`ctrl-btn${state.showQueue ? ' active' : ''}`}
          onClick={actions.toggleQueue}
          title="Queue"
          aria-label="Queue"
        >
          <QueueIcon />
        </button>

        {/* Fullscreen */}
        <button
          className="ctrl-btn"
          onClick={actions.toggleFullscreen}
          title="Full view"
          aria-label="Open full player"
          disabled={!currentSong}
        >
          <ExpandIcon />
        </button>

        {/* Volume */}
        <div className="volume-bar">
          <button
            className="ctrl-btn"
            onClick={actions.toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title="Mute (M)"
          >
            {isMuted || volume === 0 ? <MuteIcon /> : volume < 0.5 ? <VolumeLowIcon /> : <VolumeIcon />}
          </button>
          <input
            className="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={e => actions.setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            style={{
              background: `linear-gradient(to right, var(--brand-green) ${(isMuted ? 0 : volume) * 100}%, var(--bg-active) ${(isMuted ? 0 : volume) * 100}%)`
            }}
          />
        </div>
      </div>
    </footer>
  );
}

/* ── Icons ── */
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}
function ShuffleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}
function RepeatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}
function RepeatOneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
      <path d="M11 10h1v4" strokeLinecap="round" />
    </svg>
  );
}
function VolumeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  );
}
function VolumeLowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
    </svg>
  );
}
function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
function QueueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function ExpandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}
