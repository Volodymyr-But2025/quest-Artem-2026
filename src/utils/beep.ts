import { NOTE_FREQ, type NoteKey } from './notes';

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

export function playTone(frequency: number, durationMs = 180, gainValue = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.value = gainValue;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  osc.start(now);
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
  osc.stop(now + durationMs / 1000);
}

export function playBuzz() {
  playTone(120, 220, 0.12);
}

/** М’який синтез «піаніно»: фундаментал + обертони, коротка атака й спад. */
export function playPianoKey(key: number, durationMs = 520) {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume();
  const freq = NOTE_FREQ[key as NoteKey] ?? 300;
  const now = ctx.currentTime;
  const dur = durationMs / 1000;
  const master = ctx.createGain();
  master.connect(ctx.destination);

  // Атака → спад → довгий release (схоже на удар молоточка)
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
  master.gain.exponentialRampToValueAtTime(0.09, now + 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  const partials: Array<{ mult: number; type: OscillatorType; gain: number }> = [
    { mult: 1, type: 'triangle', gain: 1 },
    { mult: 2, type: 'sine', gain: 0.35 },
    { mult: 3, type: 'sine', gain: 0.12 },
  ];

  for (const p of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = freq * p.mult;
    g.gain.value = p.gain;
    osc.connect(g);
    g.connect(master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }
}

export async function playMelody(keys: readonly number[], noteMs = 480, gapMs = 140) {
  for (const key of keys) {
    playPianoKey(key, noteMs + 40);
    await wait(noteMs + gapMs);
  }
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Тривожний мінорний loop для лабіринту Керота (A–F–E–F). */
export type TensionIntensity = 'go' | 'return';

const TENSION_FREQS = [220, 174.61, 164.81, 174.61] as const;

let tensionTimer: number | null = null;
let tensionIntensity: TensionIntensity | null = null;

function playTensionNote(ctx: AudioContext, freq: number, startAt: number, durSec: number, gainValue: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durSec);
  osc.start(startAt);
  osc.stop(startAt + durSec + 0.02);
}

export function stopTensionLoop() {
  if (tensionTimer !== null) {
    window.clearInterval(tensionTimer);
    tensionTimer = null;
  }
  tensionIntensity = null;
}

export function startTensionLoop(intensity: TensionIntensity) {
  if (tensionIntensity === intensity && tensionTimer !== null) return;

  stopTensionLoop();
  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume();
  tensionIntensity = intensity;

  const noteMs = intensity === 'return' ? 130 : 190;
  const gapMs = intensity === 'return' ? 35 : 70;
  const gainValue = intensity === 'return' ? 0.09 : 0.045;
  const stepSec = (noteMs + gapMs) / 1000;
  const periodMs = (noteMs + gapMs) * TENSION_FREQS.length;

  function playCycle() {
    const c = getAudioContext();
    if (!c) return;
    let t = c.currentTime + 0.02;
    for (const freq of TENSION_FREQS) {
      playTensionNote(c, freq, t, noteMs / 1000, gainValue);
      t += stepSec;
    }
  }

  playCycle();
  tensionTimer = window.setInterval(playCycle, periodMs);
}
