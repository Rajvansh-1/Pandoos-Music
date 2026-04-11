/**
 * Pandoos Library — Hash Router
 * Lightweight client-side router using window.location.hash.
 * Supports: #home, #search, #library, #playlist:pl_id
 */

const _handlers = [];

/**
 * Parse current hash into a route object
 * @returns {{ view: string, params: Record<string,string> }}
 */
function parseHash() {
  const hash = window.location.hash.slice(1) || 'home';
  const colonIdx = hash.indexOf(':');
  if (colonIdx !== -1) {
    return {
      view:   hash.slice(0, colonIdx),
      params: { id: hash.slice(colonIdx + 1) },
    };
  }
  return { view: hash, params: {} };
}

/**
 * Navigate to a route
 * @param {string} view  - e.g. 'home', 'search', 'library', 'playlist'
 * @param {Record<string,string>} [params]
 */
export function navigate(view, params = {}) {
  if (params.id) {
    window.location.hash = `${view}:${params.id}`;
  } else {
    window.location.hash = view;
  }
}

/**
 * Register a route handler
 * @param {(route: { view: string, params: Record<string,string> }) => void} handler
 * @returns {() => void} unregister function
 */
export function onRoute(handler) {
  _handlers.push(handler);
  return () => {
    const idx = _handlers.indexOf(handler);
    if (idx !== -1) _handlers.splice(idx, 1);
  };
}

/**
 * Initialize router — call once on startup
 */
export function initRouter() {
  const dispatch = () => {
    const route = parseHash();
    _handlers.forEach(h => {
      try { h(route); } catch (e) { console.error('Router handler error:', e); }
    });
  };

  window.addEventListener('hashchange', dispatch);
  // Dispatch immediately for initial load
  dispatch();
}

/**
 * Get current route without listening
 */
export function currentRoute() {
  return parseHash();
}
