import { useState, type FormEvent } from 'react';
import { ANSWERS, normalizeCode } from '../../data/answers';
import { COPY } from '../../data/copy';

interface Props {
  onSuccess: () => void;
}

export function CodeEntry({ onSuccess }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (normalizeCode(value) === ANSWERS.missionCode) {
      setError('');
      setOk(true);
      window.setTimeout(onSuccess, 700);
      return;
    }
    setOk(false);
    setError(COPY.errorGeneric);
  }

  return (
    <section className="panel">
      <h2>{COPY.stage1.title}</h2>
      <p>{COPY.stage1.body}</p>
      <form className="field" onSubmit={handleSubmit}>
        <label htmlFor="mission-code">{COPY.stage1.placeholder}</label>
        <input
          id="mission-code"
          autoComplete="off"
          autoCapitalize="characters"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={COPY.stage1.placeholder}
        />
        <button type="submit" className="btn btn-primary">
          {COPY.submit}
        </button>
      </form>
      <div className={`message ${ok ? 'success' : error ? 'error' : ''}`} role="status">
        {ok ? COPY.stage1.success : error}
      </div>
    </section>
  );
}
