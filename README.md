[![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nugian10/second-glance/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nugian10/second-glance/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Second Glance — Spot the Difference

A spot-the-difference game that runs in a desktop browser, entirely from the
static files in `game/`. Two near-identical pictures sit side by side; the
right-hand one hides a handful of changes. Click a difference on either
picture before the clock runs out.

Every picture is drawn in code on a canvas — layered vector scenes with no
photographs, no image files and no network requests — and every sound is
synthesized live with WebAudio. There are no libraries at all.

## The scenes

Six scenes of rising difficulty, 45 differences in all — colour changes,
things removed or added, things moved, grown, flipped, counted and
re-patterned:

| # | Scene | Differences | Time |
|---|-------|-------------|------|
| 1 | Harbor at Dusk | 5 | 2:00 |
| 2 | Forest Cabin | 6 | 2:10 |
| 3 | Fruit Market | 7 | 2:20 |
| 4 | Underwater Reef | 8 | 2:30 |
| 5 | Mountain Campsite | 9 | 2:45 |
| 6 | Cozy Library | 10 | 3:00 |

## How to play

- Click a difference on **either** picture. A ring marks it on both.
- The counter at the top always says how many you have found and how many
  are left.
- A wrong click flashes a red cross, shakes the pictures and costs
  **5 seconds** (and 15 points).
- Stuck? The **Hint** button (or the `H` key) pulses one unfound difference.
  You get 3 hints per scene; each costs 25 points.
- Each find is worth 100 points, plus a point per second left when you
  finish the scene. Finish a scene cleanly — no misses, no hints — for
  three stars. Your best result per scene is remembered.
- `Esc` (or the Pause button) stops the clock.

## Run it locally

Needs Node 22 or later, nothing to install:

```
node serve.ts
```

then open <http://localhost:8080>. That serves the `game/` folder and
nothing else.

## Self-test

Open the game with `?test=1` (for example <http://localhost:8080/?test=1>).
The built-in test plays every scene through the real click path — clicking
the centre of every difference on alternating panels — checks that each
scene completes, and verifies the wrong-click penalty and the hint budget.
The verdict appears in the page title and in `window.__sgTest`.

Screenshot staging for the pictures in `screenshots/` lives at
`?shot=1` … `?shot=4` (see `shots.json`).

## Handing it in

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` there with the vendored make.fun library:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — page shell and HUD
- `game/styles.css` — styling
- `game/src/main.js` — boot and wiring
- `game/src/scenes.js` — the six scene painters (base scene + variants)
- `game/src/differences.js` — per-level difference definitions and hit areas
- `game/src/game.js` — state machine, timer, scoring, rendering
- `game/src/input.js` — pointer and keyboard input
- `game/src/audio.js` — WebAudio-synthesized sounds
- `game/src/hud.js` — HUD updates
- `game/src/test.js` — the `?test=1` self-test
- `vendor/makefun-game.ts` — the make.fun dossier library, unmodified

## License

MIT — see `LICENSE`.
