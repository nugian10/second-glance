// Second Glance — boot and wiring only: build the scene-picker cards, connect
// the buttons, start the render loop, and honour the URL's staging/test
// switches (?shot=1..4 for the maker's screenshots, ?test=1 for the built-in
// self-test, ?level=N to jump straight into a scene).

import { LEVELS } from './differences.js';
import {
  game, prepareLevel, startLevel, backToSelect, pauseGame, resumeGame,
  nextLevel, useHint, renderThumbnail, startRenderLoop, stageShot, bestFor,
} from './game.js';
import { wireInput } from './input.js';
import * as hud from './hud.js';

const $ = (id) => document.getElementById(id);

function buildLevelCards() {
  const grid = $('level-grid');
  LEVELS.forEach((level, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'level-card';
    const thumb = document.createElement('canvas');
    thumb.width = 256;
    thumb.height = 192;
    renderThumbnail(thumb, i);
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML = `<span class="card-name">${i + 1}. ${level.title}</span>` +
      `<span class="card-diffs">${level.diffs.length} differences</span>`;
    const bestLine = document.createElement('div');
    bestLine.className = 'card-best';
    const updateBest = () => {
      const b = bestFor(i);
      bestLine.innerHTML = b
        ? `Best: <span class="best-stars">${hud.starString(b.stars)}</span> · ${b.score} pts`
        : 'Not solved yet';
    };
    updateBest();
    card.append(thumb, meta, bestLine);
    card.addEventListener('click', () => {
      startLevel(i);
    });
    grid.appendChild(card);
    card._refreshBest = updateBest;
  });
}

function refreshCards() {
  document.querySelectorAll('.level-card').forEach((card) => card._refreshBest?.());
}

function wireButtons() {
  $('btn-hint').addEventListener('click', () => {
    if (game.state === 'playing') useHint();
  });
  $('btn-pause').addEventListener('click', () => {
    if (game.state === 'playing') pauseGame();
  });
  $('btn-menu').addEventListener('click', () => {
    refreshCards();
    backToSelect();
  });
  $('btn-resume').addEventListener('click', resumeGame);
  $('btn-quit-pause').addEventListener('click', () => {
    refreshCards();
    backToSelect();
  });
  $('btn-next').addEventListener('click', nextLevel);
  $('btn-replay').addEventListener('click', () => startLevel(game.levelIndex));
  $('btn-quit-complete').addEventListener('click', () => {
    refreshCards();
    backToSelect();
  });
  $('btn-retry').addEventListener('click', () => startLevel(game.levelIndex));
  $('btn-quit-over').addEventListener('click', () => {
    refreshCards();
    backToSelect();
  });
  $('btn-again').addEventListener('click', () => {
    game.score = 0;
    refreshCards();
    backToSelect();
  });
}

function boot() {
  buildLevelCards();
  wireButtons();
  wireInput();
  prepareLevel(0); // a harbour backdrop behind the scene picker
  backToSelect();
  startRenderLoop();

  const params = new URLSearchParams(location.search);
  if (params.has('shot')) {
    stageShot(Number(params.get('shot')) || 1);
  } else if (params.has('level')) {
    const n = Math.min(LEVELS.length - 1, Math.max(0, Number(params.get('level')) || 0));
    startLevel(n);
  } else if (params.has('test')) {
    import('./test.js').then((m) => m.runTests());
  }
}

boot();
