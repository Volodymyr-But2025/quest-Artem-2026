import { useState, type FormEvent } from 'react';
import { ANSWERS, normalizeWord } from '../../data/answers';
import { COPY } from '../../data/copy';
import { AlphabetChart } from '../AlphabetChart';

interface Props {
  onSuccess: () => void;
}

export function PianoWord({ onSuccess }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (normalizeWord(value) === ANSWERS.pianoWord) {
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
      <h2>{COPY.stage3.title}</h2>
      <p>{COPY.stage3.body}</p>

      <AlphabetChart
        onPick={(letter) => setValue((v) => v + letter)}
        onBackspace={() => setValue((v) => v.slice(0, -1))}
      />

      <form className="field" onSubmit={handleSubmit}>
        <label htmlFor="piano-word">{COPY.stage3.placeholder}</label>
        <input
          id="piano-word"
          autoComplete="off"
          autoCapitalize="characters"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={COPY.stage3.placeholder}
        />
        <button type="submit" className="btn btn-primary">
          {COPY.submit}
        </button>
      </form>
      <div className={`message ${ok ? 'success' : error ? 'error' : ''}`} role="status">
        {ok ? COPY.stage3.success : error}
      </div>
    </section>
  );
}
