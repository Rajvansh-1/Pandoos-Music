/**
 * Pandoos Music — App Configuration
 *
 * HOW TO GET YOUR FREE YOUTUBE API KEY:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a new project (or select existing)
 * 3. Go to "APIs & Services" → "Library"
 * 4. Search "YouTube Data API v3" → Enable it
 * 5. Go to "APIs & Services" → "Credentials"
 * 6. Create API Key → Copy it
 * 7. Create a .env file in pandoos-react/ with:
 *    VITE_YOUTUBE_API_KEY=your_key_here
 *
 * Free quota: 10,000 units/day (~100 searches/day)
 */

export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

export const APP_CONFIG = {
  appName: 'Pandoos Music',
  appTagline: 'Your panda-powered music universe 🐼',
  youtubeApiKey: YOUTUBE_API_KEY,
  hasYouTubeKey: Boolean(YOUTUBE_API_KEY),
  defaultVolume: 0.8,
  crossfadeDuration: 3,    // seconds
  recentLimit: 20,
  searchDebounce: 400,     // ms
};

// Trending search terms shown on Home when no API key
export const FEATURED_SEARCHES = [
  { label: '🔥 Top Hits 2024',    query: 'top hits 2024' },
  { label: '🎵 Bollywood',        query: 'bollywood hits 2024' },
  { label: '💃 Punjabi',          query: 'punjabi songs 2024' },
  { label: '🌙 Lo-Fi Chill',      query: 'lofi chill music' },
  { label: '⚡ Party Mix',        query: 'party mix 2024' },
  { label: '❤️ Romantic',         query: 'romantic songs' },
  { label: '🎸 Rock Classics',    query: 'rock classics' },
  { label: '🧘 Meditation',       query: 'meditation music' },
];

export const GENRE_CARDS = [
  { label: 'Bollywood',    query: 'bollywood songs 2024',    color: '#e11d48', emoji: '💃' },
  { label: 'Punjabi',      query: 'punjabi hits 2024',       color: '#7c3aed', emoji: '🎤' },
  { label: 'Lo-Fi',        query: 'lofi chill beats',        color: '#0891b2', emoji: '🌙' },
  { label: 'Hip-Hop',      query: 'hindi hip hop rap 2024',  color: '#d97706', emoji: '🎧' },
  { label: 'Romance',      query: 'romantic love songs',     color: '#db2777', emoji: '❤️' },
  { label: 'Electronic',   query: 'electronic edm 2024',     color: '#059669', emoji: '⚡' },
  { label: 'Classic Rock', query: 'classic rock hits',       color: '#dc2626', emoji: '🎸' },
  { label: 'Devotional',   query: 'bhajan devotional songs', color: '#ca8a04', emoji: '🙏' },
  { label: 'Indie',        query: 'indie pop 2024',          color: '#2563eb', emoji: '🎵' },
  { label: 'Workout',      query: 'workout gym music 2024',  color: '#16a34a', emoji: '💪' },
];
