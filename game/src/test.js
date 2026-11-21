// Second Glance — the built-in self-test, run only when the page is opened
// with ?test=1. It plays the game the way a player would, through the same
// click entry point the pointer uses: for every level it clicks the centre of
// every defined difference (alternating panels), checks the found counter
// climbs to the level total and the completion state triggers, then verifies
// the wrong-click penalty and the hint budget on a fresh scene. The verdict
// lands in document.title and window.__sgTest for headless runs, and every
// check is logged to the console.

import { LEVELS } from './differences.js';
import { game, startLevel, clickAt, useHint } from './game.js';

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

function emptySpot(level) {
  for (let y = 8; y < 420; y += 14) {
    for (let x = 8; x < 560; x += 14) {
      const clear = level.diffs.every((d) =>
        d.areas.every((a) => {
          const dx = x - a.x;
          const dy = y - a.y;
          return dx * dx + dy * dy > (a.r + 10) * (a.r + 10);
        }));
      if (clear) return { x, y };
    }
  }
  return { x: 4, y: 4 };
}

export async function runTests() {
  game.testMode = true; // freeze the countdown so penalties measure exactly
  const frame = () => new Promise((r) => setTimeout(r, 40));

  for (let li = 0; li < LEVELS.length; li++) {
    const level = LEVELS[li];
    startLevel(li);
    await frame();
    let allFound = true;
    level.diffs.forEach((diff, di) => {
      const area = diff.areas[0];
      const side = di % 2 === 0 ? 'left' : 'right';
      const before = game.found.size;
      const result = clickAt(area.x, area.y, side);
      if (result !== 'found' || game.found.size !== before + 1) allFound = false;
    });
    check(`level ${li + 1} (${level.title}): all ${level.diffs.length} differences clickable`, allFound);
    check(`level ${li + 1}: completion triggers`, game.state === 'complete', `state=${game.state}`);

    // Clicking a found difference again must be a no-op, not a penalty.
    const first = level.diffs[0].areas[0];
    const wrongsBefore = game.wrongCount;
    startLevel(li);
    clickAt(first.x, first.y, 'left');
    const again = clickAt(first.x, first.y, 'right');
    check(`level ${li + 1}: re-clicking a found difference is a no-op`,
      again === 'already' && game.wrongCount === wrongsBefore);
  }

  // Wrong-click penalty on a fresh first scene: exactly −5 seconds.
  startLevel(0);
  const spot = emptySpot(LEVELS[0]);
  const beforeTime = game.timeLeft;
  const wrongResult = clickAt(spot.x, spot.y, 'left');
  check('wrong click registers as wrong', wrongResult === 'wrong');
  check('wrong click costs 5 seconds', Math.abs(beforeTime - game.timeLeft - 5) < 0.001,
    `${beforeTime} -> ${game.timeLeft}`);
  check('wrong click is counted', game.wrongCount === 1);

  // Hint budget: three hints, each aimed at an unfound difference.
  startLevel(1);
  const hintsBefore = game.hintsLeft;
  const hinted = useHint();
  check('hint returns an unfound difference', !!hinted && !game.found.has(hinted.id));
  check('hint consumes budget', game.hintsLeft === hintsBefore - 1);
  useHint();
  useHint();
  check('hint budget exhausts at zero', game.hintsLeft === 0 && useHint() === null);

  const failed = checks.filter((c) => !c.ok);
  const summary = failed.length === 0
    ? `TEST PASS (${checks.length} checks)`
    : `TEST FAIL (${failed.length}/${checks.length} failed)`;
  document.title = summary;
  window.__sgTest = { pass: failed.length === 0, total: checks.length, failures: failed };
  console.log(summary);
}
