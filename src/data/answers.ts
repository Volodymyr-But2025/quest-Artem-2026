/** Українська абетка без Ґ (32 літери) */
export const ALPHABET =
  'АБВГДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ'.split('');

export const LETTER_TO_NUM: Record<string, number> = Object.fromEntries(
  ALPHABET.map((letter, i) => [letter, i + 1]),
);

export const NUM_TO_LETTER: Record<number, string> = Object.fromEntries(
  ALPHABET.map((letter, i) => [i + 1, letter]),
);

export const ANSWERS = {
  missionCode: 'ARTEM2026',
  wheelWord: 'ШАФА',
  wheelNumbers: [28, 1, 24, 1],
  pianoWord: 'ПІАНІНО',
  pianoNumbers: [19, 11, 1, 17, 11, 17, 18],
  /** Після 3 мелодій у терміналі з’являється; на картці 4 — як X */
  pianoKeyNumber: 15,
  /** Картка 4: X=15 → 14,6,20,18,22 → КЕРОТ */
  patronWord: 'КЕРОТ',
  patronNumbers: [14, 6, 20, 18, 22],
  /** Канонічна мелодія (запасний код) */
  pianoSequence: [1, 3, 5, 2] as const,
  mazeTarget: '5',
  /** Стікери: Рис=7, Горох=3, Гречка=9 */
  safeA: '739',
  /** Холодильник: Верх=1, Середина=2, Низ=8 */
  safeB: '128',
  /** Шухляда: 67 × сигнал Керота (5) = 335 */
  safeC: '335',
} as const;

export function normalizeWord(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeDigits(value: string): string {
  return value.trim().replace(/\s+/g, '').replace(/-/g, '');
}
