// Second Glance — pointer and keyboard input. Converts a click on either
// canvas into scene coordinates (the canvases display at CSS size but the
// scene is always 560x420), hands it to the game, and owns the keyboard
// shortcuts. Hit-testing itself lives in game.js.

import { SCENE_W, SCENE_H } from './scenes.js';
import { game, clickAt, useHint, pauseGame, resumeGame } from './game.js';
import { unlockAudio } from './audio.js';

function toSceneCoords(event, canvas) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * SCENE_W,
    y: ((event.clientY - box.top) / box.height) * SCENE_H,
  };
}

export function wireInput() {
  const panels = [
    { canvas: document.getElementById('cv-left'), side: 'left' },
    { canvas: document.getElementById('cv-right'), side: 'right' },
  ];
  for (const { canvas, side } of panels) {
    canvas.addEventListener('pointerdown', (event) => {
      unlockAudio();
      const { x, y } = toSceneCoords(event, canvas);
      clickAt(x, y, side);
    });
  }
  window.addEventListener('keydown', (event) => {
    unlockAudio();
    if (event.key === 'Escape') {
      if (game.state === 'playing') pauseGame();
      else if (game.state === 'paused') resumeGame();
    } else if (event.key === 'h' || event.key === 'H') {
      if (game.state === 'playing') useHint();
    }
  });
}
