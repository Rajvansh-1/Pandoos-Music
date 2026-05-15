import { usePlayer } from '../context/PlayerContext.jsx';
import SongRow from '../components/UI/SongRow.jsx';
import { motion } from 'framer-motion';

export default function Downloads() {
  const { state, actions } = usePlayer();
  const likedSongs = state.songs.filter(s => state.likedSongs.has(s.id));

  return (
    <div className="downloads-page">
      <div className="downloads-header">
        <div className="downloads-hero-icon">⬇️</div>
        <div>
          <h1 className="downloads-title">Downloads</h1>
          <p className="downloads-subtitle">
            {likedSongs.length > 0
              ? `${likedSongs.length} songs saved to your library`
              : 'Your saved songs appear here'}
          </p>
        </div>
        {likedSongs.length > 0 && (
          <button
            className="btn-primary"
            onClick={() => actions.playSong(likedSongs[0], likedSongs, 0)}
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          >
            ▶ Play All
          </button>
        )}
      </div>

      {likedSongs.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 80 }}
        >
          <div className="empty-icon">🐼</div>
          <div className="empty-title">No downloads yet</div>
          <div className="empty-desc">Like songs to save them here for quick access</div>
        </motion.div>
      ) : (
        <motion.div
          className="song-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.04 }}
        >
          {likedSongs.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <SongRow song={song} index={i} queue={likedSongs} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
