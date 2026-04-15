import { useEffect, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';

/**
 * Hidden YouTube IFrame Player
 * - Renders a 1×1 invisible div
 * - Loads YouTube IFrame API once
 * - Exposes YT.Player instance via ytPlayerRef
 * - All playback controlled from PlayerContext
 */
export default function YouTubePlayer() {
  const { ytPlayerRef } = usePlayer();
  const divRef       = useRef(null);
  const initialized  = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const createPlayer = () => {
      if (!divRef.current || ytPlayerRef.current) return;
      ytPlayerRef.current = new window.YT.Player(divRef.current, {
        height:  '1',
        width:   '1',
        videoId: '',
        playerVars: {
          autoplay:       1,
          controls:       0,
          disablekb:      1,
          enablejsapi:    1,
          fs:             0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline:    1,
          rel:            0,
        },
        events: {
          onReady:       ()  => window.__pandoosOnReady?.(),
          onStateChange: (e) => window.__pandoosOnStateChange?.(e.data),
          onError:       (e) => window.__pandoosOnError?.(e.data),
        },
      });
    };

    if (window.YT?.Player) {
      // SDK already loaded (HMR / fast refresh)
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src   = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
    }

    return () => {
      // Don't destroy player on HMR — just let the ref persist
    };
  }, []); // eslint-disable-line

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'fixed',
        width:         '1px',
        height:        '1px',
        bottom:        0,
        left:          0,
        overflow:      'hidden',
        opacity:       0,
        pointerEvents: 'none',
        zIndex:        -9999,
      }}
    >
      <div ref={divRef} />
    </div>
  );
}
