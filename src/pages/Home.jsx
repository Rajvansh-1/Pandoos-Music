import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongCard from '../components/UI/SongCard.jsx';
import SongRow from '../components/UI/SongRow.jsx';
import MoodPicker from '../components/UI/MoodPicker.jsx';
import PandaLogo from '../components/Brand/PandaLogo.jsx';
import { fetchTrendingMusic } from '../services/youtube.js';
import {
  buildTasteProfile,
  buildRecommendationSections,
  fetchMadeForYou,
} from '../services/recommendations.js';
import './Home.css';

export default function Home() {
  const { state, actions } = usePlayer();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [madeForYou, setMadeForYou] = useState([]);
  const [tasteProfile, setTasteProfile] = useState(null);
  const [tasteSections, setTasteSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const builtRef = useRef(false);

  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = 'Good afternoon';

  // Step 1: Load base trending songs (fast, 1 API unit)
  useEffect(() => {
    const src = state.songs.length > 0 ? Promise.resolve(state.songs) : fetchTrendingMusic(20);
    src.then(songs => {
      setTrendingSongs(songs);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []); // eslint-disable-line

  // Step 2: Once data is ready, build taste profile + personalized sections
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

      // Build "Made For You" top row
      fetchMadeForYou(profile.topArtists, trendingSongs).then(songs => {
        setMadeForYou(songs);
      });

      // Build "Because you like X" sections
      const seenIds = new Set(state.recentlyPlayed.map(s => s.id));
      buildRecommendationSections(profile, seenIds).then(sections => {
        setTasteSections(sections);
        setSectionsLoading(false);
      });
    } else {
      // No taste data yet — use trending as fallback
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

      {/* ── Cinematic Hero ── */}
      <section className="home-hero luxury-hero">
        <div className="hero-bg-layer"></div>
        <div className="hero-content">
          <div className="hero-header">
            <PandaLogo size={60} className="hero-panda" />
            <div className="hero-greeting-wrapper">
              <div className="hero-subtitle">
                {isPersonalized ? 'Your Personal Mix' : 'Daily Mix'}
              </div>
              <h1 className="home-greeting">{greeting}</h1>
            </div>
          </div>

          {isPersonalized && tasteProfile?.topArtists?.length > 0 ? (
            <div className="hero-taste-chips">
              <span className="taste-label">Your taste:</span>
              {tasteProfile.topArtists.slice(0, 4).map(artist => (
                <span
                  key={artist}
                  className="taste-chip"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(artist)}`)}
                >
                  {artist}
                </span>
              ))}
            </div>
          ) : (
            <div className="hero-description">
              Jump back into your rhythm or discover something entirely new, curated just for your mood today.
            </div>
          )}

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

      {/* ── Visual Mood Picker ── */}
      <section className="content-section" style={{ marginTop: -40, position: 'relative', zIndex: 2 }}>
        <h2 className="section-title">Vibe Check</h2>
        <MoodPicker />
      </section>

      {/* ── Jump Back In (Recently Played) ── */}
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
            <div className="recs-skeleton-row">
              {[...Array(6)].map((_, i) => <div key={i} className="recs-skeleton-card" />)}
            </div>
          ) : (
            <div className="card-grid">
              {madeForYou.map((song, i) => (
                <SongCard key={song.id} song={song} queue={madeForYou} index={i} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Personalized Taste Sections (Spotify-style "Because you like X") ── */}
      {tasteSections.map(section => (
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
          <div className="card-grid">
            {section.songs.map((song, i) => (
              <SongCard key={song.id} song={song} queue={section.songs} index={i} />
            ))}
          </div>
        </section>
      ))}

      {/* ── Sections loading skeleton ── */}
      {sectionsLoading && isPersonalized && tasteSections.length === 0 && (
        <section className="content-section">
          <div className="recs-building-indicator">
            <span className="recs-building-dot" />
            <span className="recs-building-dot" />
            <span className="recs-building-dot" />
            <span className="recs-building-text">Building your taste profile…</span>
          </div>
          <div className="recs-skeleton-row">
            {[...Array(4)].map((_, i) => <div key={i} className="recs-skeleton-card" />)}
          </div>
        </section>
      )}

      {/* ── No taste data yet? Show onboarding nudge ── */}
      {!isPersonalized && !sectionsLoading && quickPicks.length === 0 && (
        <section className="content-section">
          <div className="taste-onboarding-card">
            <div className="taste-onboarding-icon">🎧</div>
            <h3 className="taste-onboarding-title">Your personal feed is warming up</h3>
            <p className="taste-onboarding-desc">
              Play a few songs you love. Pandoos will learn your taste and start curating music just for you — like Spotify, but better.
            </p>
            <button
              className="btn-primary luxury-btn taste-onboarding-btn"
              onClick={() => navigate('/search')}
            >
              <DiscoverIcon /> Find Your Music
            </button>
          </div>
        </section>
      )}

      {/* ── Trending Globally (always show, smaller when personalized) ── */}
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
const DiscoverIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>;
