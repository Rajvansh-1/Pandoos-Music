import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import { searchYouTube } from '../services/youtube.js';
import SongRow from '../components/UI/SongRow.jsx';
import Skeleton from '../components/UI/Skeleton.jsx';
import { APP_CONFIG } from '../config.js';

export default function Artist() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { actions, state } = usePlayer();
  const decodedName = decodeURIComponent(name || '');

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!decodedName || !APP_CONFIG.hasYouTubeKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);

    // Search for this artist's tracks
    searchYouTube(`${decodedName} songs`, 20)
      .then(res => {
        setSongs(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [decodedName]);

  if (!APP_CONFIG.hasYouTubeKey) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🐼</div>
        <div className="empty-title">API Key Required</div>
        <div className="empty-desc">Artist profiles require an API key to fetch songs.</div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Hero Section */}
      <div style={{
        padding: '60px var(--space-4)',
        background: 'linear-gradient(to bottom, var(--brand-green-muted, rgba(34,197,94,0.15)), transparent)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 'var(--space-6)',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        textAlign:'center'
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', background:'var(--bg-active)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginBottom:'var(--space-4)'
        }}>
          🎤
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'var(--space-2)' }}>{decodedName}</h1>
        <p style={{ color:'var(--brand-green)', fontWeight:700 }}>Artist</p>
        
        {songs.length > 0 && (
          <button 
            className="btn-primary" 
            style={{ marginTop:'var(--space-4)', padding:'12px 32px' }}
            onClick={() => actions.playSong(songs[0], songs, 0)}
          >
            ▶ Play Top Tracks
          </button>
        )}
      </div>

      {/* Popular Tracks */}
      <div className="content-section">
        <h2 className="section-title">Popular Tracks</h2>
        
        {loading ? (
          <div>
            <Skeleton type="list" count={5} />
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-title">Error loading tracks</div>
          </div>
        ) : songs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No tracks found</div>
          </div>
        ) : (
          <div className="song-list">
            {songs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={songs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
