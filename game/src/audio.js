// Second Glance — sound, synthesized live with WebAudio. No audio files:
// every effect is a small envelope of oscillators shaped in code, so the game
// stays fully self-contained. The context is created lazily on the first
// user gesture, as browsers require, and every call is safe when audio is
// unavailable (headless runs, muted tabs): failures are swallowed quietly.

let ctx = null;
let master = null;
let unlocked = false; // set by unlockAudio() on the first real user gesture

function ensureContext() {
  if (!unlocked) return null;
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

// One shaped tone: frequency glide plus a gain envelope, started at `when`.
function tone({ freq = 440, freqEnd = null, type = 'sine', dur = 0.18, vol = 0.3, delay = 0 }) {
  const ac = ensureContext();
  if (!ac || !master) return;
  try {
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    /* audio is decoration; never break the game for it */
  }
}

// A found difference: a bright two-note chime with a sparkle on top.
export function playFind() {
  tone({ freq: 1318, type: 'sine', dur: 0.16, vol: 0.28 });
  tone({ freq: 1760, type: 'sine', dur: 0.24, vol: 0.24, delay: 0.07 });
  tone({ freq: 2637, type: 'triangle', dur: 0.3, vol: 0.1, delay: 0.07 });
}

// A wrong click: a short dull buzz that slides down.
export function playWrong() {
  tone({ freq: 196, freqEnd: 130, type: 'square', dur: 0.16, vol: 0.16 });
  tone({ freq: 147, freqEnd: 110, type: 'square', dur: 0.2, vol: 0.12, delay: 0.05 });
}

// A hint: one soft blip, gentle so it feels like help, not an alarm.
export function playHint() {
  tone({ freq: 880, freqEnd: 1174, type: 'sine', dur: 0.18, vol: 0.18 });
}

// The last-seconds countdown tick.
export function playTick() {
  tone({ freq: 1046, type: 'square', dur: 0.05, vol: 0.07 });
}

// Scene complete: a small rising arpeggio.
export function playComplete() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((freq, i) => tone({ freq, type: 'triangle', dur: 0.22, vol: 0.22, delay: i * 0.09 }));
}

// The final win: a longer jingle with a warm finish.
export function playWin() {
  const notes = [523, 659, 784, 1046, 784, 1046, 1318];
  notes.forEach((freq, i) => tone({ freq, type: 'triangle', dur: 0.3, vol: 0.22, delay: i * 0.11 }));
  tone({ freq: 262, type: 'sine', dur: 0.7, vol: 0.12, delay: 0.2 });
}

// Time ran out: two descending tones.
export function playGameOver() {
  tone({ freq: 392, freqEnd: 330, type: 'triangle', dur: 0.25, vol: 0.2 });
  tone({ freq: 330, freqEnd: 262, type: 'triangle', dur: 0.4, vol: 0.2, delay: 0.2 });
}

// Unlock audio on the first pointer or key interaction (called from the
// input wiring); until then every effect quietly does nothing.
export function unlockAudio() {
  unlocked = true;
  ensureContext();
}
