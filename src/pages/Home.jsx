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
    if (state.songs.length > 0) return;
    setLoading(true);

    const load = async () => {
      try {
        const songs = APP_CONFIG.hasYouTubeKey
          ? await fetchTrendingMusic(20)
          : DEMO_SONGS;
        const playlists = buildPlaylists(songs);
        actions.setSongs(songs, playlists);
        showToast(
          APP_CONFIG.hasYouTubeKey
            ? `🎋 ${songs.length} trending tracks loaded!`
            : '🐼 Demo mode — add YouTube API key for trending music',
          'success'
        );
      } catch (err) {
        console.warn('Trending fetch failed, falling back:', err.message);
        const playlists = buildPlaylists(DEMO_SONGS);
        actions.setSongs(DEMO_SONGS, playlists);
        showToast('🐼 Using demo songs — check your API key', 'info', 5000);
      } finally {
        setLoading(false);
      }
    };

    load();
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
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="home-hero">
        <h1 className="home-greeting">
          {greeting}, <span className="highlight">Panda Fan!</span>
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', fontWeight:600, marginTop:8, position:'relative', zIndex:1 }}>
          {APP_CONFIG.hasYouTubeKey
            ? '🎋 Trending hits from YouTube — updated every 30 minutes'
            : '🐼 Demo mode · Add your YouTube API key to unlock everything'}
        </p>
        {/* ── Animated panda bamboo scene ── */}
        <div className="hero-panda-scene" aria-hidden="true">
          <div className="bamboo-stalk bamboo-1">
            <span className="bamboo-seg">🎋</span>
            <span className="bamboo-seg">🎋</span>
            <span className="bamboo-seg">🍃</span>
          </div>
          <div className="bamboo-stalk bamboo-2">
            <span className="bamboo-seg">🎋</span>
            <span className="bamboo-seg">🍃</span>
          </div>
          <div className="panda-hangs">🐼</div>
          <div className="leaf-fall leaf-1">🍃</div>
          <div className="leaf-fall leaf-2">🌿</div>
          <div className="leaf-fall leaf-3">🍃</div>
        </div>
      </div>

      {/* ── Mood / Quick-search chips ─────────────────── */}
      <div className="mood-strip">
        {FEATURED_SEARCHES.map(({ label, query }) => (
          <MoodChip
            key={query}
            label={label}
            onClick={() => {
              window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }}
          />
        ))}
      </div>

      {/* ── Jump Back In (recently played) ───────────── */}
      {recentlyPlayed.length > 0 && (
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Jump Back In</h2>
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
            {APP_CONFIG.hasYouTubeKey ? '🎋 Trending Now' : '🍃 Featured Songs'}
          </h2>
          {songs.length > 8 && (
            <span className="section-see-all" onClick={() => {}}>
              {songs.length} tracks
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
