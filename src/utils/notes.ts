/** Білі клавіші: 1=До, 2=Ре, 3=Мі, 4=Фа, 5=Соль (октава 4) */
export const NOTE_KEYS = [1, 2, 3, 4, 5] as const;
export type NoteKey = (typeof NOTE_KEYS)[number];

export const NOTE_LABELS: Record<NoteKey, string> = {
  1: 'До',
  2: 'Ре',
  3: 'Мі',
  4: 'Фа',
  5: 'Соль',
};

export const NOTE_FREQ: Record<NoteKey, number> = {
  1: 261.63,
  2: 293.66,
  3: 329.63,
  4: 349.23,
  5: 392.0,
};

/** Три різні мелодії: 3 → 4 → 5 нот (кнопки 1–5 = До Ре Мі Фа Соль) */
export const MELODY_ROUNDS: NoteKey[][] = [
  [1, 4, 5], // раунд 1 (3 ноти): як ти сказав
  [4, 3, 5, 2], // раунд 2 (4 ноти): 4–3–5 + 2
  [3, 2, 4, 1, 5], // раунд 3 (5 нот): 3–2–4–1 + 5
];

/** Привести частоту до найближчої ноти шкали (з урахуванням октав). */
export function freqToNoteKey(freq: number, toleranceCents = 60): NoteKey | null {
  if (!Number.isFinite(freq) || freq < 70 || freq > 1400) return null;

  let best: NoteKey | null = null;
  let bestCents = Infinity;

  for (const key of NOTE_KEYS) {
    const base = NOTE_FREQ[key];
    // порівняти з кількома октавами
    for (let oct = -1; oct <= 2; oct += 1) {
      const target = base * 2 ** oct;
      const cents = Math.abs(1200 * Math.log2(freq / target));
      if (cents < bestCents) {
        bestCents = cents;
        best = key;
      }
    }
  }

  return bestCents <= toleranceCents ? best : null;
}
