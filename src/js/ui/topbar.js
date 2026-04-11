/**
 * Pandoos Library — Topbar with Search, Auth, Hamburger
 */

import { getState, setState, subscribe } from '../store.js';
import { navigate } from '../router.js';
import { debounce } from '../utils.js';
import { ICON_BACK, ICON_FWD } from '../assets.js';

export function initTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  topbar.innerHTML = _render();
  _bind(topbar);
  subscribe('change:searchQuery', () => _syncInput(topbar));
}

function _render() {
  return `
    <button class="hamburger" id="hamburger-btn" aria-label="Open menu" title="Menu">
      <span></span><span></span><span></span>
    </button>

    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <button class="btn-icon" id="nav-back"  aria-label="Back"    title="Back">    ${ICON_BACK}</button>
      <button class="btn-icon" id="nav-fwd"   aria-label="Forward" title="Forward"> ${ICON_FWD}</button>
    </div>

    <div class="search-wrap" id="topbar-search-wrap">
      <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input
        type="search"
        id="search-input"
        class="search-input"
        placeholder="Search songs, artists…"
        autocomplete="off"
        spellcheck="false"
        aria-label="Search music"
      />
    </div>

    <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:auto">
      <div class="api-badge" title="Powered by Jamendo API">Jamendo</div>
      <button class="btn btn-ghost btn-sm" id="signup-btn">Sign up</button>
      <button class="btn btn-white  btn-sm" id="login-btn">Log in</button>
    </div>
  `;
}

function _bind(topbar) {
  topbar.querySelector('#hamburger-btn')?.addEventListener('click', _toggleSidebar);
  document.getElementById('sidebar-overlay')?.addEventListener('click', _closeSidebar);

  topbar.querySelector('#nav-back')?.addEventListener('click', () => history.go(-1));
  topbar.querySelector('#nav-fwd')?.addEventListener('click',  () => history.go(+1));

  const input = topbar.querySelector('#search-input');
  if (input) {
    const doSearch = debounce(q => {
      setState({ searchQuery: q });
      if (q.trim()) navigate('search');
    }, 250);

    input.addEventListener('input',   e => doSearch(e.target.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = '';
        setState({ searchQuery: '' });
        navigate('home');
      }
    });
    input.addEventListener('focus', () => {
      if (!input.value.trim()) navigate('search');
    });
  }

  topbar.querySelector('#signup-btn')?.addEventListener('click', () => showToast('🐼 Sign up coming soon!'));
  topbar.querySelector('#login-btn')?.addEventListener('click',  () => showToast('🔐 Login coming soon!'));
}

function _toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebar-overlay')?.classList.toggle('visible');
}

function _closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('visible');
}

function _syncInput(topbar) {
  const { searchQuery } = getState();
  const input = topbar.querySelector('#search-input');
  if (input && document.activeElement !== input) input.value = searchQuery;
}

/** Global toast notification */
export function showToast(message, type = '', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' ' + type : ''}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}
