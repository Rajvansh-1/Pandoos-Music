import { useState, useEffect } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import './SleepTimerWidget.css';

export default function SleepTimerWidget() {
  const { state, actions } = usePlayer();
  const { sleepTimerEnd, showSleepTimer } = state;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!sleepTimerEnd) return;
    const interval = setInterval(() => {
      const remaining = sleepTimerEnd - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  if (!showSleepTimer) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="timer-backdrop" onClick={actions.toggleSleepTimer} aria-hidden="true" />
      <div className="timer-panel" role="dialog" aria-label="Sleep timer">
        <div className="timer-header">
          <h2 className="timer-title">Sleep Timer</h2>
          <button className="icon-btn timer-close" onClick={actions.toggleSleepTimer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="timer-body">
          {sleepTimerEnd ? (
            <div className="timer-active">
              <div className="timer-circle">
                <div className="timer-ring"></div>
                <div className="timer-countdown">{formatTime(timeLeft)}</div>
              </div>
              <button className="btn-ghost timer-cancel" onClick={() => actions.setSleepTimer(null)}>
                Cancel Timer
              </button>
            </div>
          ) : (
            <div className="timer-presets">
              <p className="timer-desc">Stop audio after:</p>
              <div className="preset-grid">
                {[15, 30, 45, 60].map(mins => (
                  <button key={mins} className="timer-preset-btn" onClick={() => actions.setSleepTimer(mins)}>
                    {mins} min
                  </button>
                ))}
                <button className="timer-preset-btn" onClick={() => actions.setSleepTimer('end')}>
                  End of track
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
