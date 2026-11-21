// Second Glance — the game itself: state machine, timer, scoring, level flow
// and the canvas renderer. The two scene panels are pre-rendered once per
// level into offscreen bitmaps (left = base scene, right = base + the level's
// differences); each animation frame then just blits the bitmaps and draws
// the live layer on top — found rings, find bursts, hint pulses, wrong-click
// crosses and the screen shake — so the pictures stay perfectly still while
// the feedback moves.

import { SCENES, SCENE_W, SCENE_H } from './scenes.js';
import { LEVELS, diffsBySpecificity } from './differences.js';
import * as audio from './audio.js';
import * as hud from './hud.js';

const FIND_POINTS = 100;
const WRONG_PENALTY_SECONDS = 5;
const WRONG_PENALTY_POINTS = 15;
const HINT_PENALTY_POINTS = 25;
const HINTS_PER_LEVEL = 3;
const STAGE_NOW = 1250; // frozen clock (ms) used by the screenshot staging mode

const cvLeft = document.getElementById('cv-left');
const cvRight = document.getElementById('cv-right');
const ctxLeft = cvLeft.getContext('2d');
const ctxRight = cvRight.getContext('2d');

// --- Best results, kept in localStorage when the browser allows it. --------
const best = loadBest();
function loadBest() {
  try {
    return JSON.parse(localStorage.getItem('second-glance-best') || '{}');
  } catch {
    return {};
  }
}
function saveBest() {
  try {
    localStorage.setItem('second-glance-best', JSON.stringify(best));
  } catch {
    /* private mode etc.: bests simply live for the session */
  }
}
export function bestFor(levelIndex) {
  return best[levelIndex] || null;
}

// --- State ------------------------------------------------------------------
export const game = {
  state: 'select', // select | playing | paused | complete | over | win
  levelIndex: 0,
  level: LEVELS[0],
  found: new Set(),
  wrongCount: 0,
  hintsLeft: HINTS_PER_LEVEL,
  hintsUsed: 0,
  score: 0,
  levelScore: 0,
  timeLeft: 0,
  staging: false,
  testMode: false,
};

let bitmapLeft = null;
let bitmapRight = null;
let effects = []; // {type:'find', diff, t0} | {type:'cross', x, y, side, t0}
let hintPulse = null; // {diff, t0}
let shakeUntil = 0;
let lastTickSecond = -1;
let lastFrameAt = 0;

function now() {
  return game.staging ? STAGE_NOW : performance.now();
}

function renderBitmaps() {
  const scene = SCENES.find((s) => s.id === game.level.scene);
  const mods = new Set(game.level.diffs.map((d) => d.id));
  const make = (modSet) => {
    const c = document.createElement('canvas');
    c.width = SCENE_W;
    c.height = SCENE_H;
    scene.paint(c.getContext('2d'), modSet);
    return c;
  };
  bitmapLeft = make(new Set());
  bitmapRight = make(mods);
}

// Prepare a level's pictures and reset its counters without starting play
// (used for the backdrop behind the scene picker).
export function prepareLevel(levelIndex) {
  game.levelIndex = levelIndex;
  game.level = LEVELS[levelIndex];
  game.found = new Set();
  game.wrongCount = 0;
  game.hintsUsed = 0;
  game.hintsLeft = HINTS_PER_LEVEL;
  game.levelScore = 0;
  game.timeLeft = game.level.time;
  effects = [];
  hintPulse = null;
  lastTickSecond = -1;
  renderBitmaps();
}

export function startLevel(levelIndex) {
  prepareLevel(levelIndex);
  game.state = 'playing';
  hud.showOverlay(null);
  hud.setLevelTitle(`Scene ${levelIndex + 1} of ${LEVELS.length} · ${game.level.title}`);
  hud.setCounter(0, game.level.diffs.length);
  hud.setTimer(1, game.timeLeft);
  hud.setScore(game.score);
  hud.setHints(game.hintsLeft);
  hud.showToast(`Find ${game.level.diffs.length} differences!`);
}

export function backToSelect() {
  game.state = 'select';
  hud.showOverlay('overlay-select');
  hud.setLevelTitle('Pick a scene to begin');
  hud.setCounterIdle();
  hud.setTimerIdle();
  hud.setHints(HINTS_PER_LEVEL);
  document.getElementById('btn-hint').disabled = true;
}

// --- Clicking ---------------------------------------------------------------
function hitTest(x, y) {
  for (const diff of diffsBySpecificity(game.level)) {
    for (const area of diff.areas) {
      const dx = x - area.x;
      const dy = y - area.y;
      if (dx * dx + dy * dy <= area.r * area.r) return diff;
    }
  }
  return null;
}

