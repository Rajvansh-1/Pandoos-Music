import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext.jsx';
import './MoodPicker.css';

const MOODS = [
  { id: 'chill', label: 'Chill', color: '#38bdf8', emoji: '😌', query: 'lofi chill beats' },
  { id: 'focus', label: 'Focus', color: '#a78bfa', emoji: '🧠', query: 'deep focus study' },
  { id: 'workout', label: 'Workout', color: '#fb923c', emoji: '🔥', query: 'workout hype gym' },
  { id: 'party', label: 'Party', color: '#f472b6', emoji: '🎉', query: 'party hits dance' },
  { id: 'sleep', label: 'Sleep', color: '#94a3b8', emoji: '🌙', query: 'sleep ambient' },
  { id: 'romance', label: 'Romance', color: '#fb7185', emoji: '❤️', query: 'romantic love songs' }
];

export default function MoodPicker() {
  const navigate = useNavigate();
  const { actions } = usePlayer();

  const handleMoodSelect = (mood) => {
    // In a real app, this would trigger a search and auto-play
    // For now, we'll navigate to search with the mood query
    navigate(`/search?q=${encodeURIComponent(mood.query)}`);
  };

  return (
    <div className="mood-picker-container">
      <div className="mood-grid">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            className="mood-card"
            style={{ '--mood-color': mood.color }}
            onClick={() => handleMoodSelect(mood)}
          >
            <div className="mood-card-bg"></div>
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
