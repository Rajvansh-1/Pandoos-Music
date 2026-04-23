import {
  createContext, useContext, useReducer, useRef,
  useEffect, useCallback, useState,
} from 'react';
import { fetchRelated, searchYouTube } from '../services/youtube.js';
import { extractColors, applyAmbientColors } from '../services/colorExtractor.js';

// ─── Initial State ─────────────────────────────────────────
const initialState = {
  songs:        [],
  playlists:    [],
  isLoading:    true,
  error:        null,
  // Playback
  currentSong:  null,
  queue:        [],
  queueIndex:   -1,
  isPlaying:    false,
  playerReady:  false,
  progress:     0,
  currentTime:  0,
  duration:     0,
  volume:       0.8,
  isMuted:      false,
  shuffle:      false,
  repeat:       'none',    // 'none' | 'one' | 'all'
  // UI State
  showFullscreen: false,
  showQueue:      false,
  likedSongs:     new Set(),
  recentlyPlayed: [],
  sleepTimer:     null,
  // Gamification & Engagement
  playStats:      {},      // { songId: playCount }
  currentStreak:  0,       // days
  lastPlayedDate: null,    // YYYY-MM-DD
  ambientColors:  null,    // Current extracted colors
};

// ─── Reducer ──────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_SONGS':
      return { ...state, songs: action.songs, playlists: action.playlists, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };

    case 'PLAY': {
      const song = action.song;
      const recent = [song, ...state.recentlyPlayed.filter(s => s.id !== song.id)].slice(0, 30);
      
      // Update play stats
      const stats = { ...state.playStats };
      stats[song.id] = (stats[song.id] || 0) + 1;

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      let streak = state.currentStreak;
      let lastDate = state.lastPlayedDate;

      if (lastDate !== today) {
        if (!lastDate) {
          streak = 1;
        } else {
          const last = new Date(lastDate);
          const current = new Date(today);
          const diffTime = Math.abs(current - last);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if (diffDays === 1) streak += 1;
          else streak = 1; // broken streak
        }
      }

      return {
        ...state,
        currentSong:    song,
        queue:          action.queue ?? state.queue,
        queueIndex:     action.index ?? 0,
        isPlaying:      true,
        recentlyPlayed: recent,
        playStats:      stats,
        currentStreak:  streak,
        lastPlayedDate: today,
      };
    }
    case 'PAUSE':        return { ...state, isPlaying: false };
    case 'RESUME':       return { ...state, isPlaying: true };
    case 'PLAYER_READY': return { ...state, playerReady: true };

    case 'SET_PROGRESS':
      return { ...state, progress: action.progress, currentTime: action.currentTime, duration: action.duration };
    
    case 'SET_AMBIENT_COLORS':
      return { ...state, ambientColors: action.colors };

    case 'SET_VOLUME':   return { ...state, volume: action.volume, isMuted: false };
    case 'TOGGLE_MUTE':  return { ...state, isMuted: !state.isMuted };

    case 'TOGGLE_SHUFFLE': return { ...state, shuffle: !state.shuffle };
    case 'SET_REPEAT':     return { ...state, repeat: action.repeat };

    case 'TOGGLE_LIKE': {
      const liked = new Set(state.likedSongs);
      if (liked.has(action.id)) liked.delete(action.id);
      else liked.add(action.id);
      return { ...state, likedSongs: liked };
    }

    case 'RESTORE_STATE':
      return { ...state, ...action.payload };

    case 'TOGGLE_FULLSCREEN': return { ...state, showFullscreen: !state.showFullscreen };
    case 'TOGGLE_QUEUE':      return { ...state, showQueue: !state.showQueue };
    case 'SET_SLEEP_TIMER':   return { ...state, sleepTimer: action.timer };

    default: return state;
  }
}