// One click in scene coordinates, from either panel. Returns what happened:
// 'found' | 'already' | 'wrong' | 'ignored'.
export function clickAt(x, y, side = 'left') {
  if (game.state !== 'playing') return 'ignored';
  const diff = hitTest(x, y);
  if (diff && game.found.has(diff.id)) return 'already';
  if (diff) {
    game.found.add(diff.id);
    game.levelScore += FIND_POINTS;
    game.score += FIND_POINTS;
    effects.push({ type: 'find', diff, t0: now() });
    audio.playFind();
    hud.setCounter(game.found.size, game.level.diffs.length);
    hud.setScore(game.score);
    hud.showToast(diff.label);
    if (game.found.size === game.level.diffs.length) completeLevel();
    return 'found';
  }
  // A genuine miss: cross marker, shake, time and score penalties.
  game.wrongCount += 1;
  game.timeLeft = Math.max(0, game.timeLeft - WRONG_PENALTY_SECONDS);
  game.levelScore = Math.max(0, game.levelScore - WRONG_PENALTY_POINTS);
  game.score = Math.max(0, game.score - WRONG_PENALTY_POINTS);
  effects.push({ type: 'cross', x, y, side, t0: now() });
  shakeUntil = now() + 280;
  audio.playWrong();
  hud.setScore(game.score);
  hud.showToast(`Not there — ${WRONG_PENALTY_SECONDS} seconds lost`, true);
  if (game.timeLeft <= 0) gameOver();
  return 'wrong';
}

export function useHint() {
  if (game.state !== 'playing' || game.hintsLeft <= 0) return null;
  const remaining = game.level.diffs.filter((d) => !game.found.has(d.id));
  if (!remaining.length) return null;
  const diff = remaining[0];
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.levelScore = Math.max(0, game.levelScore - HINT_PENALTY_POINTS);
  game.score = Math.max(0, game.score - HINT_PENALTY_POINTS);
  hintPulse = { diff, t0: now() };
  audio.playHint();
  hud.setHints(game.hintsLeft);
  hud.setScore(game.score);
  return diff;
}

export function pauseGame() {
  if (game.state !== 'playing') return;
  game.state = 'paused';
  hud.showOverlay('overlay-pause');
}

export function resumeGame() {
  if (game.state !== 'paused') return;
  game.state = 'playing';
  hud.showOverlay(null);
}

function starsForLevel() {
  if (game.wrongCount === 0 && game.hintsUsed === 0) return 3;
  if (game.wrongCount <= 3 && game.hintsUsed <= 2) return 2;
  return 1;
}

function completeLevel() {
  const timeBonus = Math.ceil(game.timeLeft);
  game.levelScore += timeBonus;
  game.score += timeBonus;
  game.state = 'complete';
  const stars = starsForLevel();
  const prev = bestFor(game.levelIndex);
  if (!prev || game.levelScore > prev.score) {
    best[game.levelIndex] = { stars, score: game.levelScore };
    saveBest();
  }
  const used = game.level.time - Math.ceil(game.timeLeft);
  hud.fillComplete({
    title: `${game.level.title} — complete!`,
    stars,
    stats: `All ${game.level.diffs.length} differences found in ${used} seconds. ` +
      `Scene score ${game.levelScore} (includes a ${timeBonus}-point time bonus). Total score ${game.score}.`,
  });
  hud.setScore(game.score);
  document.getElementById('btn-next').textContent =
    game.levelIndex === LEVELS.length - 1 ? 'Finish' : 'Next scene';
  hud.showOverlay('overlay-complete');
  audio.playComplete();
}

function gameOver() {
  game.state = 'over';
  hud.fillGameOver(
    `You found ${game.found.size} of ${game.level.diffs.length} differences in ${game.level.title}. ` +
    'The rest are still hiding — try the scene again.',
  );
  hud.showOverlay('overlay-over');
  audio.playGameOver();
}

export function nextLevel() {
  if (game.levelIndex >= LEVELS.length - 1) {
    game.state = 'win';
    hud.fillWin(`You finished all six scenes with a total score of ${game.score}. Every picture pair is solved.`);
    hud.showOverlay('overlay-win');
    audio.playWin();
    return;
  }
  startLevel(game.levelIndex + 1);
}

// --- Rendering ---------------------------------------------------------------
function drawRing(ctx, x, y, r, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(10, r * scale), 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, Math.max(10, r * scale), 0, Math.PI * 2);
  ctx.strokeStyle = '#ffcf3f';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.restore();
}

