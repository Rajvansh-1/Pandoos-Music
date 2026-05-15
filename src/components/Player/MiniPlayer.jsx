import { usePlayer } from '../../context/PlayerContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, X } from 'lucide-react';

export default function MiniPlayer() {
  const { state, actions } = usePlayer();
  const { currentSong, isPlaying, progress } = state;

  return (
    <AnimatePresence>
      {currentSong && (
        <motion.div
          className="mini-player"
          role="complementary"
          aria-label="Mini player"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* Progress bar */}
          <div className="mini-player-progress-track">
            <motion.div
              className="mini-player-progress"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="mini-player-inner">
            {/* Art */}
            <motion.div
              whileTap={{ scale: 0.92 }}
              onClick={actions.toggleFullscreen}
              style={{ flexShrink: 0 }}
            >
              {currentSong.coverUrl ? (
                <img
                  className={`mini-player-art${isPlaying ? ' spinning-slow' : ''}`}
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                />
              ) : (
                <div className="mini-player-art mini-player-art-placeholder">🎵</div>
              )}
            </motion.div>

            {/* Info */}
            <div className="mini-player-info" onClick={actions.toggleFullscreen}>
              <div className="mini-player-title">{currentSong.title}</div>
              <div className="mini-player-artist">{currentSong.artist}</div>
            </div>

            {/* Controls */}
            <div className="mini-player-controls">
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="mini-ctrl-btn"
                onClick={e => { e.stopPropagation(); actions.prevTrack(); }}
                aria-label="Previous"
              >
                <SkipBack size={18} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                className="mini-ctrl-btn mini-ctrl-play"
                onClick={e => { e.stopPropagation(); actions.togglePlay(); }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                className="mini-ctrl-btn"
                onClick={e => { e.stopPropagation(); actions.nextTrack(); }}
                aria-label="Next"
              >
                <SkipForward size={18} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                className="mini-ctrl-btn"
                onClick={e => { e.stopPropagation(); actions.toggleFullscreen(); }}
                aria-label="Expand"
              >
                <ChevronUp size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