// ─── Context ──────────────────────────────────────────────
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Stable refs
  const stateRef     = useRef(state);
  const ytPlayerRef  = useRef(null);
  const progressRef  = useRef(null);

  stateRef.current = state;

  // ── Restore persisted data ─────────────────────
  useEffect(() => {
    try {
      const liked  = JSON.parse(localStorage.getItem('pandoos_liked')  || '[]');
      const recent = JSON.parse(localStorage.getItem('pandoos_recent') || '[]');
      const stats  = JSON.parse(localStorage.getItem('pandoos_stats') || '{}');
      const streak = parseInt(localStorage.getItem('pandoos_streak') || '0', 10);
      const lastDt = localStorage.getItem('pandoos_last_date') || null;

      dispatch({ type: 'RESTORE_STATE', payload: {
        likedSongs: new Set(liked),
        recentlyPlayed: recent,
        playStats: stats,
        currentStreak: streak,
        lastPlayedDate: lastDt
      }});
    } catch { /* ignore corrupt storage */ }
  }, []);

  // ── Persist user data ────────────────────────
  useEffect(() => {
    localStorage.setItem('pandoos_liked', JSON.stringify([...state.likedSongs]));
    localStorage.setItem('pandoos_recent', JSON.stringify(state.recentlyPlayed));
    localStorage.setItem('pandoos_stats', JSON.stringify(state.playStats));
    localStorage.setItem('pandoos_streak', state.currentStreak.toString());
    if (state.lastPlayedDate) localStorage.setItem('pandoos_last_date', state.lastPlayedDate);
  }, [state.likedSongs, state.recentlyPlayed, state.playStats, state.currentStreak, state.lastPlayedDate]);

  // ── Ambient Color Extraction ─────────────────
  useEffect(() => {
    if (state.currentSong?.coverUrl) {
      extractColors(state.currentSong.coverUrl).then(colors => {
        dispatch({ type: 'SET_AMBIENT_COLORS', colors });
        applyAmbientColors(document.documentElement, colors);
      });
    }
  }, [state.currentSong?.id]); // eslint-disable-line

  // ── Progress polling ─────────────────────────────────────
  const startPoll = useCallback(() => {
    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      const p = ytPlayerRef.current;
      if (!p?.getCurrentTime) return;
      try {
        const cur = p.getCurrentTime() || 0;
        const dur = p.getDuration()    || 0;
        dispatch({ type: 'SET_PROGRESS', progress: dur ? cur / dur : 0, currentTime: cur, duration: dur });
      } catch { /* player destroyed */ }
    }, 500);
  }, []);

  const stopPoll = useCallback(() => clearInterval(progressRef.current), []);

  const advanceQueue = useCallback(async () => {
    const { queue, queueIndex, shuffle, repeat, currentSong } = stateRef.current;
    if (!queue.length) return;
    if (repeat === 'one') {
      ytPlayerRef.current?.seekTo(0, true);
      ytPlayerRef.current?.playVideo();
      return;
    }
    
    let next;
    let nextQueue = [...queue];

    if (shuffle) {
      next = Math.floor(Math.random() * queue.length);
    } else {
      next = queueIndex + 1;
      
      // AI DJ Infinity Engine
      if (next >= queue.length) {
        if (repeat === 'all') {
          next = 0;
        } else if (currentSong?.videoId && currentSong.source === 'youtube') {
          try {
            const artist = currentSong.artist || '';
            const allLikedIds = Array.from(stateRef.current.likedSongs);
            
            // AI Magic: Blend current artist with liked artist
            const likedSongsAvailable = stateRef.current.songs.filter(s => allLikedIds.includes(s.id) && s.artist !== artist);
            let randomLikedArtist = '';
            if (likedSongsAvailable.length > 0) {
              randomLikedArtist = likedSongsAvailable[Math.floor(Math.random() * likedSongsAvailable.length)].artist;
            }

            let newTracks = [];
            let djQuery = artist ? `${artist} songs` : '';
            if (artist && randomLikedArtist) djQuery = `${artist} & ${randomLikedArtist} best audio`;

            if (djQuery) {
              const res = await searchYouTube(djQuery, 6);
              newTracks = res.filter(r => !queue.some(q => q.id === r.id));
            }

            if (newTracks.length === 0) {
              const related = await fetchRelated(currentSong.videoId, 5);
              newTracks = related.filter(r => !queue.some(q => q.id === r.id));
            }

            if (newTracks.length > 0) {
              nextQueue = [...queue, ...newTracks];
            } else {
              stopPoll(); dispatch({ type: 'PAUSE' }); return;
            }
          } catch {
            stopPoll(); dispatch({ type: 'PAUSE' }); return;
          }
        } else {
          stopPoll(); dispatch({ type: 'PAUSE' }); return;
        }
      }
    }
    
    dispatch({ type: 'PLAY', song: nextQueue[next], queue: nextQueue, index: next });
  }, [stopPoll]);

  // ── YouTube bindings ─────────────────────────────────────
  useEffect(() => {
    window.__pandoosOnReady = () => {
      dispatch({ type: 'PLAYER_READY' });
      ytPlayerRef.current?.setVolume(Math.round(stateRef.current.volume * 100));
    };
    window.__pandoosOnStateChange = (ytState) => {
      if (ytState === 1) {          // PLAYING
        dispatch({ type: 'RESUME' }); startPoll();
      } else if (ytState === 2) {   // PAUSED
        dispatch({ type: 'PAUSE' }); stopPoll();
      } else if (ytState === 0) {   // ENDED
        stopPoll(); advanceQueue();
      }
    };
    window.__pandoosOnError = (errorCode) => {
      if ([100, 101, 150].includes(errorCode)) advanceQueue();
    };
    return () => {
      delete window.__pandoosOnReady; delete window.__pandoosOnStateChange; delete window.__pandoosOnError;
      stopPoll();
    };
  }, [startPoll, stopPoll, advanceQueue]);

  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!state.currentSong?.videoId || !p) return;
    try { p.loadVideoById(state.currentSong.videoId); } catch (err) {}
  }, [state.currentSong?.id]); // eslint-disable-line

  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!p?.setVolume) return;
    if (state.isMuted) p.mute();
    else { p.unMute(); p.setVolume(Math.round(state.volume * 100)); }
  }, [state.volume, state.isMuted]);

  useEffect(() => {
    if (!state.currentSong || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title:   state.currentSong.title,
        artist:  state.currentSong.artist,
        artwork: state.currentSong.coverUrl ? [{ src: state.currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
      });
      navigator.mediaSession.setActionHandler('play',          () => actions.resume());
      navigator.mediaSession.setActionHandler('pause',         () => actions.pause());
      navigator.mediaSession.setActionHandler('nexttrack',     () => actions.nextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => actions.prevTrack());
    } catch {}
  }, [state.currentSong?.id]); // eslint-disable-line

  useEffect(() => {
    if (!state.sleepTimer) return;
    const ms = state.sleepTimer.endsAt - Date.now();
    if (ms <= 0) {
      ytPlayerRef.current?.pauseVideo(); dispatch({ type: 'SET_SLEEP_TIMER', timer: null });
      return;
    }
    const id = setTimeout(() => {
      ytPlayerRef.current?.pauseVideo(); dispatch({ type: 'SET_SLEEP_TIMER', timer: null });
    }, ms);
    return () => clearTimeout(id);
  }, [state.sleepTimer]);

  const actions = {
    playSong: useCallback((song, queue, index) => {
      if (!song) return;
      dispatch({ type: 'PLAY', song, queue: queue || [song], index: index ?? 0 });
    }, []),

    playPlaylist: useCallback((playlist, allSongs, startIndex = 0) => {
      const songs = playlist.id === 'pl_liked'
        ? allSongs.filter(s => stateRef.current.likedSongs.has(s.id))
        : playlist.songIds.map(id => allSongs.find(s => s.id === id)).filter(Boolean);
      if (!songs.length) return;
      dispatch({ type: 'PLAY', song: songs[startIndex] || songs[0], queue: songs, index: startIndex });
    }, []),

    pause:    useCallback(() => { ytPlayerRef.current?.pauseVideo(); dispatch({ type: 'PAUSE' }); }, []),
    resume:   useCallback(() => { ytPlayerRef.current?.playVideo();  dispatch({ type: 'RESUME' }); }, []),
    togglePlay: useCallback(() => {
      if (stateRef.current.isPlaying) { ytPlayerRef.current?.pauseVideo(); dispatch({ type: 'PAUSE' }); } 
      else { ytPlayerRef.current?.playVideo();  dispatch({ type: 'RESUME' }); }
    }, []),
    nextTrack: useCallback(() => advanceQueue(), [advanceQueue]),
    prevTrack: useCallback(() => {
      const { queue, queueIndex, currentTime } = stateRef.current;
      if (currentTime > 3) { ytPlayerRef.current?.seekTo(0, true); return; }
      const prev = Math.max(0, queueIndex - 1);
      if (queue[prev]) dispatch({ type: 'PLAY', song: queue[prev], queue, index: prev });
    }, []),
    seek: useCallback((ratio) => {
      const dur = ytPlayerRef.current?.getDuration?.() || 0;
      if (dur) ytPlayerRef.current?.seekTo(Math.max(0, Math.min(1, ratio)) * dur, true);
    }, []),
    setVolume:     useCallback((v) => dispatch({ type: 'SET_VOLUME', volume: Math.max(0, Math.min(1, v)) }), []),
    toggleMute:    useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []),
    toggleShuffle: useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []),
    cycleRepeat:   useCallback(() => {
      const modes = ['none', 'all', 'one'];
      const next  = modes[(modes.indexOf(stateRef.current.repeat) + 1) % modes.length];
      dispatch({ type: 'SET_REPEAT', repeat: next });
    }, []),
    toggleLike:       useCallback((id) => dispatch({ type: 'TOGGLE_LIKE', id }), []),
    toggleFullscreen: useCallback(() => dispatch({ type: 'TOGGLE_FULLSCREEN' }), []),
    toggleQueue:      useCallback(() => dispatch({ type: 'TOGGLE_QUEUE' }), []),
    setSleepTimer: useCallback((minutes) => {
      dispatch({ type: 'SET_SLEEP_TIMER', timer: minutes ? { endsAt: Date.now() + minutes * 60_000 } : null });
    }, []),
    setSongs: useCallback((songs, playlists) => dispatch({ type: 'SET_SONGS', songs, playlists }), []),
    setError: useCallback((error) => dispatch({ type: 'SET_ERROR', error }), []),
  };

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      switch (e.code) {
        case 'Space':      e.preventDefault(); actions.togglePlay(); break;
        case 'ArrowRight': if (!e.shiftKey) { e.preventDefault(); actions.nextTrack(); } break;
        case 'ArrowLeft':  if (!e.shiftKey) { e.preventDefault(); actions.prevTrack(); } break;
        case 'KeyM':       actions.toggleMute(); break;
        case 'KeyS':       actions.toggleShuffle(); break;
        case 'KeyL':       if (stateRef.current.currentSong) actions.toggleLike(stateRef.current.currentSong.id); break;
        case 'KeyF':       actions.toggleFullscreen(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line

  return (
    <PlayerContext.Provider value={{ state, actions, ytPlayerRef, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return ctx;
}
