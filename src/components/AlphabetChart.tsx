import { ALPHABET } from '../data/answers';
import { COPY } from '../data/copy';

interface Props {
  alphabetLabel?: string;
  onPick?: (letter: string) => void;
  onBackspace?: () => void;
}

export function AlphabetChart({
  alphabetLabel = COPY.stage2.alphabetLabel,
  onPick,
  onBackspace,
}: Props) {
  const interactive = Boolean(onPick);

  return (
    <div className="field">
      <span>{alphabetLabel}</span>
      {interactive && (
        <p className="alphabet-hint">Клацни клітинку — літера з’явиться в полі слова.</p>
      )}
      <div className="alphabet-grid" aria-label={alphabetLabel} role={interactive ? 'group' : undefined}>
        {ALPHABET.map((letter, i) => {
          const num = i + 1;
          if (!interactive) {
            return (
              <div className="alphabet-cell" key={letter}>
                <strong>{letter}</strong>
                <span>{num}</span>
              </div>
            );
          }

          return (
            <button
              type="button"
              className="alphabet-cell alphabet-cell--btn"
              key={letter}
              onClick={() => onPick?.(letter)}
              aria-label={`${num}: ${letter}`}
            >
              <strong>{letter}</strong>
              <span>{num}</span>
            </button>
          );
        })}
      </div>
      {onBackspace && (
        <button type="button" className="btn btn-secondary alphabet-backspace" onClick={onBackspace}>
          ⌫ Стерти літеру
        </button>
      )}
    </div>
  );
}
