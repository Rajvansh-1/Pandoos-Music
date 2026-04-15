import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { fetchTrendingMusic, DEMO_SONGS, buildPlaylists } from '../services/youtube.js';
import { APP_CONFIG, FEATURED_SEARCHES } from '../config.js';
import { showToast } from '../components/UI/Toast.jsx';
import SongCard from '../components/UI/SongCard.jsx';
import PlaylistCard from '../components/UI/PlaylistCard.jsx';
import SongRow from '../components/UI/SongRow.jsx';
import Skeleton from '../components/UI/Skeleton.jsx';

export default function Home() {
  const { state, actions } = usePlayer();
  const [loading, setLoading] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 5  ? 'Good Night'     :
    hour < 12 ? 'Good Morning'   :
    hour < 17 ? 'Good Afternoon' :
                'Good Evening';

  /* ── Boot: fetch trending on first mount ── */
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
            ? `🔥 ${songs.length} trending tracks loaded!`
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

  const { songs, playlists, isLoading, recentlyPlayed } = state;
  const mainPlaylists  = playlists.filter(p => p.id !== 'pl_liked');
  const likedPlaylist  = playlists.find(p => p.id === 'pl_liked');
  const showSkeleton   = loading || isLoading;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="home-hero">
        <h1 className="home-greeting">
          {greeting}, <span className="highlight">Panda Fan!</span>
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', fontWeight:600, marginTop:8, position:'relative', zIndex:1 }}>
          {APP_CONFIG.hasYouTubeKey
            ? '🔥 Trending hits from YouTube — updated every 30 minutes'
            : '🐼 Demo mode · Add your YouTube API key to unlock everything'}
        </p>
        <div className="hero-panda" aria-hidden="true">🐼</div>
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
          <div className="card-scroll-row">
            {recentlyPlayed.slice(0, 10).map((song, i) => (
              <div key={song.id} style={{ flexShrink:0, width:160 }}>
                <SongCard song={song} queue={recentlyPlayed} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Collections (playlists) ───────────────────── */}
      {!showSkeleton && mainPlaylists.length > 0 && (
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Your Collections</h2>
          </div>
          <div className="card-grid">
            {mainPlaylists.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)}
            {likedPlaylist && (
              <PlaylistCard
                key="pl_liked"
                playlist={{
                  ...likedPlaylist,
                  songIds: songs.filter(s => state.likedSongs.has(s.id)).map(s => s.id),
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* ── Trending / Featured grid ──────────────────── */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">
            {APP_CONFIG.hasYouTubeKey ? '🔥 Trending Now' : '🎵 Featured Songs'}
          </h2>
          {songs.length > 8 && (
            <span className="section-see-all" onClick={() => {}}>
              {songs.length} tracks
            </span>
          )}
        </div>

        {showSkeleton ? (
          <Skeleton type="card-grid" count={10} />
        ) : songs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🐼</div>
            <div className="empty-title">No songs loaded</div>
            <div className="empty-desc">Check your YouTube API key in .env file</div>
          </div>
        ) : (
          <div className="card-grid">
            {songs.slice(0, 10).map((song, i) => (
              <SongCard key={song.id} song={song} queue={songs} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Full song list ────────────────────────────── */}
      {songs.length > 0 && (
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">All Songs</h2>
            <button
              className="btn-primary"
              style={{ padding:'var(--space-2) var(--space-4)', fontSize:'0.8125rem' }}
              onClick={() => actions.playSong(songs[0], songs, 0)}
            >
              ▶ Play All
            </button>
          </div>
          <div className="song-list">
            {songs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} queue={songs} />
            ))}
          </div>
        </section>
      )}

      <div style={{ height:'var(--space-12)' }} />
    </div>
  );
}

function MoodChip({ label, onClick }) {
  return (
    <button className="mood-pill" onClick={onClick}>
      {label}
    </button>
  );
}
