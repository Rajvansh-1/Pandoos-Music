/**
 * Pandoos Library — Panda SVG Assets
 * All panda-themed SVG icons and illustrations used across the UI
 */

export const PANDA_FACE_SVG = `
<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <!-- Ears -->
  <circle cx="8"  cy="12" r="8"  fill="#1c1e1b"/>
  <circle cx="40" cy="12" r="8"  fill="#1c1e1b"/>
  <circle cx="8"  cy="12" r="4.5" fill="#34d399" opacity="0.3"/>
  <circle cx="40" cy="12" r="4.5" fill="#34d399" opacity="0.3"/>
  <!-- Face -->
  <circle cx="24" cy="28" r="18" fill="#f0f2ec"/>
  <!-- Eye patches -->
  <ellipse cx="16" cy="24" rx="6.5" ry="7" fill="#1c1e1b"/>
  <ellipse cx="32" cy="24" rx="6.5" ry="7" fill="#1c1e1b"/>
  <!-- Eyes (shiny) -->
  <circle cx="16" cy="24" r="3.5" fill="#f0f2ec"/>
  <circle cx="32" cy="24" r="3.5" fill="#f0f2ec"/>
  <circle cx="16.8" cy="23.2" r="1.8" fill="#141614" class="panda-eye-l"/>
  <circle cx="32.8" cy="23.2" r="1.8" fill="#141614" class="panda-eye-r"/>
  <!-- Eye shine -->
  <circle cx="17.5" cy="22.5" r="0.7" fill="white" opacity="0.9"/>
  <circle cx="33.5" cy="22.5" r="0.7" fill="white" opacity="0.9"/>
  <!-- Nose -->
  <ellipse cx="24" cy="30.5" rx="3" ry="2" fill="#1c1e1b"/>
  <!-- Mouth -->
  <path d="M21 33.5 Q24 36.5 27 33.5" stroke="#1c1e1b" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  <!-- Blush marks -->
  <ellipse cx="11" cy="31" rx="3.5" ry="2" fill="#f9a8d4" opacity="0.5"/>
  <ellipse cx="37" cy="31" rx="3.5" ry="2" fill="#f9a8d4" opacity="0.5"/>
</svg>`;

export const PANDA_FACE_MINI = `
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
  <circle cx="6"  cy="8"  r="5.5" fill="#1c1e1b"/>
  <circle cx="26" cy="8"  r="5.5" fill="#1c1e1b"/>
  <circle cx="16" cy="19" r="12"  fill="#f0f2ec"/>
  <ellipse cx="11" cy="17" rx="4.2" ry="4.8" fill="#1c1e1b"/>
  <ellipse cx="21" cy="17" rx="4.2" ry="4.8" fill="#1c1e1b"/>
  <circle cx="11" cy="17" r="2.2" fill="#f0f2ec"/>
  <circle cx="21" cy="17" r="2.2" fill="#f0f2ec"/>
  <circle cx="11.6" cy="16.5" r="1.1" fill="#141614"/>
  <circle cx="21.6" cy="16.5" r="1.1" fill="#141614"/>
  <ellipse cx="16" cy="21" rx="2" ry="1.3" fill="#1c1e1b"/>
</svg>`;

// Navigation Icons
export const ICON_HOME = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
export const ICON_SEARCH = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
export const ICON_LIBRARY = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`;
export const ICON_BACK  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
export const ICON_FWD   = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

// Player Icons
export const ICON_PLAY    = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M5 3l14 9-14 9V3z"/></svg>`;
export const ICON_PAUSE   = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
export const ICON_PREV    = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 20L9 12l10-8v16z"/><rect x="5" y="5" width="2.5" height="14" rx="1"/></svg>`;
export const ICON_NEXT    = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M5 4l10 8-10 8V4z"/><rect x="16.5" y="5" width="2.5" height="14" rx="1"/></svg>`;
export const ICON_SHUFFLE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`;
export const ICON_REPEAT  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`;
export const ICON_VOL_ON  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
export const ICON_VOL_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

// Action Icons
export const ICON_HEART     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
export const ICON_HEART_FILL= `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" width="15" height="15"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
export const ICON_PLAY_SM   = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M5 3l14 9-14 9V3z"/></svg>`;

// Bamboo leaf decoration
export const BAMBOO_LEAF = `
<svg viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="12" height="24" opacity="0.5">
  <path d="M12 0 L12 48" stroke="#34d399" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 16 Q4 10 2 4" stroke="#34d399" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M12 32 Q20 26 22 20" stroke="#34d399" stroke-width="1.5" stroke-linecap="round" fill="none"/>
</svg>`;
