import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import { MOODS } from '../services/moodEngine.js';
import SongRow from '../components/UI/SongRow.jsx';
import SongCard from '../components/UI/SongCard.jsx';
import PandaLogo from '../components/Brand/PandaLogo.jsx';
import MoodWidget from '../components/UI/MoodWidget.jsx';
import PandaCompanion from '../features/panda/PandaCompanion';
import Skeleton from '../components/UI/Skeleton.jsx';
import { fetchTrendingMusic, DEMO_SONGS } from '../services/youtube.js';
import { buildTasteProfile, buildRecommendationSections, fetchMadeForYou } from '../services/recommendations.js';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { state, actions } = usePlayer();
  const { currentMood, currentStreak } = state;

  const [isLoading, setIsLoading] = useState(true);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [madeForYou, setMadeForYou] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [tasteSections, setTasteSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const builtRef = useRef(false);

  const moodInfo = MOODS[currentMood] || MOODS.chill;

  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

  useEffect(() => {
    const src = state.songs.length > 0 ? Promise.resolve(state.songs) : fetchTrendingMusic(20);
    src.then(songs => {
      setTrendingSongs(songs);
      setIsLoading(false);
    }).catch((err) => {
      console.warn("YouTube API failed, falling back to DEMO_SONGS", err);
      setTrendingSongs(DEMO_SONGS);
      setIsLoading(false);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (isLoading || builtRef.current) return;

    const profile = buildTasteProfile(
      state.recentlyPlayed,
      state.likedSongs,
      state.playStats,
      state.songs.length > 0 ? state.songs : trendingSongs
    );

    setTasteProfile(profile);

    if (profile.hasTasteData) {
      setIsPersonalized(true);
      builtRef.current = true;
      setSectionsLoading(true);

      fetchMadeForYou(profile.topArtists, trendingSongs).then(songs => {
        setMadeForYou(songs);
      });

      const seenIds = new Set(state.recentlyPlayed.map(s => s.id));
      buildRecommendationSections(profile, seenIds).then(sections => {
        setTasteSections(sections);
        setSectionsLoading(false);
      });
    } else {
      setMadeForYou(trendingSongs.slice(0, 6));
      setSectionsLoading(false);
    }
  }, [isLoading]); // eslint-disable-line

  const quickPicks = state.recentlyPlayed.slice(0, 6);
  const topHits = trendingSongs.slice(isPersonalized ? 0 : 6, isPersonalized ? 4 : 10);

  if (isLoading) {
    return (
      <div className="home-loading">
        <PandaLogo size={80} />
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* ── Mood-Aware Hero ── */}
      <section className="home-hero luxury-hero">
        <div 
          className="hero-bg-layer" 
          style={{ background: `linear-gradient(180deg, ${moodInfo.color}33 0%, transparent 100%)` }}
        />
        <div className="hero-content">
          <div className="hero-top-badges">
            <MoodWidget />
            {currentStreak > 0 && (
              <div className="streak-badge" title={`${currentStreak} days listening streak!`}>
                <span className="streak-icon">🔥</span>
                <span className="streak-count">{currentStreak} day streak</span>
              </div>
            )}
          </div>
          
          <div className="hero-header" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div className="hero-greeting-wrapper">
              <div className="hero-subtitle">
                {isPersonalized ? 'Your Personal Mix' : 'Daily Mix'}
              </div>
              <h1 className="home-greeting">{greeting}</h1>
            </div>
            <div className="hero-panda-container" style={{ marginBottom: -10 }}>
              <PandaCompanion variant="hero" size={100} />
            </div>
          </div>

          <div className="hero-actions">
            <button
              className="btn-primary luxury-btn"
              onClick={() => {
                const pool = quickPicks.length > 0 ? quickPicks : madeForYou.length > 0 ? madeForYou : trendingSongs;
                if (pool.length > 0) actions.playSong(pool[0], pool, 0);
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

      {/* ── Jump Back In (Recently Played) ── */}
      {quickPicks.length > 0 && (
        <section className="content-section" style={{ marginTop: -20, position: 'relative', zIndex: 2 }}>
          <h2 className="section-title">Jump Back In</h2>
          <div className="quick-picks-grid">
            {quickPicks.map((song, i) => (
              <div
                key={song.id}
                className="quick-pick-card"
                onClick={() => actions.playSong(song, quickPicks, i)}
                style={{ '--i': i }}
              >
                <img src={song.coverUrl} alt="" className="quick-pick-art" />
                <div className="quick-pick-info">{song.title}</div>
                <div className="quick-pick-play"><PlayIconSmall /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Made For You (Taste-Driven) ── */}
      {(madeForYou.length > 0 || sectionsLoading) && (
        <section className="content-section">
          <h2 className="section-title">
            Made For You
            <span className={`ai-badge ${isPersonalized ? 'ai-badge--personal' : ''}`}>
              {isPersonalized ? '✦ PERSONALIZED' : 'AI CURATED'}
            </span>
          </h2>
          {sectionsLoading && madeForYou.length === 0 ? (
            <div className="horizontal-scroll">
              {[...Array(6)].map((_, i) => <Skeleton key={i} height="240px" radius="16px" />)}
            </div>
          ) : (
            <div className="horizontal-scroll">
              {madeForYou.map((song, i) => (
                <SongCard key={song.id} song={song} queue={madeForYou} index={i} style={{ '--i': i }} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Personalized Taste Sections ── */}
      {tasteSections.map((section, sIdx) => (
        <section key={section.id} className="content-section">
          <div className="taste-section-header">
            <div>
              <h2 className="section-title taste-section-title">
                {section.title}
                {section.badge && (
                  <span className={`ai-badge ai-badge--${section.id === 'blend' ? 'blend' : section.id === 'discover' ? 'discover' : 'taste'}`}>
                    {section.badge}
                  </span>
                )}
              </h2>
              {section.subtitle && (
                <p className="taste-section-subtitle">{section.subtitle}</p>
              )}
            </div>
          </div>
          <div className="horizontal-scroll">
            {section.songs.map((song, i) => (
              <SongCard key={song.id} song={song} queue={section.songs} index={i} style={{ '--i': i }} />
            ))}
          </div>
        </section>
      ))}

      {/* ── Trending Globally ── */}
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
              <SongRow key={song.id} song={song} queue={topHits} index={i} style={{ '--i': i }} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PlayIconSmall = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
