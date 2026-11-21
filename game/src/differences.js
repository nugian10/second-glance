// Second Glance — the difference definitions for all six levels.
//
// Each level names its scene (a painter in scenes.js), its time limit, and its
// differences. A difference carries:
//   id    — the switch the scene painter checks when drawing the right panel
//   label — a short human description, shown when the difference is found
//   areas — one or more hit circles {x, y, r} in scene coordinates (560x420);
//           a click inside any of them, on either panel, finds it. Moved
//           objects get two circles: where it was and where it went.
//   kind  — the flavour of change, for the record: colour, removed, added,
//           moved, resized, flipped, count or pattern.
//
// Counts rise with the levels: 5, 6, 7, 8, 9, 10.

export const LEVELS = [
  {
    scene: 'harbor',
    title: 'Harbor at Dusk',
    time: 120,
    diffs: [
      { id: 'sail-color', kind: 'colour', label: 'The sailboat’s sail changed colour', areas: [{ x: 232, y: 226, r: 34 }] },
      { id: 'beam-off', kind: 'removed', label: 'The lighthouse beam is gone', areas: [{ x: 150, y: 140, r: 46 }] },
      { id: 'birds-fewer', kind: 'count', label: 'Two gulls left the sky', areas: [{ x: 334, y: 60, r: 62 }] },
      { id: 'lantern-gone', kind: 'removed', label: 'The middle dock lantern vanished', areas: [{ x: 300, y: 330, r: 26 }] },
      { id: 'rowboat-moved', kind: 'moved', label: 'The rowboat drifted along the dock', areas: [{ x: 136, y: 364, r: 36 }, { x: 220, y: 364, r: 36 }] },
    ],
  },
  {
    scene: 'cabin',
    title: 'Forest Cabin',
    time: 130,
    diffs: [
      { id: 'smoke-gone', kind: 'removed', label: 'The chimney smoke cleared', areas: [{ x: 316, y: 94, r: 34 }] },
      { id: 'antlers-gone', kind: 'removed', label: 'The deer lost its antlers', areas: [{ x: 100, y: 256, r: 30 }] },
      { id: 'curtain-color', kind: 'colour', label: 'The cabin curtains changed colour', areas: [{ x: 222, y: 252, r: 24 }] },
      { id: 'mushroom-added', kind: 'added', label: 'A new mushroom sprouted', areas: [{ x: 425, y: 356, r: 22 }] },
      { id: 'owl-flip', kind: 'flipped', label: 'The owl turned around', areas: [{ x: 452, y: 148, r: 26 }] },
      { id: 'flowers-fewer', kind: 'count', label: 'Two flowers are missing', areas: [{ x: 155, y: 368, r: 46 }] },
    ],
  },
  {
    scene: 'market',
    title: 'Fruit Market',
    time: 140,
    diffs: [
      { id: 'awning-color', kind: 'colour', label: 'The middle awning changed colour', areas: [{ x: 280, y: 128, r: 58 }] },
      { id: 'apples-oranges', kind: 'colour', label: 'Apples turned into oranges', areas: [{ x: 110, y: 280, r: 32 }] },
      { id: 'cat-gone', kind: 'removed', label: 'The market cat wandered off', areas: [{ x: 462, y: 336, r: 26 }] },
      { id: 'bunting-fewer', kind: 'count', label: 'Two bunting flags are missing', areas: [{ x: 110, y: 48, r: 58 }, { x: 280, y: 58, r: 66 }, { x: 450, y: 48, r: 58 }] },
      { id: 'sign-digit', kind: 'pattern', label: 'The price sign changed its number', areas: [{ x: 369, y: 200, r: 20 }] },
      { id: 'grapes-bigger', kind: 'resized', label: 'The grapes grew bigger', areas: [{ x: 432, y: 272, r: 30 }] },
      { id: 'basket-added', kind: 'added', label: 'An extra basket appeared', areas: [{ x: 225, y: 362, r: 26 }] },
    ],
  },
  {
    scene: 'reef',
    title: 'Underwater Reef',
    time: 150,
    diffs: [
      { id: 'turtle-color', kind: 'colour', label: 'The turtle’s shell changed colour', areas: [{ x: 150, y: 142, r: 42 }] },
      { id: 'fish-fewer', kind: 'count', label: 'Two fish left the school', areas: [{ x: 360, y: 112, r: 66 }] },
      { id: 'starfish-gone', kind: 'removed', label: 'The starfish disappeared', areas: [{ x: 468, y: 368, r: 24 }] },
      { id: 'octopus-added', kind: 'added', label: 'An octopus came out to peek', areas: [{ x: 505, y: 298, r: 30 }] },
      { id: 'coral-color', kind: 'colour', label: 'The big coral changed colour', areas: [{ x: 85, y: 298, r: 42 }] },
      { id: 'bubbles-fewer', kind: 'count', label: 'Half the bubbles popped', areas: [{ x: 250, y: 178, r: 48 }] },
      { id: 'bigfish-flip', kind: 'flipped', label: 'The big fish turned around', areas: [{ x: 420, y: 215, r: 46 }] },
      { id: 'seaweed-moved', kind: 'moved', label: 'The tall seaweed shifted over', areas: [{ x: 468, y: 322, r: 24 }, { x: 440, y: 322, r: 24 }] },
    ],
  },
  {
    scene: 'campsite',
    title: 'Mountain Campsite',
    time: 165,
    diffs: [
      { id: 'moon-crescent', kind: 'pattern', label: 'The full moon became a crescent', areas: [{ x: 88, y: 66, r: 32 }] },
      { id: 'shooting-gone', kind: 'removed', label: 'The shooting star is gone', areas: [{ x: 415, y: 55, r: 44 }] },
      { id: 'tent-color', kind: 'colour', label: 'The tent changed colour', areas: [{ x: 170, y: 312, r: 52 }] },
      { id: 'fire-bigger', kind: 'resized', label: 'The campfire flared up', areas: [{ x: 330, y: 318, r: 36 }] },
      { id: 'guitar-gone', kind: 'removed', label: 'The guitar was taken away', areas: [{ x: 442, y: 318, r: 30 }] },
      { id: 'constellation-gone', kind: 'removed', label: 'A constellation faded out', areas: [{ x: 305, y: 90, r: 46 }] },
      { id: 'lantern-off', kind: 'pattern', label: 'The lantern went out', areas: [{ x: 260, y: 312, r: 22 }] },
      { id: 'owl-added', kind: 'added', label: 'An owl settled on the branch', areas: [{ x: 498, y: 205, r: 24 }] },
      { id: 'mug-color', kind: 'colour', label: 'The mug changed colour', areas: [{ x: 372, y: 340, r: 18 }] },
    ],
  },
  {
    scene: 'library',
    title: 'Cozy Library',
    time: 180,
    diffs: [
      { id: 'clock-time', kind: 'pattern', label: 'The clock tells a different time', areas: [{ x: 90, y: 85, r: 30 }] },
      { id: 'lamp-color', kind: 'colour', label: 'The lampshade changed colour', areas: [{ x: 122, y: 172, r: 30 }] },
      { id: 'cat-awake', kind: 'pattern', label: 'The cat woke up', areas: [{ x: 300, y: 350, r: 36 }] },
      { id: 'book-gone', kind: 'removed', label: 'A book is missing from the shelf', areas: [{ x: 254, y: 168, r: 20 }] },
      { id: 'plant-added', kind: 'added', label: 'A plant appeared on the shelf', areas: [{ x: 169, y: 24, r: 22 }] },
      { id: 'globe-color', kind: 'colour', label: 'The globe’s oceans changed colour', areas: [{ x: 455, y: 238, r: 30 }] },
      { id: 'rug-dots', kind: 'pattern', label: 'The rug changed its pattern', areas: [{ x: 280, y: 380, r: 64 }, { x: 196, y: 382, r: 38 }, { x: 364, y: 382, r: 38 }] },
      { id: 'curtain-color', kind: 'colour', label: 'One curtain changed colour', areas: [{ x: 458, y: 108, r: 30 }, { x: 458, y: 186, r: 30 }] },
      { id: 'cups-fewer', kind: 'count', label: 'One teacup was taken away', areas: [{ x: 375, y: 292, r: 26 }] },
      { id: 'stack-fewer', kind: 'count', label: 'The book stack lost a book', areas: [{ x: 172, y: 332, r: 26 }] },
    ],
  },
];

// Differences for a level, smallest hit area first, so a click in an overlap
// (a cat sitting on a patterned rug) credits the specific difference.
export function diffsBySpecificity(level) {
  return [...level.diffs].sort((a, b) => minRadius(a) - minRadius(b));
}

function minRadius(diff) {
  return Math.min(...diff.areas.map((a) => a.r));
}
