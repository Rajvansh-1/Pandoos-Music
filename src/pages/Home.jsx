import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongCard from '../components/UI/SongCard.jsx';
import SongRow from '../components/UI/SongRow.jsx';
import MoodPicker from '../components/UI/MoodPicker.jsx';
import PandaLogo from '../components/Brand/PandaLogo.jsx';
import { fetchTrendingMusic } from '../services/youtube.js';
import './Home.css';

export default function Home() {
  const { state, actions } = usePlayer();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({ trending: [], playlists: [] });
  
  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

  useEffect(() => {
    if (state.songs.length > 0) {
      setIsLoading(false);
      setData({ trending: state.songs.slice(0, 10), playlists: state.playlists });
    } else {
      fetchTrendingMusic(20).then(res => {
        setData({ trending: res, playlists: [] });
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, [state.songs]); // eslint-disable-line

  // Gamified sections
  const quickPicks = state.recentlyPlayed.slice(0, 6);
  const forYou = data.trending.slice(0, 6);
  const topHits = data.trending.slice(6, 10);

  if (isLoading) {
    return (
      <div className="home-loading">
        <PandaLogo size={80} />
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* ── Cinematic Hero ── */}
      <section className="home-hero luxury-hero">
        <div className="hero-bg-layer"></div>
        <div className="hero-content">
          <div className="hero-header">
            <PandaLogo size={60} className="hero-panda" />
            <div className="hero-greeting-wrapper">
              <div className="hero-subtitle">Your Daily Mix</div>
              <h1 className="home-greeting">{greeting}</h1>
            </div>
          </div>
          
          <div className="hero-description">
            Jump back into your rhythm or discover something entirely new, curated just for your mood today.
          </div>
          
          <div className="hero-actions">
            <button 
              className="btn-primary luxury-btn"
              onClick={() => {
                if (quickPicks.length > 0) actions.playSong(quickPicks[0], quickPicks, 0);
                else if (data.trending.length > 0) actions.playSong(data.trending[0], data.trending, 0);
              }}
            >
              <PlayIcon /> Listen Now
            </button>
            <button
              className="btn-ghost luxury-btn-ghost"
              onClick={() => navigate('/search')}
            >
              Explore Vibes
            </button>
          </div>
        </div>
      </section>

      {/* ── Visual Mood Picker ── */}
      <section className="content-section" style={{ marginTop: -40, position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Vibe Check</h2>
        <MoodPicker />
      </section>

      {/* ── Quick Picks (Spotify style 2x3 grid) ── */}
      {quickPicks.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">Jump Back In</h2>
          <div className="quick-picks-grid">
            {quickPicks.map((song, i) => (
              <div 
                key={song.id}
                className="quick-pick-card"
                onClick={() => actions.playSong(song, quickPicks, i)}
              >
                <img src={song.coverUrl} alt="" className="quick-pick-art" />
                <div className="quick-pick-info">
                  {song.title}
                </div>
                <div className="quick-pick-play">
                  <PlayIconSmall />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Made For You ── */}
      {forYou.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">
            Made For You
            <span className="ai-badge">AI CURATED</span>
          </h2>
          <div className="card-grid">
            {forYou.map((song, i) => (
              <SongCard key={song.id} song={song} queue={forYou} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Top Hits Row ── */}
      {topHits.length > 0 && (
        <section className="content-section pb-32">
          <div className="section-header-row">
            <h2 className="section-title" style={{ margin: 0 }}>Trending Globally</h2>
            <div className="live-updates-badge">
              <span className="live-dot"></span>
              Live Updates
            </div>
          </div>
          <div className="list-container">
            {topHits.map((song, i) => (
              <SongRow key={song.id} song={song} queue={topHits} index={i} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PlayIconSmall = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
