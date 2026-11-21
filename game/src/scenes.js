// Second Glance — the six scene painters. Every picture is drawn in code on a
// 560x420 canvas: layered vector shapes, one consistent flat style with soft
// shadows, no images and no network. Each painter draws the base scene and
// consults `mods` — the set of difference ids switched on for the right-hand
// picture — so the left picture is always the base and the right is the base
// plus exactly the level's differences. Layouts are fixed and all decorative
// scatter uses a seeded generator re-seeded per paint, so the two panels can
// never drift apart except where a difference says so.

export const SCENE_W = 560;
export const SCENE_H = 420;

// Deterministic scatter: same seed, same dots, every paint.
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function gradient(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function cloudShape(ctx, x, y, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 20 * s, y + 3 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 21 * s, y + 3 * s, 24 * s, 11 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function gull(ctx, x, y, s, color) {
  ctx.beginPath();
  ctx.arc(x - 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.95);
  ctx.arc(x + 7 * s, y, 7 * s, Math.PI * 1.05, Math.PI * 1.85);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * s;
  ctx.stroke();
}

function pineTree(ctx, x, baseY, h, trunk, leaf) {
  rect(ctx, x - 3, baseY - h * 0.18, 6, h * 0.18, trunk);
  for (let i = 0; i < 3; i++) {
    const w = (h * 0.34) * (1 - i * 0.22);
    const yTop = baseY - h * 0.14 - i * h * 0.26;
    poly(ctx, [[x - w / 2, yTop - h * 0.3], [x + w / 2, yTop - h * 0.3], [x, yTop - h * 0.62]], leaf);
  }
}

function starDot(ctx, x, y, r, alpha) {
  ctx.globalAlpha = alpha;
  circle(ctx, x, y, r, '#ffffff');
  ctx.globalAlpha = 1;
}

function fiveStar(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Scene 1 — Harbor at dusk: lighthouse, sailboat, fishing boat, dock lanterns.
// ---------------------------------------------------------------------------
function paintHarbor(ctx, mods) {
  // Sky and sea.
  ctx.fillStyle = gradient(ctx, 0, 250, [[0, '#2c1a4d'], [0.55, '#8a3b63'], [1, '#ff9a5c']]);
  ctx.fillRect(0, 0, 560, 250);
  const rngSky = makeRng(11);
  for (let i = 0; i < 34; i++) starDot(ctx, rngSky() * 560, rngSky() * 110, 1.1, 0.25 + rngSky() * 0.4);

  // Sun low over the water, with a halo.
  const sunGlow = ctx.createRadialGradient(432, 196, 6, 432, 196, 74);
  sunGlow.addColorStop(0, 'rgba(255,217,122,0.85)');
  sunGlow.addColorStop(1, 'rgba(255,217,122,0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(358, 122, 148, 148);
  circle(ctx, 432, 196, 29, '#ffd97a');
  circle(ctx, 432, 196, 24, '#ffe9a8');

  cloudShape(ctx, 96, 58, 1.05, 'rgba(255,170,150,0.5)');
  cloudShape(ctx, 300, 40, 0.8, 'rgba(255,170,150,0.4)');
  cloudShape(ctx, 486, 88, 0.9, 'rgba(214,130,160,0.45)');

  // Gulls: five in the base, three when 'birds-fewer' is on.
  const gulls = [[300, 52], [338, 66], [372, 50], [262, 70], [405, 74]];
  const gullCount = mods.has('birds-fewer') ? 3 : 5;
  for (let i = 0; i < gullCount; i++) gull(ctx, gulls[i][0], gulls[i][1], 1, '#2c1a3d');

  // Distant headland, then the sea.
  poly(ctx, [[0, 250], [0, 226], [70, 214], [150, 228], [210, 250]], '#4a2a5e');
  poly(ctx, [[560, 250], [560, 232], [492, 220], [430, 236], [392, 250]], '#4a2a5e');
  ctx.fillStyle = gradient(ctx, 250, 420, [[0, '#5b3572'], [1, '#221238']]);
  ctx.fillRect(0, 250, 560, 170);
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255,205,120,0.5)';
  const rngSea = makeRng(12);
  for (let i = 0; i < 26; i++) {
    const y = 258 + rngSea() * 120;
    const w = 8 + rngSea() * 26;
    ctx.fillRect(432 - w / 2 + (rngSea() - 0.5) * 26, y, w, 2.4);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  for (let i = 0; i < 20; i++) ctx.fillRect(rngSea() * 560, 256 + rngSea() * 150, 12 + rngSea() * 20, 1.6);

  // Lighthouse on its rocks (left).
  poly(ctx, [[8, 302], [30, 268], [70, 258], [112, 270], [132, 302]], '#3a2340');
  poly(ctx, [[58, 292], [62, 158], [92, 158], [96, 292]], '#e8e2d4');
  poly(ctx, [[60, 252], [94, 252], [95, 228], [61, 228]], '#c33d4e');
  poly(ctx, [[61.5, 196], [92.5, 196], [93, 176], [61, 176]], '#c33d4e');
  rect(ctx, 70, 268, 14, 24, '#5e3a2a'); // door
  rect(ctx, 64, 138, 26, 20, '#33243f'); // lamp room
  circle(ctx, 77, 148, 6.5, '#ffe9a0');
  poly(ctx, [[60, 138], [94, 138], [77, 122]], '#8c2f42'); // roof
  if (!mods.has('beam-off')) {
    poly(ctx, [[84, 142], [216, 108], [222, 178]], 'rgba(255,233,160,0.20)');
    poly(ctx, [[84, 146], [196, 128], [200, 162]], 'rgba(255,233,160,0.16)');
  }

  // Sailboat, centre-left. Sail colour is a difference.
  line(ctx, 222, 268, 222, 178, '#4a3120', 4);
  poly(ctx, [[226, 186], [226, 260], [266, 260]], mods.has('sail-color') ? '#e2483d' : '#f5efe0');
  poly(ctx, [[218, 196], [218, 258], [190, 258]], '#efe3c2');
  poly(ctx, [[180, 268], [272, 268], [258, 288], [194, 288]], '#8c3b2e');
  rect(ctx, 180, 264, 92, 5, '#5e2718');

  // Fishing boat, right: teal hull, cabin, mast lamp.
  poly(ctx, [[356, 286], [474, 286], [456, 308], [372, 308]], '#2a7f7f');
  rect(ctx, 356, 282, 118, 5, '#1d5a5a');
  roundRect(ctx, 396, 256, 40, 26, 3, '#e8e2d4');
  rect(ctx, 404, 262, 10, 10, '#7fb3c8');
  rect(ctx, 420, 262, 10, 10, '#7fb3c8');
  line(ctx, 378, 282, 378, 224, '#4a3120', 3.5);
  line(ctx, 378, 228, 452, 262, 'rgba(240,230,210,0.6)', 1.4);
  circle(ctx, 378, 220, 5, '#ffd97a');
  ellipse(ctx, 415, 316, 52, 4, 'rgba(0,0,0,0.25)');

  // Rowboat in the foreground — it sits further right when 'rowboat-moved'.
  const boatX = mods.has('rowboat-moved') ? 220 : 136;
  poly(ctx, [[boatX - 46, 356], [boatX + 46, 356], [boatX + 32, 376], [boatX - 32, 376]], '#7a4a28');
  rect(ctx, boatX - 46, 352, 92, 5, '#96622f');
  line(ctx, boatX + 6, 358, boatX + 44, 340, '#c9a15f', 3.5); // oar
  ellipse(ctx, boatX, 382, 48, 3.5, 'rgba(0,0,0,0.25)');

  // Dock along the bottom, posts, and three lanterns (middle one can vanish).
  rect(ctx, 0, 392, 560, 28, '#4e3421');
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let x = 34; x < 560; x += 62) ctx.fillRect(x, 392, 3, 28);
  for (const px of [52, 176, 300, 424, 520]) rect(ctx, px, 362, 9, 34, '#3c2716');
  const lanternAt = (x) => {
    line(ctx, x + 4, 362, x + 4, 336, '#2c1c10', 3);
    const glow = ctx.createRadialGradient(x + 4, 326, 2, x + 4, 326, 24);
    glow.addColorStop(0, 'rgba(255,205,110,0.75)');
    glow.addColorStop(1, 'rgba(255,205,110,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 22, 300, 52, 52);
    roundRect(ctx, x - 4, 316, 16, 20, 3, '#2c1c10');
    rect(ctx, x - 1.5, 320, 11, 12, '#ffd76e');
  };
  lanternAt(148);
  if (!mods.has('lantern-gone')) lanternAt(296);
  lanternAt(444);

  // A gull standing on the nearest post.
  ellipse(ctx, 56, 352, 13, 8, '#f2ede2');
  circle(ctx, 66, 344, 5.5, '#f2ede2');
  poly(ctx, [[70, 343], [78, 345], [70, 347]], '#e8a13c');
  line(ctx, 52, 359, 52, 364, '#e8a13c', 2);
  line(ctx, 60, 359, 60, 364, '#e8a13c', 2);
}

// ---------------------------------------------------------------------------
// Scene 2 — Forest cabin: pines, a deer, an owl, smoke over the chimney.
// ---------------------------------------------------------------------------
function paintCabin(ctx, mods) {
  ctx.fillStyle = gradient(ctx, 0, 215, [[0, '#79c4f2'], [1, '#dff3ff']]);
  ctx.fillRect(0, 0, 560, 215);
  circle(ctx, 72, 56, 25, '#fff3a0');
  circle(ctx, 72, 56, 34, 'rgba(255,243,160,0.35)');
  cloudShape(ctx, 215, 52, 1, '#ffffff');
  cloudShape(ctx, 428, 74, 1.2, '#ffffff');
  cloudShape(ctx, 128, 112, 0.7, 'rgba(255,255,255,0.85)');

  // Far pine ridge.
  for (let x = -10; x < 580; x += 38) pineTree(ctx, x + 14, 232, 92, '#2c5a34', '#35704a');
  // Meadow.
  ctx.fillStyle = gradient(ctx, 215, 420, [[0, '#82cc54'], [1, '#4c943a']]);
  ctx.fillRect(0, 215, 560, 205);
  const rng = makeRng(21);
  ctx.strokeStyle = 'rgba(38,110,44,0.55)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 90; i++) {
    const x = rng() * 560, y = 300 + rng() * 115;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y - 6); ctx.stroke();
  }

  // Winding path from the cabin door.
  poly(ctx, [[262, 320], [288, 320], [306, 420], [238, 420]], '#d9bd8a');
  ctx.fillStyle = 'rgba(160,128,84,0.5)';
  for (let i = 0; i < 7; i++) ctx.fillRect(258 + rng() * 26, 330 + i * 13, 7, 3);

  // The cabin: log walls, shingled roof, brick chimney.
  roundRect(ctx, 190, 212, 162, 108, 4, '#9a6a3e');
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = 232; y < 320; y += 18) ctx.fillRect(190, y, 162, 3);
  poly(ctx, [[172, 216], [370, 216], [330, 158], [212, 158]], '#7c3f2c');
  for (let i = 0; i < 5; i++) line(ctx, 208 - i * 7, 208 - i * 11, 334 + i * 7, 208 - i * 11, 'rgba(0,0,0,0.18)', 2);
  rect(ctx, 300, 124, 22, 42, '#a8543c');
  rect(ctx, 297, 120, 28, 7, '#8c4430');
  if (!mods.has('smoke-gone')) {
    ctx.fillStyle = 'rgba(240,240,240,0.75)';
    circle(ctx, 312, 106, 8, 'rgba(240,240,240,0.75)');
    circle(ctx, 320, 88, 11, 'rgba(240,240,240,0.6)');
    circle(ctx, 333, 66, 14, 'rgba(240,240,240,0.45)');
  }
  // Door and windows; the left window's curtain changes colour.
  roundRect(ctx, 256, 252, 30, 68, 3, '#5e3a22');
  circle(ctx, 280, 288, 2.6, '#e8c96a');
  roundRect(ctx, 204, 234, 36, 38, 3, '#3c2a18');
  rect(ctx, 207, 237, 30, 32, '#ffe6a8');
  rect(ctx, 207, 237, 13, 32, mods.has('curtain-color') ? '#3f8fd9' : '#d94f4f');
  rect(ctx, 224, 237, 13, 32, mods.has('curtain-color') ? '#3f8fd9' : '#d94f4f');
  roundRect(ctx, 302, 234, 36, 38, 3, '#3c2a18');
  rect(ctx, 305, 237, 30, 32, '#ffe6a8');
  line(ctx, 320, 237, 320, 269, '#3c2a18', 3);

  // Wood pile beside the cabin.
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 4 - (row === 2 ? 1 : 0); i++) {
      const x = 378 + i * 15 + row * 6, y = 308 - row * 13;
      circle(ctx, x, y, 7.5, '#b0814c');
      circle(ctx, x, y, 4.4, '#d9b47e');
    }

  // Big tree on the right with the owl on a branch; the owl can turn around.
  rect(ctx, 492, 150, 20, 172, '#6b4426');
  circle(ctx, 502, 118, 62, '#3e7d3a');
  circle(ctx, 458, 142, 40, '#479147');
  circle(ctx, 540, 140, 38, '#479147');
  line(ctx, 494, 176, 448, 162, '#6b4426', 7);
  const owlDir = mods.has('owl-flip') ? 1 : -1;
  ellipse(ctx, 452, 146, 13, 16, '#8a6844');
  circle(ctx, 452, 128, 11, '#a37c50');
  poly(ctx, [[443, 121], [447, 113], [451, 120]], '#8a6844');
  poly(ctx, [[453, 120], [457, 113], [461, 121]], '#8a6844');
  circle(ctx, 448 + owlDir * 1.5, 127, 4.6, '#f5ecd8');
  circle(ctx, 456 + owlDir * 1.5, 127, 4.6, '#f5ecd8');
  circle(ctx, 448 + owlDir * 3, 127, 2.2, '#221812');
  circle(ctx, 456 + owlDir * 3, 127, 2.2, '#221812');
  poly(ctx, [[452 + owlDir * 4, 130], [452 + owlDir * 7, 133], [452 + owlDir * 4, 135]], '#e8a13c');

  // Tree on the left with a birdhouse.
  rect(ctx, 36, 168, 16, 154, '#6b4426');
  circle(ctx, 44, 128, 52, '#3e7d3a');
  circle(ctx, 12, 152, 32, '#479147');
  circle(ctx, 78, 150, 34, '#479147');
  line(ctx, 48, 196, 86, 186, '#6b4426', 6);
  roundRect(ctx, 76, 158, 24, 26, 2, '#c95f3d');
  poly(ctx, [[73, 159], [103, 159], [88, 146]], '#7c3f2c');
  circle(ctx, 88, 170, 5, '#33231a');

  // Deer on the left meadow; antlers are a difference.
  ellipse(ctx, 98, 308, 34, 20, '#b98a5a');
  ellipse(ctx, 122, 288, 9, 16, '#b98a5a');
  ellipse(ctx, 128, 272, 11, 9, '#c79a68');
  poly(ctx, [[134, 268], [142, 264], [136, 276]], '#8a6844');
  circle(ctx, 131, 270, 1.8, '#221812');
  for (const lx of [76, 90, 108, 120]) rect(ctx, lx, 320, 5, 26, '#a87c4e');
  poly(ctx, [[64, 298], [54, 290], [66, 288]], '#e8dcc4');
  if (!mods.has('antlers-gone')) {
    ctx.strokeStyle = '#7a5a34';
    ctx.lineWidth = 2.6;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(124 + s * 5, 264);
      ctx.lineTo(122 + s * 10, 248);
      ctx.moveTo(123 + s * 8, 254);
      ctx.lineTo(116 + s * 12, 246);
      ctx.moveTo(123 + s * 8, 254);
      ctx.lineTo(130 + s * 13, 244);
      ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (const [sx, sy] of [[88, 300], [104, 312], [80, 314]]) circle(ctx, sx, sy, 3.4, 'rgba(255,255,255,0.5)');

  // Rabbit by the path.
  ellipse(ctx, 356, 344, 14, 9, '#cfd4d8');
  circle(ctx, 368, 336, 7, '#cfd4d8');
  ellipse(ctx, 365, 322, 3, 9, '#cfd4d8');
  ellipse(ctx, 371, 322, 3, 9, '#e3e7ea');
  circle(ctx, 370, 335, 1.6, '#221812');

  // Flower patch bottom-left: six blooms, four when 'flowers-fewer'.
  const flowers = [[126, 356], [148, 372], [170, 354], [192, 370], [138, 386], [182, 388]];
  const flowerCount = mods.has('flowers-fewer') ? 4 : 6;
  const petalColors = ['#ff7eb0', '#ffd94d', '#ff8c42', '#c39bff', '#ff6b6b', '#7ed3ff'];
  for (let i = 0; i < flowerCount; i++) {
    const [fx, fy] = flowers[i];
    line(ctx, fx, fy + 12, fx, fy + 2, '#2f7a33', 2);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 3.6, petalColors[i]);
    }
    circle(ctx, fx, fy, 2.8, '#fff3c4');
  }

  // Mushrooms right of the path — a third pops up when 'mushroom-added'.
  const mushroom = (x, y, s) => {
    rect(ctx, x - 2.5 * s, y - 6 * s, 5 * s, 7 * s, '#f0e6d2');
    poly(ctx, [[x - 9 * s, y - 5 * s], [x + 9 * s, y - 5 * s], [x, y - 14 * s]], '#d94f4f');
    circle(ctx, x - 3 * s, y - 8 * s, 1.5 * s, '#ffffff');
    circle(ctx, x + 3.5 * s, y - 9.5 * s, 1.2 * s, '#ffffff');
  };
  mushroom(458, 356, 1);
  mushroom(488, 366, 0.8);
  if (mods.has('mushroom-added')) mushroom(425, 358, 0.9);

  // Fence posts across the front.
  ctx.fillStyle = '#8a6844';
  for (const fx of [8, 60, 452, 505]) {
    rect(ctx, fx, 372, 7, 34, '#8a6844');
  }
  line(ctx, 4, 384, 70, 380, '#8a6844', 4);
  line(ctx, 448, 380, 514, 384, '#8a6844', 4);
}

