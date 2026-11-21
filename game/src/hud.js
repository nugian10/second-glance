// Second Glance — the DOM heads-up display: found counter, timer bar, score,
// hint count and the toast line. Pure presentation: game.js owns the state
// and calls these; nothing here reaches back into the game.

const el = (id) => document.getElementById(id);

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function setLevelTitle(text) {
  el('level-title').textContent = text;
}

export function setCounter(found, total) {
  const toGo = total - found;
  el('counter').innerHTML =
    `<span class="found">${found} of ${total} found</span> · <span class="to-go">${toGo} to go</span>`;
}

export function setCounterIdle() {
  el('counter').textContent = 'Find the differences';
}

export function setTimer(fraction, seconds) {
  const wrap = el('timer-wrap');
  el('timer-bar').style.width = `${Math.max(0, Math.min(1, fraction)) * 100}%`;
  el('timer-text').textContent = formatClock(seconds);
  wrap.classList.toggle('low', fraction <= 0.25);
}

export function setTimerIdle() {
  el('timer-bar').style.width = '100%';
  el('timer-text').textContent = '0:00';
  el('timer-wrap').classList.remove('low');
}

export function setScore(score) {
  el('score').textContent = `Score ${score}`;
}

export function setHints(hintsLeft) {
  const btn = el('btn-hint');
  btn.textContent = `Hint · ${hintsLeft}`;
  btn.disabled = hintsLeft <= 0;
}

let toastTimer = 0;
export function showToast(text, bad = false) {
  const toast = el('toast');
  toast.textContent = text;
  toast.classList.toggle('bad', bad);
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1600);
}

export function hideToast() {
  window.clearTimeout(toastTimer);
  el('toast').classList.remove('show');
}

const OVERLAY_IDS = ['overlay-select', 'overlay-pause', 'overlay-complete', 'overlay-over', 'overlay-win'];

export function showOverlay(idOrNull) {
  for (const id of OVERLAY_IDS) el(id).classList.toggle('hidden', id !== idOrNull);
}

export function starString(stars) {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars);
}

export function fillComplete({ title, stars, stats }) {
  el('complete-title').textContent = title;
  el('complete-stars').innerHTML =
    starString(stars).split('').map((s) => (s === '★' ? '★' : '<span class="dim">★</span>')).join('');
  el('complete-stats').textContent = stats;
}

export function fillGameOver(stats) {
  el('over-stats').textContent = stats;
}

export function fillWin(stats) {
  el('win-stats').textContent = stats;
}
