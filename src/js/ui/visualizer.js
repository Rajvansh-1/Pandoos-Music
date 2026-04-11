/**
 * Pandoos Library — Visualizer (bamboo-green frequency bars)
 */

import { getAnalyserData } from '../player.js';
import { getState } from '../store.js';

let _canvas = null;
let _ctx    = null;

export function initVisualizer() {
  _canvas = document.getElementById('visualizer-canvas');
  if (!_canvas) return;
  _ctx = _canvas.getContext('2d');

  const resize = () => {
    _canvas.width  = _canvas.offsetWidth  || 1;
    _canvas.height = _canvas.offsetHeight || 1;
  };
  resize();
  new ResizeObserver(resize).observe(_canvas.parentElement);

  _loop();
}

function _loop() {
  requestAnimationFrame(_loop);
  if (!_canvas || !_ctx) return;

  const W = _canvas.width;
  const H = _canvas.height;
  _ctx.clearRect(0, 0, W, H);

  const { isPlaying } = getState();
  const data = getAnalyserData();
  if (!data || !isPlaying) return;

  const count    = Math.min(80, data.length);
  const barW     = W / count - 0.8;
  const maxH     = H * 0.85;

  const grad = _ctx.createLinearGradient(0, H, 0, 0);
  grad.addColorStop(0,   'rgba(52,211,153,0.9)');
  grad.addColorStop(0.6, 'rgba(110,231,183,0.6)');
  grad.addColorStop(1,   'rgba(167,243,208,0.3)');
  _ctx.fillStyle = grad;

  for (let i = 0; i < count; i++) {
    const val  = data[i] / 255;
    const barH = Math.max(val * maxH, 2);
    const x    = i * (barW + 0.8);
    const y    = H - barH;
    const r    = Math.min(barW / 2, 2);

    _ctx.beginPath();
    _ctx.moveTo(x + r, y);
    _ctx.lineTo(x + barW - r, y);
    _ctx.arcTo(x + barW, y, x + barW, y + r, r);
    _ctx.lineTo(x + barW, H);
    _ctx.lineTo(x, H);
    _ctx.lineTo(x, y + r);
    _ctx.arcTo(x, y, x + r, y, r);
    _ctx.closePath();
    _ctx.fill();
  }
}