// ---------------------------------------------------------------------------
// Scene 3 — Fruit-market street: three stalls, bunting, a cat by the crates.
// ---------------------------------------------------------------------------
function paintMarket(ctx, mods) {
  ctx.fillStyle = gradient(ctx, 0, 300, [[0, '#ffe3b3'], [1, '#fff3da']]);
  ctx.fillRect(0, 0, 560, 300);
  circle(ctx, 502, 46, 24, '#ffd94d');
  cloudShape(ctx, 120, 44, 0.85, 'rgba(255,255,255,0.9)');
  cloudShape(ctx, 330, 30, 0.65, 'rgba(255,255,255,0.8)');

  // Building facades behind the stalls.
  const facades = [[6, 78, 120, '#e8b4a0'], [140, 62, 130, '#f0d0a0'], [286, 84, 120, '#dfc7e8'], [420, 66, 134, '#b8d8c0']];
  for (const [fx, fy, fw, col] of facades) {
    rect(ctx, fx, fy, fw, 226 - fy, col);
    ctx.fillStyle = 'rgba(90,60,40,0.55)';
    for (let wy = fy + 18; wy < 200; wy += 34)
      for (let wx = fx + 14; wx < fx + fw - 16; wx += 32) ctx.fillRect(wx, wy, 16, 20);
  }
  // Street.
  ctx.fillStyle = gradient(ctx, 300, 420, [[0, '#cbb59a'], [1, '#a68d6e']]);
  ctx.fillRect(0, 300, 560, 120);
  ctx.fillStyle = 'rgba(90,70,50,0.35)';
  const rngStreet = makeRng(31);
  for (let i = 0; i < 40; i++) ctx.fillRect(rngStreet() * 560, 306 + rngStreet() * 108, 14 + rngStreet() * 22, 3);

  // Bunting strung across the top: seven pennants, five when 'bunting-fewer'.
  ctx.beginPath();
  ctx.moveTo(6, 18);
  ctx.quadraticCurveTo(280, 74, 554, 18);
  ctx.strokeStyle = '#7a5a34';
  ctx.lineWidth = 2;
  ctx.stroke();
  const flagColors = ['#e2483d', '#f39c12', '#27ae60', '#2980b9', '#8e44ad', '#ff7eb0', '#f1c40f'];
  const flagCount = mods.has('bunting-fewer') ? 5 : 7;
  for (let i = 0; i < flagCount; i++) {
    const t = (i + 0.5) / flagCount;
    const fx = 6 + (554 - 6) * t;
    const fy = 18 + Math.sin(t * Math.PI) * 40 + 6;
    poly(ctx, [[fx - 11, fy], [fx + 11, fy], [fx, fy + 20]], flagColors[i]);
  }

  // One stall: poles, striped awning, counter, legs.
  const stall = (x, awningA, awningB) => {
    rect(ctx, x + 4, 148, 7, 158, '#7a5230');
    rect(ctx, x + 139, 148, 7, 158, '#7a5230');
    for (let i = 0; i < 6; i++) {
      const sx = x - 6 + i * 27;
      poly(ctx, [[sx, 118], [sx + 27, 118], [sx + 21, 152], [sx + 6, 152]], i % 2 === 0 ? awningA : awningB);
    }
    roundRect(ctx, x - 2, 252, 154, 16, 3, '#8a6844');
    rect(ctx, x + 8, 268, 8, 40, '#6e4f2c');
    rect(ctx, x + 134, 268, 8, 40, '#6e4f2c');
  };
  stall(30, '#e2483d', '#f7f0e0');
  stall(205, mods.has('awning-color') ? '#f07f13' : '#27ae60', '#f7f0e0');
  stall(380, '#2980b9', '#f7f0e0');

  // Crate of round fruit on a counter.
  const crate = (x, y, fruit, skin) => {
    roundRect(ctx, x, y + 12, 62, 22, 2, '#a5713d');
    line(ctx, x, y + 23, x + 62, y + 23, '#7a5230', 2.4);
    const spots = [[10, 8], [24, 4], [38, 8], [51, 5], [17, 15], [31, 13], [45, 15]];
    for (const [ox, oy] of spots) {
      circle(ctx, x + ox, y + oy, 7.4, fruit);
      line(ctx, x + ox, y + oy - 7, x + ox + 2, y + oy - 11, skin, 1.8);
    }
  };
  crate(46, 218, '#7ec850', '#4c943a'); // green apples, stall A back
  crate(84, 240, mods.has('apples-oranges') ? '#f39c12' : '#d93636', '#7a4a28'); // the changing crate
  crate(392, 222, '#c0392b', '#7a4a28'); // red apples, stall C
  crate(452, 244, '#f5d76e', '#a5713d'); // lemons

  // Grape bunches: circles in a triangle, hanging at stall B and C counters.
  const grapes = (cx, cy, scale, fill) => {
    const rows = [3, 4, 3, 2, 1];
    rows.forEach((n, r) => {
      for (let i = 0; i < n; i++) {
        circle(ctx, cx + (i - (n - 1) / 2) * 13 * scale, cy + r * 12 * scale, 6.4 * scale, fill);
      }
    });
    line(ctx, cx, cy - 8 * scale, cx + 4, cy - 16 * scale, '#4c943a', 2.4);
    ellipse(ctx, cx + 9 * scale, cy - 12 * scale, 7 * scale, 3.6 * scale, '#5cb85c');
  };
  grapes(268, 236, 0.95, '#7d3c98');
  grapes(432, 240, mods.has('grapes-bigger') ? 1.45 : 1.0, '#5b2c83');

  // Vendor behind the middle counter.
  circle(ctx, 316, 208, 13, '#c98d5f');
  poly(ctx, [[302, 196], [330, 196], [316, 184]], '#e8c96a'); // straw hat brim
  ellipse(ctx, 316, 192, 16, 4, '#e8c96a');
  roundRect(ctx, 300, 220, 32, 34, 5, '#3f8fd9');

  // Price board on the middle stall's pole: the digit is a difference.
  roundRect(ctx, 352, 182, 34, 34, 3, '#4a3626');
  roundRect(ctx, 355, 185, 28, 28, 2, '#f7f0da');
  ctx.fillStyle = '#33302a';
  ctx.font = 'bold 21px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mods.has('sign-digit') ? '5' : '3', 369, 200);

  // Hanging scale on the right stall.
  line(ctx, 396, 152, 396, 176, '#5a4632', 2.4);
  line(ctx, 378, 184, 414, 184, '#5a4632', 2.4);
  for (const px of [378, 414]) {
    line(ctx, px, 184, px - 8, 200, '#5a4632', 1.6);
    line(ctx, px, 184, px + 8, 200, '#5a4632', 1.6);
    ellipse(ctx, px, 203, 11, 3.6, '#b8a888');
  }
  circle(ctx, 378, 198, 4.4, '#f39c12');

  // Baskets in the foreground — an extra one appears when 'basket-added'.
  const basket = (x, y, fill) => {
    poly(ctx, [[x - 24, y - 14], [x + 24, y - 14], [x + 17, y + 14], [x - 17, y + 14]], '#b0814c');
    line(ctx, x - 21, y - 4, x + 21, y - 4, '#7a5230', 2.4);
    line(ctx, x - 19, y + 5, x + 19, y + 5, '#7a5230', 2.4);
    for (const ox of [-12, 0, 12]) circle(ctx, x + ox, y - 16, 7.6, fill);
  };
  basket(66, 366, '#d93636');
  basket(150, 380, '#7ec850');
  if (mods.has('basket-added')) basket(228, 364, '#f39c12');

  // The market cat, sitting by the right stall — gone when 'cat-gone'.
  if (!mods.has('cat-gone')) {
    ellipse(ctx, 462, 340, 15, 17, '#e8973f');
    circle(ctx, 462, 318, 10.5, '#e8973f');
    poly(ctx, [[454, 311], [456, 301], [461, 309]], '#e8973f');
    poly(ctx, [[463, 309], [468, 301], [470, 311]], '#e8973f');
    circle(ctx, 458, 317, 1.7, '#33231a');
    circle(ctx, 466, 317, 1.7, '#33231a');
    ctx.beginPath();
    ctx.arc(474, 352, 12, Math.PI * 0.9, Math.PI * 1.9);
    ctx.strokeStyle = '#e8973f';
    ctx.lineWidth = 4.4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120,66,20,0.6)';
    ctx.lineWidth = 2;
    for (const sx of [452, 460, 468]) line(ctx, sx, 330, sx + 1, 348, 'rgba(120,66,20,0.6)', 2);
  }
}