function drawPanel(ctx, bitmap, side, t) {
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  ctx.save();
  if (t < shakeUntil) {
    const k = (shakeUntil - t) / 280;
    ctx.translate(Math.sin(t * 0.09) * 5 * k, Math.cos(t * 0.11) * 3.5 * k);
  }
  if (bitmap) ctx.drawImage(bitmap, 0, 0);
  // Settled rings on every found difference.
  for (const diff of game.level.diffs) {
    if (!game.found.has(diff.id)) continue;
    for (const area of diff.areas) drawRing(ctx, area.x, area.y, area.r + 6, 1, 0.95);
  }
  // Expanding burst on the most recent find.
  for (const fx of effects) {
    if (fx.type !== 'find') continue;
    const age = (t - fx.t0) / 480;
    if (age < 0 || age > 1) continue;
    for (const area of fx.diff.areas) {
      drawRing(ctx, area.x, area.y, area.r + 6, 0.55 + age * 0.75, 1 - age);
    }
  }
  // Hint pulse: three breathing rings around one unfound difference.
  if (hintPulse && (game.staging || t - hintPulse.t0 < 2400)) {
    const area = hintPulse.diff.areas[0];
    const phase = ((t - hintPulse.t0) % 800) / 800;
    for (let i = 0; i < 3; i++) {
      const p = (phase + i / 3) % 1;
      drawRing(ctx, area.x, area.y, area.r + 4, 0.7 + p * 0.6, 0.85 * (1 - p));
    }
  }
  // Wrong-click cross, only on the panel that was clicked.
  for (const fx of effects) {
    if (fx.type !== 'cross' || fx.side !== side) continue;
    const age = (t - fx.t0) / 420;
    if (age < 0 || age > 1) continue;
    ctx.save();
    ctx.globalAlpha = 1 - age;
    ctx.strokeStyle = '#ff5a4d';
    ctx.lineWidth = 4.4;
    ctx.lineCap = 'round';
    const s = 11 * (0.7 + age * 0.5);
    ctx.beginPath();
    ctx.moveTo(fx.x - s, fx.y - s);
    ctx.lineTo(fx.x + s, fx.y + s);
    ctx.moveTo(fx.x + s, fx.y - s);
    ctx.lineTo(fx.x - s, fx.y + s);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function frame(timestamp) {
  const t = now();
  if (lastFrameAt === 0) lastFrameAt = timestamp;
  const dt = Math.min(0.1, (timestamp - lastFrameAt) / 1000);
  lastFrameAt = timestamp;

  if (game.state === 'playing' && !game.staging && !game.testMode) {
    game.timeLeft -= dt;
    if (game.timeLeft <= 10.05) {
      const whole = Math.ceil(game.timeLeft);
      if (whole !== lastTickSecond && whole > 0) {
        lastTickSecond = whole;
        audio.playTick();
      }
    }
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      gameOver();
    }
    hud.setTimer(game.timeLeft / game.level.time, game.timeLeft);
  }

  effects = effects.filter((fx) => t - fx.t0 < 700);
  if (hintPulse && !game.staging && t - hintPulse.t0 > 2400) hintPulse = null;
  drawPanel(ctxLeft, bitmapLeft, 'left', t);
  drawPanel(ctxRight, bitmapRight, 'right', t);
  requestAnimationFrame(frame);
}

export function startRenderLoop() {
  requestAnimationFrame(frame);
}

// Draw one scene, unmodified, into an arbitrary canvas (level-select cards).
export function renderThumbnail(canvas, levelIndex) {
  const level = LEVELS[levelIndex];
  const scene = SCENES.find((s) => s.id === level.scene);
  const full = document.createElement('canvas');
  full.width = SCENE_W;
  full.height = SCENE_H;
  scene.paint(full.getContext('2d'), new Set());
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(full, 0, 0, canvas.width, canvas.height);
}

// --- Screenshot staging -------------------------------------------------------
// Deterministic set pieces for the maker's screenshots: fixed found sets, a
// fixed timer position and a frozen animation clock, so a headless render is
// the same every time.
export function stageShot(n) {
  game.staging = true;
  if (n === 1) {
    startLevel(3); // Underwater Reef, the most colourful scene
    for (const id of ['turtle-color', 'coral-color', 'fish-fewer']) game.found.add(id);
    const last = game.level.diffs.find((d) => d.id === 'fish-fewer');
    effects.push({ type: 'find', diff: last, t0: STAGE_NOW - 190 });
    game.timeLeft = Math.round(game.level.time * 0.55);
    hud.setCounter(game.found.size, game.level.diffs.length);
    hud.setTimer(game.timeLeft / game.level.time, game.timeLeft);
    hud.setScore(300);
    hud.hideToast();
  } else if (n === 2) {
    startLevel(2); // Fruit Market
    for (const id of ['awning-color', 'grapes-bigger']) game.found.add(id);
    game.timeLeft = Math.round(game.level.time * 0.62);
    hud.setCounter(game.found.size, game.level.diffs.length);
    hud.setTimer(game.timeLeft / game.level.time, game.timeLeft);
    hud.setScore(200);
    const cat = game.level.diffs.find((d) => d.id === 'cat-gone');
    hintPulse = { diff: cat, t0: STAGE_NOW - 300 };
    hud.setHints(2);
    hud.hideToast();
  } else if (n === 3) {
    backToSelect();
  } else if (n === 4) {
    startLevel(4); // Mountain Campsite, fully solved behind the celebration
    for (const d of game.level.diffs) game.found.add(d.id);
    game.score = 1240;
    game.levelScore = 340;
    hud.setCounter(game.found.size, game.level.diffs.length);
    hud.setScore(game.score);
    game.state = 'complete';
    hud.fillComplete({
      title: 'Mountain Campsite — complete!',
      stars: 3,
      stats: 'All 9 differences found in 74 seconds. Scene score 340 (includes a 91-point time bonus). Total score 1240.',
    });
    document.getElementById('btn-next').textContent = 'Next scene';
    hud.showOverlay('overlay-complete');
  }
}
