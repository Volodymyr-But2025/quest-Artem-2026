import { useState, type FormEvent } from 'react';
import { ANSWERS, normalizeWord } from '../../data/answers';
import { COPY } from '../../data/copy';
import { AlphabetChart } from '../AlphabetChart';

interface Props {
  onSuccess: () => void;
}

export function CipherWheel({ onSuccess }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (normalizeWord(value) === ANSWERS.wheelWord) {
      setError('');
      setOk(true);
      window.setTimeout(onSuccess, 900);
      return;
    }
    setOk(false);
    setError(COPY.errorGeneric);
  }

  return (
    <section className="panel">
      <h2>{COPY.stage2.title}</h2>
      <p>{COPY.stage2.body}</p>

      <AlphabetChart
        onPick={(letter) => setValue((v) => v + letter)}
        onBackspace={() => setValue((v) => v.slice(0, -1))}
      />

      <form className="field" onSubmit={handleSubmit}>
        <label htmlFor="wheel-word">{COPY.stage2.placeholder}</label>
        <input
          id="wheel-word"
          autoComplete="off"
          autoCapitalize="characters"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={COPY.stage2.placeholder}
        />
        <button type="submit" className="btn btn-primary">
          {COPY.submit}
        </button>
      </form>
      <div className={`message ${ok ? 'success' : error ? 'error' : ''}`} role="status">
        {ok ? COPY.stage2.success : error}
      </div>
    </section>
  );
}