// ---------------------------------------------------------------------------
// Scene 4 — Underwater reef: turtle, fish school, corals, a shy octopus.
// ---------------------------------------------------------------------------
function paintReef(ctx, mods) {
  ctx.fillStyle = gradient(ctx, 0, 420, [[0, '#1d86c4'], [0.6, '#0f5b94'], [1, '#083a68']]);
  ctx.fillRect(0, 0, 560, 420);
  // Light rays from the surface.
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (const [rx, rw] of [[70, 44], [210, 60], [400, 50]]) {
    poly(ctx, [[rx, 0], [rx + rw, 0], [rx + rw + 42, 300], [rx + 20, 300]], 'rgba(255,255,255,0.10)');
  }
  const rng = makeRng(41);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let i = 0; i < 60; i++) ctx.fillRect(rng() * 560, rng() * 330, 2.2, 2.2);

  // Sand and rocks.
  ctx.fillStyle = gradient(ctx, 368, 420, [[0, '#e8d8a0'], [1, '#cbb37e']]);
  ctx.fillRect(0, 368, 560, 52);
  ctx.fillStyle = 'rgba(150,125,80,0.5)';
  for (let i = 0; i < 34; i++) circle(ctx, rng() * 560, 376 + rng() * 38, 1.8, 'rgba(150,125,80,0.5)');
  ellipse(ctx, 84, 356, 62, 26, '#7d8a99');
  ellipse(ctx, 60, 342, 34, 18, '#93a1b0');
  ellipse(ctx, 486, 350, 66, 30, '#7d8a99');
  ellipse(ctx, 516, 334, 34, 18, '#93a1b0');

  // The big branching coral — pink, or purple when 'coral-color'.
  const coralCol = mods.has('coral-color') ? '#9b5de5' : '#ff7eb0';
  const branch = (x, y, len, ang, w) => {
    if (len < 9 || w < 1) return;
    const nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = coralCol;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.stroke();
    circle(ctx, nx, ny, w * 0.62, coralCol);
    branch(nx, ny, len * 0.74, ang - 0.42, w * 0.72);
    branch(nx, ny, len * 0.74, ang + 0.38, w * 0.72);
  };
  branch(85, 348, 34, -Math.PI / 2, 8);

  // Tube sponges and a brain coral.
  for (const [sx, sh] of [[176, 44], [194, 58], [212, 38]]) {
    roundRect(ctx, sx, 372 - sh, 15, sh, 6, '#f39c12');
    ellipse(ctx, sx + 7.5, 372 - sh, 7.5, 3.4, '#b9770e');
  }
  circle(ctx, 336, 352, 26, '#e2725b');
  ctx.strokeStyle = 'rgba(120,40,30,0.55)';
  ctx.lineWidth = 2;
  for (const r of [8, 15, 21]) {
    ctx.beginPath();
    ctx.arc(336, 352, r, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }

  // Seaweed strands — the right-hand one grows elsewhere when 'seaweed-moved'.
  const weed = (x, baseY, h, col) => {
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.bezierCurveTo(x - 10, baseY - h * 0.35, x + 10, baseY - h * 0.65, x - 4, baseY - h);
    ctx.strokeStyle = col;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  };
  weed(42, 378, 118, '#2fae5f');
  weed(140, 382, 84, '#3fbf72');
  weed(300, 384, 96, '#27965a');
  if (mods.has('seaweed-moved')) weed(440, 380, 76, '#3fbf72'); else weed(468, 380, 76, '#3fbf72');
  weed(524, 382, 100, '#27965a');

  // Turtle at the top-left; its shell changes colour with 'turtle-color'.
  const shellCol = mods.has('turtle-color') ? '#8a6d3b' : '#3f9e4d';
  ellipse(ctx, 150, 142, 46, 30, shellCol);
  ctx.strokeStyle = 'rgba(20,60,30,0.5)';
  ctx.lineWidth = 2;
  for (const [hx, hy] of [[-18, -8], [0, -12], [18, -8], [-9, 8], [10, 8]]) {
    ctx.beginPath();
    ctx.ellipse(150 + hx, 142 + hy, 9, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  circle(ctx, 202, 132, 11, '#57b368');
  circle(ctx, 205, 130, 2, '#0d2c18');
  ellipse(ctx, 118, 116, 13, 6, '#57b368');
  ellipse(ctx, 182, 170, 13, 6, '#57b368');
  ellipse(ctx, 122, 168, 11, 5, '#57b368');

  // A school of little fish: eight, or six when 'fish-fewer'.
  const school = [[306, 96], [336, 116], [362, 92], [388, 118], [410, 96], [330, 140], [382, 142], [416, 128]];
  const fishCount = mods.has('fish-fewer') ? 6 : 8;
  const smallFish = (x, y, col) => {
    ellipse(ctx, x, y, 10, 5.4, col);
    poly(ctx, [[x + 9, y], [x + 16, y - 5], [x + 16, y + 5]], col);
    circle(ctx, x - 4, y - 1, 1.5, '#083a68');
  };
  for (let i = 0; i < fishCount; i++) smallFish(school[i][0], school[i][1], i % 2 ? '#ffb84d' : '#ff9440');

  // The big fish, facing left — or right when 'bigfish-flip'.
  const bigFish = (cx, cy, dir) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dir, 1);
    ellipse(ctx, 0, 0, 44, 19, '#2ec4b6');
    poly(ctx, [[40, 0], [58, -13], [58, 13]], '#25a99b');
    poly(ctx, [[-6, -16], [10, -26], [16, -14]], '#25a99b');
    circle(ctx, -26, -4, 3.6, '#083a68');
    circle(ctx, -26, -4, 6.4, 'rgba(255,255,255,0.35)');
    ctx.beginPath();
    ctx.arc(-14, 2, 10, Math.PI * 0.3, Math.PI * 0.8);
    ctx.strokeStyle = 'rgba(8,58,104,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };
  bigFish(420, 215, mods.has('bigfish-flip') ? -1 : 1);

  // Bubble column: six bubbles, three when 'bubbles-fewer'.
  const bubbles = [[246, 258], [256, 226], [244, 196], [254, 164], [246, 134], [252, 106]];
  const bubbleCount = mods.has('bubbles-fewer') ? 3 : 6;
  for (let i = 0; i < bubbleCount; i++) {
    const [bx, by] = bubbles[i];
    circle(ctx, bx, by, 4 + (i % 3) * 1.6, 'rgba(255,255,255,0.28)');
    circle(ctx, bx - 1.6, by - 1.6, 1.4, 'rgba(255,255,255,0.75)');
  }

  // An octopus peeks from the right rocks only when 'octopus-added'.
  if (mods.has('octopus-added')) {
    ellipse(ctx, 505, 292, 20, 17, '#8e44ad');
    circle(ctx, 498, 288, 3, '#ffffff');
    circle(ctx, 512, 288, 3, '#ffffff');
    circle(ctx, 498, 288, 1.5, '#221133');
    circle(ctx, 512, 288, 1.5, '#221133');
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (const tx of [488, 499, 511, 521]) {
      ctx.beginPath();
      ctx.moveTo(tx, 304);
      ctx.quadraticCurveTo(tx + 3, 314, tx - 3, 320);
      ctx.stroke();
    }
  }

  // Shell, crab and the starfish that can vanish.
  ellipse(ctx, 200, 388, 15, 10, '#ffb3c8');
  ctx.beginPath();
  ctx.arc(200, 388, 8, 0, Math.PI * 2);
  ctx.strokeStyle = '#e2738f';
  ctx.lineWidth = 2;
  ctx.stroke();
  ellipse(ctx, 300, 384, 12, 7, '#e2483d');
  circle(ctx, 292, 378, 4.6, '#e2483d');
  circle(ctx, 308, 378, 4.6, '#e2483d');
  circle(ctx, 292, 377, 1.5, '#ffffff');
  circle(ctx, 308, 377, 1.5, '#ffffff');
  if (!mods.has('starfish-gone')) fiveStar(ctx, 468, 368, 15, '#ff9440');
  fiveStar(ctx, 120, 392, 9, '#e2725b');
}

// ---------------------------------------------------------------------------
// Scene 5 — Mountain campsite under stars: tent, campfire, a patient owl.
// ---------------------------------------------------------------------------
function paintCampsite(ctx, mods) {
  ctx.fillStyle = gradient(ctx, 0, 300, [[0, '#0a0f2e'], [1, '#2c3a6e']]);
  ctx.fillRect(0, 0, 560, 300);
  // Star field (fixed seed, so both panels agree).
  const rng = makeRng(51);
  for (let i = 0; i < 120; i++) {
    const x = rng() * 560, y = rng() * 235;
    starDot(ctx, x, y, rng() < 0.12 ? 1.9 : 1.1, 0.35 + rng() * 0.6);
  }
  // A little constellation of five bright stars — gone when 'constellation-gone'.
  if (!mods.has('constellation-gone')) {
    const pts = [[272, 108], [292, 82], [314, 96], [330, 70], [348, 92]];
    ctx.strokeStyle = 'rgba(180,200,255,0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
    for (const [x, y] of pts) {
      starDot(ctx, x, y, 2.6, 1);
      starDot(ctx, x, y, 5.4, 0.25);
    }
  }
  // Shooting star — streaking, unless 'shooting-gone'.
  if (!mods.has('shooting-gone')) {
    const grad = ctx.createLinearGradient(382, 72, 452, 34);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(255,255,255,0.95)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(382, 72);
    ctx.lineTo(452, 34);
    ctx.stroke();
    starDot(ctx, 452, 34, 3, 1);
  }
  // The moon: full, or a crescent when 'moon-crescent'.
  circle(ctx, 88, 66, 26, '#f5f0dc');
  circle(ctx, 79, 58, 5, 'rgba(190,180,150,0.6)');
  circle(ctx, 97, 76, 4, 'rgba(190,180,150,0.6)');
  circle(ctx, 92, 52, 3, 'rgba(190,180,150,0.5)');
  if (mods.has('moon-crescent')) {
    circle(ctx, 102, 58, 23, '#0d1338');
  }

  // Mountain silhouettes, far and near.
  poly(ctx, [[0, 252], [80, 168], [150, 224], [238, 148], [330, 226], [420, 172], [500, 228], [560, 196], [560, 252]], '#232f57');
  poly(ctx, [[238, 148], [222, 168], [254, 168]], '#dfe9ff');
  poly(ctx, [[80, 168], [66, 186], [94, 186]], '#dfe9ff');
  poly(ctx, [[0, 262], [120, 206], [260, 258], [390, 210], [560, 256], [560, 300], [0, 300]], '#17223f');

  // Pine treeline.
  for (let x = 4; x < 560; x += 30) pineTree(ctx, x + 12, 306, 44 + ((x * 7) % 18), '#060b1c', '#0d1830');

  // Lake band with moonlight shimmer.
  ctx.fillStyle = gradient(ctx, 300, 348, [[0, '#1b2c52'], [1, '#101d3a']]);
  ctx.fillRect(0, 300, 560, 48);
  ctx.fillStyle = 'rgba(245,240,220,0.5)';
  for (let i = 0; i < 9; i++) ctx.fillRect(74 + (i % 3) * 9 - i * 1.5, 306 + i * 4.4, 16 - i, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  const rngLake = makeRng(52);
  for (let i = 0; i < 22; i++) ctx.fillRect(rngLake() * 560, 304 + rngLake() * 40, 3, 1.6);

  // Foreground meadow.
  ctx.fillStyle = gradient(ctx, 348, 420, [[0, '#0c1730'], [1, '#060b1c']]);
  ctx.fillRect(0, 348, 560, 72);

  // The tent — orange, or teal when 'tent-color'.
  const tentCol = mods.has('tent-color') ? '#1abc9c' : '#e67e22';
  const tentDark = mods.has('tent-color') ? '#12836e' : '#b45f16';
  poly(ctx, [[104, 352], [170, 282], [236, 352]], tentCol);
  poly(ctx, [[170, 282], [236, 352], [196, 352]], tentDark);
  poly(ctx, [[170, 306], [196, 352], [144, 352]], '#3a2415');
  line(ctx, 170, 282, 170, 268, '#c9a15f', 3);
  line(ctx, 104, 352, 84, 366, 'rgba(220,220,220,0.5)', 1.4);
  line(ctx, 236, 352, 256, 366, 'rgba(220,220,220,0.5)', 1.4);

  // Backpack by the tent.
  roundRect(ctx, 74, 322, 30, 30, 7, '#c0392b');
  roundRect(ctx, 81, 314, 16, 12, 5, '#96281b');
  rect(ctx, 74, 336, 30, 5, '#96281b');

  // Bench log, with a mug whose colour is a difference.
  roundRect(ctx, 352, 340, 122, 15, 7, '#5e4028');
  circle(ctx, 358, 347, 7, '#8a6844');
  rect(ctx, 366, 352, 6, 12, '#4a3120');
  rect(ctx, 452, 352, 6, 12, '#4a3120');
  const mugCol = mods.has('mug-color') ? '#f1c40f' : '#d93636';
  rect(ctx, 366, 328, 12, 12, mugCol);
  ctx.beginPath();
  ctx.arc(381, 334, 4.6, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = mugCol;
  ctx.lineWidth = 2.6;
  ctx.stroke();

  // Lantern on a stump — lit, or dark when 'lantern-off'.
  roundRect(ctx, 246, 324, 30, 26, 4, '#5e4028');
  ctx.fillStyle = '#8a6844';
  ctx.beginPath();
  ctx.ellipse(261, 324, 15, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!mods.has('lantern-off')) {
    const glow = ctx.createRadialGradient(261, 310, 2, 261, 310, 30);
    glow.addColorStop(0, 'rgba(255,205,110,0.8)');
    glow.addColorStop(1, 'rgba(255,205,110,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(229, 278, 64, 64);
  }
  roundRect(ctx, 253, 300, 16, 22, 3, '#20242e');
  rect(ctx, 256.5, 304, 9, 12, mods.has('lantern-off') ? '#39404e' : '#ffd76e');
  line(ctx, 261, 300, 261, 294, '#20242e', 2.6);

  // Campfire with a ring of stones; flames grow when 'fire-bigger'.
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    circle(ctx, 330 + Math.cos(a) * 30, 344 + Math.sin(a) * 8, 5.4, '#5a6472');
  }
  ctx.save();
  ctx.translate(330, 344);
  ctx.rotate(0.5);
  rect(ctx, -20, -4, 40, 7, '#6e4a2a');
  ctx.rotate(-1);
  rect(ctx, -20, -4, 40, 7, '#7d5636');
  ctx.restore();
  const fireScale = mods.has('fire-bigger') ? 1.5 : 1;
  const flame = (x, y, s, col) => {
    poly(ctx, [[x - 8 * s, y], [x, y - 26 * s], [x + 8 * s, y]], col);
    circle(ctx, x, y - 2 * s, 7.6 * s, col);
  };
  const fireGlow = ctx.createRadialGradient(330, 330, 4, 330, 330, 62 * Math.min(fireScale, 1.25));
  fireGlow.addColorStop(0, 'rgba(255,150,60,0.45)');
  fireGlow.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = fireGlow;
  const glowBox = 130 * Math.min(fireScale, 1.25);
  ctx.fillRect(330 - glowBox, 330 - glowBox, glowBox * 2, glowBox * 2);
  flame(330, 342, 1.12 * fireScale, '#e25822');
  flame(318, 342, 0.8 * fireScale, '#f39c12');
  flame(342, 342, 0.84 * fireScale, '#f39c12');
  flame(330, 342, 0.52 * fireScale, '#ffd94d');

  // Guitar leaning on the bench — gone when 'guitar-gone'.
  if (!mods.has('guitar-gone')) {
    ctx.save();
    ctx.translate(442, 322);
    ctx.rotate(0.32);
    circle(ctx, 0, 10, 15, '#b06a32');
    circle(ctx, 0, -2, 10.6, '#b06a32');
    circle(ctx, 0, 6, 5.6, '#3a2415');
    rect(ctx, -3, -34, 6, 26, '#7d5636');
    rect(ctx, -5, -40, 10, 8, '#5e4028');
    ctx.restore();
  }

  // Owl on a high right branch — only there when 'owl-added'.
  pineTree(ctx, 506, 300, 128, '#060b1c', '#0d1830');
  line(ctx, 500, 224, 470, 214, '#060b1c', 6);
  if (mods.has('owl-added')) {
    ellipse(ctx, 498, 200, 10, 12.6, '#4a3626');
    circle(ctx, 498, 187, 8.4, '#5e4630');
    circle(ctx, 494.6, 186, 2.6, '#ffd94d');
    circle(ctx, 501.4, 186, 2.6, '#ffd94d');
    circle(ctx, 494.6, 186, 1.2, '#14100c');
    circle(ctx, 501.4, 186, 1.2, '#14100c');
  }

  // Fireflies drifting over the meadow.
  const rngFly = makeRng(53);
  for (let i = 0; i < 9; i++) {
    const x = 30 + rngFly() * 500, y = 356 + rngFly() * 50;
    starDot(ctx, x, y, 4.6, 0.16);
    starDot(ctx, x, y, 1.7, 0.8);
  }
}

// ---------------------------------------------------------------------------
// Scene 6 — Cozy library: shelves of books, a sleeping cat, lamplight.
// ---------------------------------------------------------------------------
function paintLibrary(ctx, mods) {
  // Wall and floor.
  ctx.fillStyle = gradient(ctx, 0, 340, [[0, '#7a5230'], [1, '#664325']]);
  ctx.fillRect(0, 0, 560, 340);
  ctx.fillStyle = gradient(ctx, 340, 420, [[0, '#5a3d26'], [1, '#453019']]);
  ctx.fillRect(0, 340, 560, 80);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  for (let x = 46; x < 560; x += 64) ctx.fillRect(x, 340, 2.4, 80);
  ctx.fillRect(0, 338, 560, 4, '#3c2716');

  // The great bookshelf, centre-back.
  roundRect(ctx, 146, 36, 268, 268, 5, '#4a3120');
  roundRect(ctx, 154, 44, 252, 252, 3, '#5e4028');
  const bookPalette = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#d35400', '#16a085', '#b03a2e', '#7d6608'];
  const shelfRow = (yBase, seed, gapAt = null) => {
    // Lay the row out first, identically every paint; the gap (a removed
    // book) only skips drawing, so no other book ever shifts.
    const rng = makeRng(seed);
    const layout = [];
    let x = 162;
    while (x < 392) {
      const w = 13 + Math.floor(rng() * 9);
      const h = 44 + Math.floor(rng() * 14);
      const col = bookPalette[Math.floor(rng() * bookPalette.length)];
      layout.push({ x, w, h, col });
      x += w + 2.4;
    }
    for (const b of layout) {
      if (gapAt && b.x + b.w > gapAt[0] && b.x < gapAt[1]) continue;
      rect(ctx, b.x, yBase - b.h, b.w, b.h, b.col);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(b.x, yBase - b.h + 5, b.w, 2.4);
      ctx.fillRect(b.x, yBase - 8, b.w, 2.4);
    }
    rect(ctx, 154, yBase, 252, 7, '#4a3120');
  };
  shelfRow(124, 61);
  shelfRow(212, 62, mods.has('book-gone') ? [242, 266] : null);
  shelfRow(296, 63);
  // The distinctive tall red book on the middle shelf (or the gap it leaves).
  if (!mods.has('book-gone')) {
    rect(ctx, 246, 152, 16, 60, '#a31621');
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(246, 160, 16, 4);
    ctx.fillRect(246, 196, 16, 4);
  }
  // A plant on top of the shelf — only when 'plant-added'.
  if (mods.has('plant-added')) {
    poly(ctx, [[158, 36], [180, 36], [176, 20], [162, 20]], '#c95f3d');
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const [ex, ey] of [[160, 4], [169, 0], [178, 5]]) {
      ctx.beginPath();
      ctx.moveTo(169, 20);
      ctx.quadraticCurveTo(169 + (ex - 169) * 0.4, 12, ex, ey + 4);
      ctx.stroke();
      ellipse(ctx, ex, ey + 3, 4.6, 2.8, '#2fae5f');
    }
  }

  // Wall clock on the left — its hands tell a different time when 'clock-time'.
  circle(ctx, 90, 85, 30, '#3c2716');
  circle(ctx, 90, 85, 25, '#f7f0da');
  ctx.fillStyle = '#3c2716';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, 90 + Math.cos(a) * 20.4, 85 + Math.sin(a) * 20.4, i % 3 === 0 ? 1.9 : 1.1, '#3c2716');
  }
  const [hourA, minA] = mods.has('clock-time') ? [Math.PI * 0.62, Math.PI] : [-Math.PI / 2, 0];
  line(ctx, 90, 85, 90 + Math.cos(hourA) * 12.4, 85 + Math.sin(hourA) * 12.4, '#3c2716', 3.6);
  line(ctx, 90, 85, 90 + Math.cos(minA) * 18.4, 85 + Math.sin(minA) * 18.4, '#3c2716', 2.4);
  circle(ctx, 90, 85, 2.6, '#c0392b');

  // Window on the right with night outside and two curtains.
  roundRect(ctx, 442, 56, 98, 158, 4, '#3c2716');
  rect(ctx, 448, 62, 86, 146, '#16294f');
  const rngWin = makeRng(64);
  for (let i = 0; i < 16; i++) starDot(ctx, 452 + rngWin() * 78, 66 + rngWin() * 100, 1.1, 0.4 + rngWin() * 0.5);
  circle(ctx, 512, 88, 11, '#f5f0dc');
  circle(ctx, 516, 84, 9.6, '#16294f');
  line(ctx, 491, 62, 491, 208, '#3c2716', 4);
  line(ctx, 448, 135, 534, 135, '#3c2716', 4);
  rect(ctx, 442, 56, 24, 158, mods.has('curtain-color') ? '#148f77' : '#7d3c98');
  rect(ctx, 516, 56, 24, 158, '#7d3c98');
  rect(ctx, 442, 50, 98, 8, '#2c1c10');

  // Floor lamp left of the chair; the shade changes colour with 'lamp-color'.
  line(ctx, 122, 344, 122, 188, '#2c2c34', 5);
  ellipse(ctx, 122, 348, 17, 4.4, '#2c2c34');
  const shadeCol = mods.has('lamp-color') ? '#c0392b' : '#f5e6c8';
  poly(ctx, [[100, 190], [144, 190], [134, 148], [110, 148]], shadeCol);
  if (!mods.has('lamp-color')) {
    const glow = ctx.createRadialGradient(122, 196, 4, 122, 196, 52);
    glow.addColorStop(0, 'rgba(255,220,150,0.4)');
    glow.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(66, 140, 112, 112);
  }
  rect(ctx, 112, 190, 20, 5, '#e8c96a');

  // Armchair, centre.
  roundRect(ctx, 216, 258, 116, 66, 16, '#a93226');
  roundRect(ctx, 232, 246, 84, 44, 14, '#bc4636');
  roundRect(ctx, 206, 288, 26, 46, 10, '#96281b');
  roundRect(ctx, 316, 288, 26, 46, 10, '#96281b');
  roundRect(ctx, 234, 296, 80, 26, 8, '#c95f4a');
  rect(ctx, 224, 332, 10, 12, '#4a3120');
  rect(ctx, 314, 332, 10, 12, '#4a3120');

  // Rug under the chair: stripes, or dots when 'rug-dots'.
  ctx.beginPath();
  ctx.ellipse(280, 382, 118, 26, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#7d3c98';
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(280, 382, 118, 26, 0, 0, Math.PI * 2);
  ctx.clip();
  if (mods.has('rug-dots')) {
    ctx.fillStyle = '#f1c40f';
    for (let rx = 180; rx < 390; rx += 24)
      for (let ry = 364; ry < 402; ry += 13) circle(ctx, rx + ((ry / 13) % 2) * 12, ry, 3.6, '#f1c40f');
  } else {
    ctx.fillStyle = '#f1c40f';
    for (let rx = 176; rx < 390; rx += 26) ctx.fillRect(rx, 354, 9, 56);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(280, 382, 118, 26, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#5e2a75';
  ctx.lineWidth = 3;
  ctx.stroke();

  // The cat on the rug: asleep with drifting Z's, or wide awake ('cat-awake').
  const awake = mods.has('cat-awake');
  ellipse(ctx, 302, 356, 26, 13, '#5a6472');
  circle(ctx, 326, 348, 11, '#66707c');
  poly(ctx, [[318, 341], [320, 332], [325, 339]], '#66707c');
  poly(ctx, [[330, 339], [335, 332], [336, 341]], '#66707c');
  if (awake) {
    circle(ctx, 322.6, 347, 1.9, '#10151c');
    circle(ctx, 330.4, 347, 1.9, '#10151c');
    ctx.beginPath();
    ctx.arc(340, 344, 13, Math.PI * 1.15, Math.PI * 1.75);
    ctx.strokeStyle = '#5a6472';
    ctx.lineWidth = 4.4;
    ctx.stroke();
  } else {
    line(ctx, 320, 347, 325, 347, '#10151c', 1.8);
    line(ctx, 328, 347, 333, 347, '#10151c', 1.8);
    ctx.fillStyle = 'rgba(240,240,255,0.85)';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('z', 344, 330);
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText('Z', 354, 314);
  }
  ctx.strokeStyle = 'rgba(20,24,30,0.5)';
  ctx.lineWidth = 2;
  for (const sx of [292, 302, 312]) line(ctx, sx, 346, sx + 2, 362, 'rgba(20,24,30,0.5)', 2);

  // Side table with teacups — two cups, or one when 'cups-fewer'.
  roundRect(ctx, 348, 296, 58, 8, 3, '#4a3120');
  rect(ctx, 372, 304, 8, 40, '#4a3120');
  ellipse(ctx, 376, 346, 24, 4.4, 'rgba(0,0,0,0.3)');
  const cup = (x) => {
    poly(ctx, [[x - 8, 282], [x + 8, 282], [x + 6, 294], [x - 6, 294]], '#f7f0da');
    ctx.beginPath();
    ctx.arc(x + 10, 288, 4, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = '#f7f0da';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    rect(ctx, x - 8, 280, 16, 2.6, '#c0392b');
  };
  cup(364);
  if (!mods.has('cups-fewer')) cup(390);

  // Stack of books by the chair: four, or three when 'stack-fewer'.
  const stackCols = ['#2980b9', '#c0392b', '#27ae60', '#f39c12'];
  const stackCount = mods.has('stack-fewer') ? 3 : 4;
  for (let i = 0; i < stackCount; i++) {
    const w = 46 - i * 4;
    roundRect(ctx, 172 - w / 2, 338 - i * 11, w, 10, 2, stackCols[i]);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(172 - w / 2 + 4, 338 - i * 11 + 3, w - 14, 2);
  }

  // Globe on its stand, right of the table.
  line(ctx, 455, 268, 455, 330, '#4a3120', 5);
  ellipse(ctx, 455, 334, 20, 4.6, '#4a3120');
  circle(ctx, 455, 240, 27, mods.has('globe-color') ? '#27ae60' : '#2980b9');
  ctx.fillStyle = mods.has('globe-color') ? '#2980b9' : '#27ae60';
  ellipse(ctx, 444, 230, 9, 6, ctx.fillStyle);
  ellipse(ctx, 466, 248, 10, 7, ctx.fillStyle);
  ellipse(ctx, 452, 254, 6, 4, ctx.fillStyle);
  ctx.beginPath();
  ctx.arc(455, 240, 30, 0, Math.PI * 2);
  ctx.strokeStyle = '#8a6844';
  ctx.lineWidth = 2.6;
  ctx.stroke();
}

// The six scenes, in play order, with the painter for each.
export const SCENES = [
  { id: 'harbor', title: 'Harbor at Dusk', paint: paintHarbor },
  { id: 'cabin', title: 'Forest Cabin', paint: paintCabin },
  { id: 'market', title: 'Fruit Market', paint: paintMarket },
  { id: 'reef', title: 'Underwater Reef', paint: paintReef },
  { id: 'campsite', title: 'Mountain Campsite', paint: paintCampsite },
  { id: 'library', title: 'Cozy Library', paint: paintLibrary },
];
