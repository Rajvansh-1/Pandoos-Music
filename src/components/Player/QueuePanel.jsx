import { usePlayer } from '../../context/PlayerContext.jsx';
import { Virtuoso } from 'react-virtuoso';
import { MOODS, predictNextSongs, tagSongMood } from '../../services/moodEngine.js';
import './QueuePanel.css';

export default function QueuePanel() {
  const { state, actions } = usePlayer();
  const { queue, queueIndex, showQueue, currentSong, currentMood, songs, likedSongs } = state;

  if (!showQueue) return null;

  // Predict next songs from mood engine
  const excludeIds = new Set(queue.map(s => s.id));
  const aiSuggestions = currentSong && songs?.length > 0
    ? predictNextSongs(currentSong, currentMood, songs, excludeIds, likedSongs).slice(0, 4)
    : [];

  // Render entire remaining queue instead of slicing just 10
  const upNext = queue.slice(queueIndex + 1);
  const moodInfo = MOODS[currentMood] || MOODS.chill;

  return (
    <>
      {/* Backdrop */}
      <div className="queue-backdrop" onClick={actions.toggleQueue} aria-hidden="true" />

      <div className="queue-panel" role="dialog" aria-label="Queue">
        <div className="queue-header">
          <h2 className="queue-title">Queue</h2>
          <button
            className="icon-btn queue-close-btn"
            onClick={actions.toggleQueue}
            aria-label="Close queue"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="queue-body">
          {/* Now Playing */}
          {currentSong && (
            <div className="queue-section">
              <div className="queue-section-label">Now Playing</div>
              <QueueItem song={currentSong} isActive actions={actions} likedSongs={likedSongs} />
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="queue-section">
              <div className="queue-section-label">
                <span className="mood-orb-sm" style={{ '--mood-color': moodInfo.color }} />
                AI Next — {moodInfo.emoji} {moodInfo.label} Vibes
              </div>
              {aiSuggestions.map((song, i) => (
                <QueueItem
                  key={song.id}
                  song={song}
                  onPlay={() => actions.playSong(song, [currentSong, ...queue.slice(queueIndex + 1), song], queue.length + 1)}
                  likedSongs={likedSongs}
                  actions={actions}
                  badge="AI"
                />
              ))}
            </div>
          )}

          {/* Up Next from queue (Virtualized for performance) */}
          {upNext.length > 0 && (
            <div className="queue-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
              <div className="queue-section-label">Up Next ({upNext.length})</div>
              <div style={{ flex: 1 }}>
                <Virtuoso
                  style={{ height: '100%' }}
                  data={upNext}
                  itemContent={(i, song) => {
                    const globalIdx = queueIndex + 1 + i;
                    return (
                      <QueueItem
                        key={song.id}
                        song={song}
                        onPlay={() => actions.playSong(song, queue, globalIdx)}
                        likedSongs={likedSongs}
                        actions={actions}
                      />
                    );
                  }}
                />
              </div>
            </div>
          )}

          {upNext.length === 0 && aiSuggestions.length === 0 && !currentSong && (
            <div className="queue-empty">
              <span>🎵</span>
              <p>Queue is empty</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function QueueItem({ song, isActive, onPlay, actions, likedSongs, badge }) {
  const isLiked = likedSongs?.has(song.id);
  const mood = tagSongMood(song);
  const moodInfo = MOODS[mood];

  return (
    <div
      className={`queue-item${isActive ? ' is-active' : ''}`}
      onClick={onPlay}
      role={onPlay ? 'button' : undefined}
      tabIndex={onPlay ? 0 : undefined}
      onKeyDown={onPlay ? e => e.key === 'Enter' && onPlay() : undefined}
    >
      <div className="queue-item-art-wrap">
        {song.coverUrl
          ? <img src={song.coverUrl} alt="" className="queue-item-art" />
          : <div className="queue-item-art-placeholder">🎵</div>
        }
        {isActive && (
          <div className="queue-item-playing-indicator" aria-label="Now playing">
            <span /><span /><span />
          </div>
        )}
      </div>

      <div className="queue-item-info">
        <div className="queue-item-title">{song.title}</div>
        <div className="queue-item-artist">{song.artist}</div>
      </div>

      <div className="queue-item-actions">
        {badge && <span className="queue-ai-badge">{badge}</span>}
        {moodInfo && (
          <span
            className="queue-mood-dot"
            style={{ '--mood-color': moodInfo.color }}
            title={`${moodInfo.emoji} ${moodInfo.label}`}
          />
        )}
        <button
          className={`icon-btn queue-like-btn${isLiked ? ' liked' : ''}`}
          onClick={e => { e.stopPropagation(); actions.toggleLike(song.id); }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
