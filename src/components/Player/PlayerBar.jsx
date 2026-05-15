import { usePlayer } from '../../context/PlayerContext.jsx';
import SeekBar from './SeekBar.jsx';
import LikeButton from '../UI/LikeButton.jsx';
import PandaCompanion from '../../features/panda/PandaCompanion';
import './PlayerBar.css';

export default function PlayerBar() {
  const { state, actions } = usePlayer();
  const { currentSong, isPlaying, volume, isMuted, shuffle, repeat, likedSongs } = state;

  const isLiked = currentSong ? likedSongs.has(currentSong.id) : false;

  return (
    <footer className={`player-bar luxury-player-bar${isPlaying ? ' is-playing' : ''}`}>
      {/* ── Frequency Visualizer (Background Layer) ── */}
      {isPlaying && (
        <div className="pb-visualizer" aria-hidden="true">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="pb-vis-bar" />
          ))}
        </div>
      )}

      {/* ── Left: Now Playing ── */}
      <div className="pb-info" style={{ zIndex: 10 }} onClick={actions.toggleFullscreen}>
        {currentSong ? (
          <>
            {currentSong.coverUrl ? (
              <img
                className="pb-art luxury-art"
                src={currentSong.coverUrl}
                alt={currentSong.title}
              />
            ) : (
              <div
                className="pb-art luxury-art"
                style={{ background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}
              >
                🎵
              </div>
            )}
            <div style={{ minWidth: 0, paddingRight: 16 }}>
              <div className="card-title pb-title" title={currentSong.title}>{currentSong.title}</div>
              <div className="card-subtitle pb-subtitle" title={currentSong.artist}>{currentSong.artist}</div>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <LikeButton liked={isLiked} onClick={() => actions.toggleLike(currentSong.id)} size={28} />
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            <span className="ambient-text">Select a track to start listening</span>
          </div>
        )}
      </div>

      {/* ── Centre: Controls + Seek ── */}
      <div className="pb-controls" style={{ zIndex: 10 }}>
        <div className="pb-buttons">
          <button className={`icon-btn${shuffle ? ' active' : ''}`} onClick={actions.toggleShuffle}>
            <ShuffleIcon />
          </button>
          <button className="icon-btn" onClick={actions.prevTrack}>
            <PrevIcon />
          </button>
          <button className="pb-btn-play luxury-play-sm" onClick={actions.togglePlay} disabled={!currentSong}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="icon-btn" onClick={actions.nextTrack}>
            <NextIcon />
          </button>
          <button className={`icon-btn${repeat !== 'none' ? ' active' : ''}`} onClick={actions.cycleRepeat}>
            {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
          </button>
        </div>
        
        <SeekBar />
      </div>

      {/* ── Right: Volume + extras ── */}
      <div className="player-extras" style={{ zIndex: 10, position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 'calc(100% + 20px)', right: 0 }}>
          <PandaCompanion variant="corner" size={72} showMessage={true} />
        </div>
        <button className={`icon-btn${state.showQueue ? ' active' : ''}`} onClick={actions.toggleQueue}>
          <QueueIcon />
        </button>
        <button className="icon-btn" onClick={actions.toggleFullscreen} disabled={!currentSong}>
          <ExpandIcon />
        </button>
        
        <div className="volume-bar">
          <button className="icon-btn" onClick={actions.toggleMute}>
            {isMuted || volume === 0 ? <MuteIcon /> : volume < 0.5 ? <VolumeLowIcon /> : <VolumeIcon />}
          </button>
          <input
            type="range"
            min={0} max={1} step={0.02}
            value={isMuted ? 0 : volume}
            onChange={e => actions.setVolume(parseFloat(e.target.value))}
            className="volume-slider"
            style={{
              background: `linear-gradient(to right, var(--ambient-primary, #4ade80) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.12) ${(isMuted ? 0 : volume) * 100}%)`
            }}
          />
        </div>
      </div>
    </footer>
  );
}

/* ── Icons ── */
function PlayIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>; }
function PauseIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>; }
function PrevIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>; }
function NextIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>; }
function ShuffleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>; }
function RepeatIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>; }
function RepeatOneIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /><path d="M11 10h1v4" strokeLinecap="round" /></svg>; }
function VolumeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 010 14.14" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>; }
function VolumeLowIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>; }
function MuteIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>; }
function QueueIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>; }
function ExpandIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>; }
