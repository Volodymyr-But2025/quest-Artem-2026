import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ANSWERS, normalizeDigits } from '../../data/answers';
import { COPY } from '../../data/copy';
import { playBuzz, playTone } from '../../utils/beep';

interface Props {
  safeFails: number;
  onFail: () => void;
  onSuccess: () => void;
}

function playLockOpen() {
  playTone(523, 90, 0.08);
  window.setTimeout(() => playTone(659, 120, 0.09), 70);
}

export function TripleSafe({ safeFails, onFail, onSuccess }: Props) {
  const [lockA, setLockA] = useState('');
  const [lockB, setLockB] = useState('');
  const [lockC, setLockC] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const aOpen = normalizeDigits(lockA) === ANSWERS.safeA;
  const bOpen = normalizeDigits(lockB) === ANSWERS.safeB;
  const cOpen = normalizeDigits(lockC) === ANSWERS.safeC;
  const allOpen = aOpen && bOpen && cOpen;

  const prevOpen = useRef({ a: false, b: false, c: false });

  useEffect(() => {
    const prev = prevOpen.current;
    if ((!prev.a && aOpen) || (!prev.b && bOpen) || (!prev.c && cOpen)) {
      playLockOpen();
    }
    prevOpen.current = { a: aOpen, b: bOpen, c: cOpen };
  }, [aOpen, bOpen, cOpen]);

  const hintsUnlocked = safeFails >= 3;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!allOpen) {
      playBuzz();
      setOk(false);
      setError(COPY.safeFail);
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      onFail();
      return;
    }

    setError('');
    setOk(true);
    window.setTimeout(onSuccess, 800);
  }

  return (
    <section className="panel">
      <h2>{COPY.stage7.title}</h2>
      <p>{COPY.stage7.body}</p>

      <form className={`safe-form ${shake ? 'shake' : ''}`} onSubmit={handleSubmit}>
        <div className={`safe-lock ${aOpen ? 'safe-lock--open' : ''}`}>
          <div className="safe-lock-head">
            <span className="safe-lock-dot" aria-hidden="true" />
            <label htmlFor="lock-a">{COPY.stage7.lockA}</label>
            {aOpen && <span className="safe-lock-badge">{COPY.stage7.lockOpen}</span>}
          </div>
          <p className="safe-lock-hint">{COPY.stage7.protocolA}</p>
          <input
            id="lock-a"
            inputMode="numeric"
            autoComplete="off"
            value={lockA}
            onChange={(e) => setLockA(e.target.value)}
          />
        </div>

        <div className={`safe-lock ${bOpen ? 'safe-lock--open' : ''}`}>
          <div className="safe-lock-head">
            <span className="safe-lock-dot" aria-hidden="true" />
            <label htmlFor="lock-b">{COPY.stage7.lockB}</label>
            {bOpen && <span className="safe-lock-badge">{COPY.stage7.lockOpen}</span>}
          </div>
          <p className="safe-lock-hint">{COPY.stage7.protocolB}</p>
          <input
            id="lock-b"
            inputMode="numeric"
            autoComplete="off"
            value={lockB}
            onChange={(e) => setLockB(e.target.value)}
          />
        </div>

        <div className={`safe-lock ${cOpen ? 'safe-lock--open' : ''}`}>
          <div className="safe-lock-head">
            <span className="safe-lock-dot" aria-hidden="true" />
            <label htmlFor="lock-c">{COPY.stage7.lockC}</label>
            {cOpen && <span className="safe-lock-badge">{COPY.stage7.lockOpen}</span>}
          </div>
          <p className="safe-lock-hint">{COPY.stage7.protocolC}</p>
          <input
            id="lock-c"
            inputMode="numeric"
            autoComplete="off"
            value={lockC}
            onChange={(e) => setLockC(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${allOpen && !ok ? 'btn-pulse' : ''}`}
          disabled={ok}
        >
          {COPY.openSafe}
        </button>
      </form>

      <div className={`message ${ok ? 'success' : error ? 'error' : ''}`} role="status">
        {ok ? COPY.stage7.success : error}
      </div>

      {hintsUnlocked && (
        <div className="field">
          {!showHints ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowHints(true)}
            >
              {COPY.hintButton}
            </button>
          ) : (
            <div className="message hint" role="note">
              <div>A: {COPY.stage7.hintA}</div>
              <div>B: {COPY.stage7.hintB}</div>
              <div>C: {COPY.stage7.hintC}</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
