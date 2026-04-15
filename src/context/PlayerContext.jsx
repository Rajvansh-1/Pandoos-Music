import React, {
  createContext, useContext, useReducer, useRef,
  useEffect, useCallback,
} from 'react';

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
  sleepTimer:     null,    // { endsAt: timestamp }
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
      const recent = [song, ...state.recentlyPlayed.filter(s => s.id !== song.id)].slice(0, 20);
      return {
        ...state,
        currentSong:    song,
        queue:          action.queue    ?? state.queue,
        queueIndex:     action.index    ?? 0,
        isPlaying:      true,
        recentlyPlayed: recent,
      };
    }
    case 'PAUSE':        return { ...state, isPlaying: false };
    case 'RESUME':       return { ...state, isPlaying: true };
    case 'PLAYER_READY': return { ...state, playerReady: true };

    case 'SET_PROGRESS':
      return { ...state, progress: action.progress, currentTime: action.currentTime, duration: action.duration };

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

    case 'RESTORE_LIKES':
      return { ...state, likedSongs: action.liked };
    case 'RESTORE_RECENT':
      return { ...state, recentlyPlayed: action.recent };

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

  // Stable refs — never stale inside async callbacks / event handlers
  const stateRef     = useRef(state);
  const ytPlayerRef  = useRef(null);       // YT.Player instance
  const progressRef  = useRef(null);       // setInterval ID

  stateRef.current = state;

  // ── Restore persisted data on mount ─────────────────────
  useEffect(() => {
    try {
      const liked  = JSON.parse(localStorage.getItem('pandoos_liked')  || '[]');
      const recent = JSON.parse(localStorage.getItem('pandoos_recent') || '[]');
      if (liked.length)  dispatch({ type: 'RESTORE_LIKES',  liked:  new Set(liked) });
      if (recent.length) dispatch({ type: 'RESTORE_RECENT', recent: recent.slice(0, 20) });
    } catch { /* ignore corrupt storage */ }
  }, []);

  // ── Persist likes & recent plays ────────────────────────
  useEffect(() => {
    localStorage.setItem('pandoos_liked', JSON.stringify([...state.likedSongs]));
  }, [state.likedSongs]);

  useEffect(() => {
    localStorage.setItem('pandoos_recent', JSON.stringify(state.recentlyPlayed));
  }, [state.recentlyPlayed]);

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

  // ── Internal next-track logic (used by onEnded) ──────────
  const advanceQueue = useCallback(() => {
    const { queue, queueIndex, shuffle, repeat } = stateRef.current;
    if (!queue.length) return;
    if (repeat === 'one') {
      ytPlayerRef.current?.seekTo(0, true);
      ytPlayerRef.current?.playVideo();
      return;
    }
    let next;
    if (shuffle) {
      next = Math.floor(Math.random() * queue.length);
    } else {
      next = queueIndex + 1;
      if (next >= queue.length) {
        if (repeat === 'all') next = 0;
        else { stopPoll(); dispatch({ type: 'PAUSE' }); return; }
      }
    }
    dispatch({ type: 'PLAY', song: queue[next], queue, index: next });
  }, [stopPoll]);

  // ── YouTube player event handlers ────────────────────────
  // Exposed on window so YouTubePlayer.jsx can wire them after SDK load
  useEffect(() => {
    window.__pandoosOnReady = () => {
      dispatch({ type: 'PLAYER_READY' });
      const vol = stateRef.current.volume;
      ytPlayerRef.current?.setVolume(Math.round(vol * 100));
    };
    window.__pandoosOnStateChange = (ytState) => {
      // YT.PlayerState: -1 UNSTARTED, 0 ENDED, 1 PLAYING, 2 PAUSED, 3 BUFFERING, 5 CUED
      if (ytState === 1) {          // PLAYING
        dispatch({ type: 'RESUME' });
        startPoll();
      } else if (ytState === 2) {   // PAUSED
        dispatch({ type: 'PAUSE' });
        stopPoll();
      } else if (ytState === 0) {   // ENDED
        stopPoll();
        advanceQueue();
      }
      // Buffering (3) — keep polling so progress updates during seek
    };
    window.__pandoosOnError = (errorCode) => {
      // Code 2: bad video ID, 5: HTML5 error, 100: not found, 101/150: embedding disallowed
      console.warn('YouTube player error code:', errorCode);
      if ([100, 101, 150].includes(errorCode)) {
        // Skip unplayable video
        advanceQueue();
      }
    };
    return () => {
      delete window.__pandoosOnReady;
      delete window.__pandoosOnStateChange;
      delete window.__pandoosOnError;
      stopPoll();
    };
  }, [startPoll, stopPoll, advanceQueue]);

  // ── Load new video when currentSong changes ──────────────
  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!state.currentSong?.videoId || !p) return;
    try {
      p.loadVideoById(state.currentSong.videoId);
    } catch (err) {
      console.error('loadVideoById failed:', err);
    }
  }, [state.currentSong?.id]); // eslint-disable-line

  // ── Volume / mute sync ───────────────────────────────────
  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!p?.setVolume) return;
    if (state.isMuted) {
      p.mute();
    } else {
      p.unMute();
      p.setVolume(Math.round(state.volume * 100));
    }
  }, [state.volume, state.isMuted]);

  // ── MediaSession (lock screen controls) ─────────────────
  useEffect(() => {
    if (!state.currentSong || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title:   state.currentSong.title,
        artist:  state.currentSong.artist,
        artwork: state.currentSong.coverUrl
          ? [{ src: state.currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
          : [],
      });
      navigator.mediaSession.setActionHandler('play',          () => actions.resume());
      navigator.mediaSession.setActionHandler('pause',         () => actions.pause());
      navigator.mediaSession.setActionHandler('nexttrack',     () => actions.nextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => actions.prevTrack());
    } catch { /* MediaSession not fully supported */ }
  }, [state.currentSong?.id]); // eslint-disable-line

  // ── Sleep timer ──────────────────────────────────────────
  useEffect(() => {
    if (!state.sleepTimer) return;
    const ms = state.sleepTimer.endsAt - Date.now();
    if (ms <= 0) {
      ytPlayerRef.current?.pauseVideo();
      dispatch({ type: 'SET_SLEEP_TIMER', timer: null });
      return;
    }
    const id = setTimeout(() => {
      ytPlayerRef.current?.pauseVideo();
      dispatch({ type: 'SET_SLEEP_TIMER', timer: null });
    }, ms);
    return () => clearTimeout(id);
  }, [state.sleepTimer]);

  // ── Actions ───────────────────────────────────────────────
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
      if (stateRef.current.isPlaying) {
        ytPlayerRef.current?.pauseVideo(); dispatch({ type: 'PAUSE' });
      } else {
        ytPlayerRef.current?.playVideo();  dispatch({ type: 'RESUME' });
      }
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

    setSongs: useCallback((songs, playlists) => {
      dispatch({ type: 'SET_SONGS', songs, playlists });
    }, []),
    setError: useCallback((error) => dispatch({ type: 'SET_ERROR', error }), []),
  };

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      switch (e.code) {
        case 'Space':      e.preventDefault(); actions.togglePlay();     break;
        case 'ArrowRight': if (!e.shiftKey) { e.preventDefault(); actions.nextTrack(); } break;
        case 'ArrowLeft':  if (!e.shiftKey) { e.preventDefault(); actions.prevTrack(); } break;
        case 'KeyM':       actions.toggleMute();    break;
        case 'KeyS':       actions.toggleShuffle(); break;
        case 'KeyL':
          if (stateRef.current.currentSong) actions.toggleLike(stateRef.current.currentSong.id);
          break;
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
