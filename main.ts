// Second Glance — hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/: plain files a desktop browser
// loads fully offline, no build step and no network. This program delivers it
// the way make.fun expects: it copies game/ and screenshots/ next to this
// file into the output directory and writes dossier.json there with the
// vendored library, so the dossier describes exactly the bytes delivered.
//
// Locally, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Deliver the playable game first, then the maker's screenshots of it.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below mirror the bounty gate: the text cap shapes the dossier's
// bytes; the rest only refuse what the scorer would refuse anyway (too many
// screenshots, an oversized image, a game tree past its file/byte limits or a
// path that is too long), so a bad entry fails here instead of at the gate.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
