import { usePlayer } from '../../context/PlayerContext.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SongRow({ song, queue, index }) {
  const { state, actions } = usePlayer();
  const navigate = useNavigate();
  const isPlaying = state.currentSong?.id === song.id;
  const isLiked = state.likedSongs.has(song.id);
  const [hover, setHover] = useState(false);

  const formatDur = (sec) => {
    if (!sec) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div 
      className={`song-row${isPlaying ? ' is-playing' : ''}`}
      onClick={() => actions.playSong(song, queue, index)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <img src={song.coverUrl} alt={song.title} className="song-row-art" loading="lazy" />
        {(hover || isPlaying) && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            {isPlaying && state.isPlaying ? (
              // Mini Waveform
              <div style={{ display: 'flex', gap: 2, height: 16, alignItems: 'center' }}>
                <div style={{ width: 3, height: '100%', background: 'var(--ambient-primary)', animation: 'pulseBeat 0.5s infinite alternate' }} />
                <div style={{ width: 3, height: '60%', background: 'var(--ambient-primary)', animation: 'pulseBeat 0.7s infinite alternate-reverse' }} />
                <div style={{ width: 3, height: '80%', background: 'var(--ambient-primary)', animation: 'pulseBeat 0.6s infinite alternate' }} />
              </div>
            ) : (
              <PlayIcon />
            )}
          </div>
        )}
      </div>

      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="song-row-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.title}
        </div>
        <div
          className="song-row-artist"
          style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); if (song.artist && song.artist !== 'Unknown') navigate(`/artist/${encodeURIComponent(song.artist)}`); }}
          title={`Go to ${song.artist}`}
        >
          {song.artist}
        </div>
      </div>

      <div style={{ opacity: hover || isLiked ? 1 : 0, transition: 'var(--transition-fast)' }}>
        <button 
          className="icon-btn" 
          onClick={(e) => { e.stopPropagation(); actions.toggleLike(song.id); }}
          style={{ color: isLiked ? 'var(--brand-green)' : 'var(--text-muted)' }}
        >
          {isLiked ? <HeartFilledIcon /> : <HeartIcon />}
        </button>
      </div>

      <div className="song-row-duration" style={{ width: 40, textAlign: 'right' }}>
        {formatDur(song.duration)}
      </div>
    </div>
  );
}

const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const HeartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const HeartFilledIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
