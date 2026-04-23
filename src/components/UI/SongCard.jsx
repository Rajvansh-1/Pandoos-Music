import { usePlayer } from '../../context/PlayerContext.jsx';
import { extractColors } from '../../services/colorExtractor.js';
import { useState, useRef, useEffect } from 'react';

export default function SongCard({ song, queue, index }) {
  const { state, actions } = usePlayer();
  const isPlaying = state.currentSong?.id === song.id;
  const cardRef = useRef(null);
  
  // Parallax 3D effect on hover
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div 
      ref={cardRef}
      className={`song-card${isPlaying ? ' is-playing' : ''}`}
      onClick={() => actions.playSong(song, queue, index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ position: 'relative' }}>
        {song.coverUrl ? (
          <img src={song.coverUrl} alt={song.title} className="card-art" loading="lazy" />
        ) : (
          <div className="card-art" style={{ background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            🎵
          </div>
        )}
        <button 
          className="card-play-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (isPlaying) actions.togglePlay();
            else actions.playSong(song, queue, index);
          }}
        >
          {isPlaying && state.isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <div className="card-title" title={song.title}>{song.title}</div>
      <div className="card-subtitle" title={song.artist}>{song.artist}</div>
    </div>
  );
}

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
