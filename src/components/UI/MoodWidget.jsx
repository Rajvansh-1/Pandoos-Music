import { usePlayer } from '../../context/PlayerContext.jsx';
import { MOODS } from '../../services/moodEngine.js';
import './MoodWidget.css';

export default function MoodWidget({ onMoodOverride }) {
  const { state } = usePlayer();
  const mood = state.currentMood || 'chill';
  const moodInfo = MOODS[mood] || MOODS.chill;

  if (state.recentlyPlayed.length === 0) return null;

  return (
    <div className="mood-widget" title={`Current vibe: ${moodInfo.label}`}>
      <div
        className="mood-orb"
        style={{ '--mood-color': moodInfo.color }}
        aria-hidden="true"
      />
      <div className="mood-info">
        <span className="mood-emoji">{moodInfo.emoji}</span>
        <span className="mood-label">{moodInfo.label} Vibes</span>
      </div>
    </div>
  );
}
