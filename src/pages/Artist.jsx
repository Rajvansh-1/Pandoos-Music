import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext.jsx';
import { searchYouTube } from '../services/youtube.js';
import { APP_CONFIG } from '../config.js';
import SongCard from '../components/UI/SongCard.jsx';
import './Artist.css';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Format play-count number like Spotify: 1,234,567 */
function fmtListeners(n) {
  return n.toLocaleString('en-IN');
}

/** Format seconds → M:SS */
function fmtDur(sec) {
  if (!sec) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Pick the dominant cover from the top tracks to use as the hero banner */
function pickBannerUrl(songs) {
  // prefer maxres thumbnails; fall back to first available
  for (const s of songs) {
    if (s.coverUrl?.includes('maxres') || s.coverUrl?.includes('hqdefault')) return s.coverUrl;
  }
  return songs[0]?.coverUrl || '';
}

/** Simulated monthly listeners based on artist name hash (consistent per artist) */
function simulateListeners(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  const base = Math.abs(hash) % 40_000_000;
  return 8_000_000 + base; // 8M – 48M range
}

/** Related artist seeds per genre/style */
const RELATED_SEEDS = {
  'Arijit Singh':    ['Jubin Nautiyal', 'Armaan Malik', 'Atif Aslam', 'KK'],
  'Jubin Nautiyal':  ['Arijit Singh', 'B Praak', 'Darshan Raval', 'Mohit Chauhan'],
  'B Praak':         ['Jubin Nautiyal', 'Ammy Virk', 'Gurnam Bhullar', 'Hardy Sandhu'],
  'Atif Aslam':      ['Arijit Singh', 'Rahat Fateh Ali Khan', 'Armaan Malik'],
  'Armaan Malik':    ['Arijit Singh', 'Harrdy Sandhu', 'Badshah', 'Darshan Raval'],
  'Badshah':         ['Honey Singh', 'Guru Randhawa', 'Diljit Dosanjh', 'AP Dhillon'],
  'AP Dhillon':      ['Badshah', 'Diljit Dosanjh', 'Shubh', 'Sidhu Moosewala'],
  'Diljit Dosanjh':  ['AP Dhillon', 'Ammy Virk', 'Guru Randhawa', 'Hardy Sandhu'],
  'default':         ['Arijit Singh', 'Jubin Nautiyal', 'B Praak', 'Armaan Malik', 'Badshah'],
};

function getRelated(artist) {
  const key = Object.keys(RELATED_SEEDS).find(k => artist.toLowerCase().includes(k.toLowerCase()));
  return key ? RELATED_SEEDS[key] : RELATED_SEEDS.default;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Artist() {
  const { name } = useParams();
  const navigate  = useNavigate();
  const { actions, state } = usePlayer();
  const decodedName = decodeURIComponent(name || '');

  const [topTracks,   setTopTracks]   = useState([]);
  const [discography, setDiscography] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [showAll,     setShowAll]     = useState(false);
  const [headerBg,    setHeaderBg]    = useState('');
  const bannerRef = useRef(null);

  const listeners  = simulateListeners(decodedName);
  const related    = getRelated(decodedName);
  const isFollowed = state.likedSongs.size > 0; // proxy: if user has liked anything
  const playCount  = state.playStats;

  // Fetch tracks
  useEffect(() => {
    if (!decodedName || !APP_CONFIG.hasYouTubeKey) { setLoading(false); return; }
    setLoading(true); setError(false); setTopTracks([]); setDiscography([]);

    Promise.all([
      searchYouTube(`${decodedName} songs`, 10),
      searchYouTube(`${decodedName} new songs 2024`, 8),
    ])
      .then(([top, disc]) => {
        setTopTracks(top);
        // Discography: dedupe against topTracks, take 6
        const topIds = new Set(top.map(s => s.id));
        const discUniq = disc.filter(s => !topIds.has(s.id)).slice(0, 6);
        setDiscography(discUniq.length > 0 ? discUniq : top.slice(5, 11));
        setHeaderBg(pickBannerUrl(top));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [decodedName]); // eslint-disable-line

  // Parallax scroll effect on banner
  useEffect(() => {
    const el = document.getElementById('scrollable-content');
    if (!el || !bannerRef.current) return;
    const handler = () => {
      const scroll = el.scrollTop;
      if (bannerRef.current) {
        bannerRef.current.style.transform = `translateY(${scroll * 0.4}px)`;
      }
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [loading]);

  const visibleTracks = showAll ? topTracks : topTracks.slice(0, 5);

  if (!APP_CONFIG.hasYouTubeKey) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🐼</div>
        <div className="empty-title">API Key Required</div>
        <div className="empty-desc">Artist profiles require an API key.</div>
      </div>
    );
  }

  return (
    <div className="artist-page">

      {/* ── Cinematic Hero ─────────────────────────────────── */}
      <div className="artist-hero" ref={bannerRef}>
        {headerBg && (
          <img src={headerBg} alt="" className="artist-hero-bg" />
        )}
        <div className="artist-hero-overlay" />
        <div className="artist-hero-content">
          {/* Artist Avatar */}
          <div className="artist-avatar">
            {headerBg
              ? <img src={headerBg} alt={decodedName} className="artist-avatar-img" />
              : <span className="artist-avatar-emoji">🎤</span>
            }
            <div className="artist-avatar-verified" title="Verified Artist">
              <VerifiedIcon />
            </div>
          </div>

          <div className="artist-meta">
            <div className="artist-type-label">Artist</div>
            <h1 className="artist-name">{decodedName}</h1>
            <div className="artist-listeners">
              <span className="artist-listeners-count">{fmtListeners(listeners)}</span>
              &nbsp;monthly listeners
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Row ─────────────────────────────────────── */}
      <div className="artist-actions-row">
        <button
          className="artist-play-fab"
          disabled={topTracks.length === 0}
          onClick={() => actions.playSong(topTracks[0], topTracks, 0)}
          title="Play"
        >
          {state.currentSong && topTracks.some(s => s.id === state.currentSong?.id) && state.isPlaying
            ? <PauseIcon />
            : <PlayIcon />
          }
        </button>

        <button className={`artist-follow-btn ${isFollowed ? 'artist-follow-btn--following' : ''}`}>
          {isFollowed ? 'Following' : 'Follow'}
        </button>

        <button className="artist-more-btn" title="More options">
          <DotsIcon />
        </button>
      </div>

      {/* ── Popular Tracks ─────────────────────────────────── */}
      <section className="content-section">
        <h2 className="section-title">Popular</h2>

        {loading ? (
          <div className="artist-track-skeleton-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="artist-track-skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-title">Couldn't load tracks</div>
          </div>
        ) : (
          <>
            <div className="artist-track-list">
              {visibleTracks.map((song, i) => {
                const isActive  = state.currentSong?.id === song.id;
                const playCount = state.playStats[song.id] || 0;
                // Simulate stream count using position + random seed from song id
                const streams = simulateStreams(song.id, i);

                return (
                  <div
                    key={song.id}
                    className={`artist-track-row${isActive ? ' artist-track-row--active' : ''}`}
                    onClick={() => actions.playSong(song, topTracks, i)}
                  >
                    <div className="artist-track-num">
                      {isActive && state.isPlaying
                        ? <WaveformAnim />
                        : <span className="artist-track-index">{i + 1}</span>
                      }
                      <PlayIcon className="artist-track-play-icon" />
                    </div>

                    <img src={song.coverUrl} alt={song.title} className="artist-track-art" loading="lazy" />

                    <div className="artist-track-info">
                      <div className={`artist-track-title${isActive ? ' artist-track-title--active' : ''}`}>
                        {song.title}
                      </div>
                    </div>

                    <div className="artist-track-streams">
                      {fmtListeners(streams)}
                    </div>

                    <button
                      className="artist-track-like"
                      onClick={(e) => { e.stopPropagation(); actions.toggleLike(song.id); }}
                      title={state.likedSongs.has(song.id) ? 'Unlike' : 'Like'}
                    >
                      {state.likedSongs.has(song.id) ? <HeartFilledIcon /> : <HeartIcon />}
                    </button>

                    <div className="artist-track-dur">{fmtDur(song.duration)}</div>
                  </div>
                );
              })}
            </div>

            {topTracks.length > 5 && (
              <button
                className="artist-show-more-btn"
                onClick={() => setShowAll(v => !v)}
              >
                {showAll ? 'Show less' : 'See more'}
              </button>
            )}
          </>
        )}
      </section>

      {/* ── Discography ────────────────────────────────────── */}
      {!loading && discography.length > 0 && (
        <section className="content-section">
          <div className="section-header-row">
            <h2 className="section-title" style={{ margin: 0 }}>Discography</h2>
            <button
              className="artist-see-all-btn"
              onClick={() => navigate(`/search?q=${encodeURIComponent(decodedName)}`)}
            >
              Show all
            </button>
          </div>
          <div className="card-grid">
            {discography.map((song, i) => (
              <SongCard key={song.id} song={song} queue={discography} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Fans Also Like (Related Artists) ───────────────── */}
      <section className="content-section">
        <h2 className="section-title">Fans also like</h2>
        <div className="related-artists-grid">
          {related.map(artistName => (
            <div
              key={artistName}
              className="related-artist-card"
              onClick={() => navigate(`/artist/${encodeURIComponent(artistName)}`)}
            >
              <div className="related-artist-avatar">
                <span>{artistName[0]}</span>
              </div>
              <div className="related-artist-name">{artistName}</div>
              <div className="related-artist-type">Artist</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────── */}
      <section className="content-section pb-32">
        <h2 className="section-title">About</h2>
        <div className="artist-about-card">
          {headerBg && (
            <img src={headerBg} alt="" className="artist-about-bg" />
          )}
          <div className="artist-about-overlay" />
          <div className="artist-about-content">
            <div className="artist-about-listeners">
              <span className="artist-about-count">{fmtListeners(listeners)}</span>
              <span className="artist-about-label">monthly listeners</span>
            </div>
            <p className="artist-about-bio">
              {generateBio(decodedName, listeners)}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

// ── Simulated stream count (deterministic per song) ─────────────────────────
function simulateStreams(songId, position) {
  let hash = 0;
  for (let i = 0; i < songId.length; i++) hash = (hash * 31 + songId.charCodeAt(i)) & 0xffffffff;
  const base = Math.abs(hash) % 50_000_000;
  // Top songs have more streams
  const positionMultiplier = Math.max(0.2, 1 - position * 0.15);
  return Math.round((5_000_000 + base) * positionMultiplier);
}

// ── Auto-generated bio ───────────────────────────────────────────────────────
function generateBio(name, listeners) {
  const templates = [
    `${name} is one of the most beloved voices in Indian music, captivating millions of listeners with soulful melodies and heartfelt lyrics. With ${(listeners / 1_000_000).toFixed(1)}M monthly listeners, their music transcends generations and languages, creating an emotional connection that few artists achieve.`,
    `Known for a unique blend of classical sensibilities and contemporary sounds, ${name} has become a household name across South Asia and beyond. Their catalog spans romantic ballads, Bollywood anthems, and independent releases that have defined a generation of music lovers.`,
    `${name} brings raw emotion and exceptional range to every performance. With chart-topping hits across Bollywood and regional music, they continue to push the boundaries of Indian contemporary music while staying true to their roots.`,
  ];
  // Pick consistently based on name
  const idx = name.length % templates.length;
  return templates[idx];
}

// ── Icons ────────────────────────────────────────────────────────────────────
const PlayIcon  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const HeartIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const HeartFilledIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
const DotsIcon  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
const VerifiedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ed760">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1ed760" strokeWidth="2" fill="none"/>
    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);
const WaveformAnim = () => (
  <div className="waveform-anim">
    <span /><span /><span /><span />
  </div>
);
