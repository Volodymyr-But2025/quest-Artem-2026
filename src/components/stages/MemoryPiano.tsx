import { useEffect, useRef, useState } from 'react';
import { ANSWERS } from '../../data/answers';
import { COPY } from '../../data/copy';
import { getAudioContext, playBuzz, playMelody, playPianoKey } from '../../utils/beep';
import { MELODY_ROUNDS, NOTE_KEYS, NOTE_LABELS, type NoteKey } from '../../utils/notes';

interface Props {
  onSuccess: () => void;
}

type Mode = 'setup' | 'challenge' | 'reveal';
type Phase = 'ready' | 'playing' | 'listening' | 'roundOk' | 'done';

export function MemoryPiano({ onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('setup');
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [matched, setMatched] = useState(0);
  const [activeKey, setActiveKey] = useState<NoteKey | null>(null);
  const [message, setMessage] = useState<string>(COPY.stage4.practiceHint);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoIndex, setDemoIndex] = useState<number | null>(null);

  const matchedRef = useRef(0);
  const phaseRef = useRef<Phase>('ready');
  const modeRef = useRef<Mode>('setup');
  const roundRef = useRef(0);

  const target = MELODY_ROUNDS[roundIndex];

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    roundRef.current = roundIndex;
    matchedRef.current = 0;
    setMatched(0);
  }, [roundIndex]);

  function goToReveal() {
    setMode('reveal');
    modeRef.current = 'reveal';
    setPhase('done');
    phaseRef.current = 'done';
    setMessage(COPY.stage4.melodiesDone);
  }

  function previewKey(key: NoteKey) {
    const ctx = getAudioContext();
    if (ctx) void ctx.resume();
    setActiveKey(key);
    window.setTimeout(() => setActiveKey(null), 180);
    playPianoKey(key);
    if (mode === 'setup') {
      setMessage(`${COPY.stage4.noteHeard}: ${NOTE_LABELS[key]} (${key})`);
    }
  }

  function onKeyClick(key: NoteKey) {
    if (mode === 'reveal') return;
    if (phase === 'playing' || phase === 'done' || phase === 'roundOk') return;

    if (mode === 'setup' || phase === 'ready') {
      previewKey(key);
      return;
    }

    if (phase === 'listening') {
      acceptNote(key);
    }
  }

  function acceptNote(note: NoteKey) {
    if (phaseRef.current !== 'listening') return;

    const expected = MELODY_ROUNDS[roundRef.current];
    const idx = matchedRef.current;
    const want = expected[idx];

    setActiveKey(note);
    window.setTimeout(() => setActiveKey(null), 180);
    playPianoKey(note);

    if (note !== want) {
      playBuzz();
      matchedRef.current = 0;
      setMatched(0);
      setMessage(COPY.stage4.wrong);
      setPhase('ready');
      phaseRef.current = 'ready';
      return;
    }

    const next = idx + 1;
    matchedRef.current = next;
    setMatched(next);
    setMessage(`${COPY.stage4.progress}: ${next} / ${expected.length}`);

    if (next >= expected.length) {
      finishRound();
    }
  }

  function finishRound() {
    const isLast = roundRef.current >= MELODY_ROUNDS.length - 1;
    if (isLast) {
      goToReveal();
      return;
    }

    setPhase('roundOk');
    phaseRef.current = 'roundOk';
    setMessage(COPY.stage4.roundDone);
    window.setTimeout(() => {
      setRoundIndex((r) => r + 1);
      setPhase('ready');
      phaseRef.current = 'ready';
      setMessage(COPY.stage4.practiceHint);
    }, 1100);
  }

  async function playDemoMelody(index: number) {
    if (demoPlaying || phase === 'playing') return;
    const melody = MELODY_ROUNDS[index];
    if (!melody) return;

    const ctx = getAudioContext();
    if (ctx) void ctx.resume();
    setDemoPlaying(true);
    setDemoIndex(index);
    setMessage(`${COPY.stage4.listeningDemo} (${COPY.stage4.melodyN} ${index + 1})…`);
    await playMelody(melody, 480, 160);
    setDemoPlaying(false);
    setDemoIndex(null);
    setMessage(COPY.stage4.practiceHint);
  }

  async function handlePlay() {
    if (phase === 'playing' || phase === 'done' || demoPlaying || mode === 'reveal') return;

    const ctx = getAudioContext();
    if (ctx) void ctx.resume();

    setPhase('playing');
    phaseRef.current = 'playing';
    setMessage('Слухай мелодію…');
    matchedRef.current = 0;
    setMatched(0);

    await playMelody(target, 480, 160);

    setPhase('listening');
    phaseRef.current = 'listening';
    setMessage(COPY.stage4.yourTurn);
  }

  function parentSkipRound() {
    if (mode !== 'challenge') return;
    if (phase === 'done' || phase === 'playing') return;
    finishRound();
  }

  function startChallenge() {
    setMode('challenge');
    modeRef.current = 'challenge';
    setRoundIndex(0);
    setPhase('ready');
    phaseRef.current = 'ready';
    setMatched(0);
    matchedRef.current = 0;
    setMessage('Натисни «Прослухати мелодію», запам’ятай і повтори на екрані.');
  }

  function backToSetup() {
    if (phase === 'playing') return;
    setMode('setup');
    modeRef.current = 'setup';
    setPhase('ready');
    phaseRef.current = 'ready';
    setRoundIndex(0);
    setMatched(0);
    setMessage(COPY.stage4.practiceHint);
  }

  const keysDisabled =
    mode === 'reveal' || phase === 'playing' || phase === 'done' || phase === 'roundOk' || demoPlaying;
  const challengeBusy = phase === 'playing' || phase === 'done' || phase === 'roundOk' || demoPlaying;

  if (mode === 'reveal') {
    return (
      <section className="panel">
        <h2>{COPY.stage4.title}</h2>
        <p className="message success">{COPY.stage4.melodiesDone}</p>

        <div className="secret-number-box" aria-live="polite">
          <div className="setup-title">{COPY.stage4.revealTitle}</div>
          <div className="secret-number">{ANSWERS.pianoKeyNumber}</div>
          <p>{COPY.stage4.revealBody}</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={onSuccess}>
          {COPY.continue}
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>{COPY.stage4.title}</h2>
      <p>{COPY.stage4.body}</p>

      {mode === 'setup' && (
        <div className="setup-box">
          <div className="setup-title">{COPY.stage4.setupTitle}</div>
          <ol className="howto">
            <li className="setup-done">{COPY.stage4.stepPractice}</li>
            <li className="setup-done">{COPY.stage4.stepDemos}</li>
            <li>{COPY.stage4.stepStart}</li>
          </ol>

          <div className="demo-block">
            <div className="setup-title">{COPY.stage4.demosTitle}</div>
            <div className="demo-melody-row">
              {MELODY_ROUNDS.map((melody, i) => (
                <button
                  key={i}
                  type="button"
                  className={`btn btn-secondary${demoIndex === i ? ' demo-playing' : ''}`}
                  onClick={() => void playDemoMelody(i)}
                  disabled={demoPlaying}
                >
                  {COPY.stage4.melodyN} {i + 1}
                  <span className="demo-melody-len">
                    {melody.length} {COPY.stage4.notesLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="setup-actions">
            <button type="button" className="btn btn-primary" onClick={startChallenge}>
              {COPY.stage4.startTest}
            </button>
          </div>
        </div>
      )}

      {mode === 'challenge' && (
        <>
          <div className="melody-meta">
            <strong>
              {COPY.stage4.roundLabel} {roundIndex + 1} / {MELODY_ROUNDS.length}
            </strong>
            <span>
              {target.length} {COPY.stage4.notesLabel}
            </span>
          </div>

          <div className="melody-dots" aria-label="Прогрес нот">
            {target.map((_, i) => (
              <span key={i} className={`melody-dot${i < matched ? ' on' : ''}`} />
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handlePlay()}
            disabled={challengeBusy}
          >
            {phase === 'listening' ? COPY.stage4.replay : COPY.stage4.play}
          </button>

          {phase === 'ready' && (
            <p className="message hint">Спочатку натисни «Прослухати мелодію», потім повтори.</p>
          )}

          <div className="setup-actions">
            <button type="button" className="btn btn-ghost" onClick={backToSetup} disabled={phase === 'playing'}>
              {COPY.stage4.backToPractice}
            </button>
          </div>
        </>
      )}

      <div className="piano" role="group" aria-label="Клавіші піаніно">
        {NOTE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`piano-key ${activeKey === key ? 'active' : ''}`}
            onClick={() => onKeyClick(key)}
            disabled={keysDisabled}
            aria-label={NOTE_LABELS[key]}
          >
            <span className="piano-key-num">{key}</span>
            <span className="piano-key-name">{NOTE_LABELS[key]}</span>
          </button>
        ))}
      </div>

      <div
        className={`message ${
          phase === 'roundOk'
            ? 'success'
            : message === COPY.stage4.wrong
              ? 'error'
              : ''
        }`}
        role="status"
      >
        {message}
      </div>

      {mode === 'challenge' && (
        <div className="parent-skip-zone">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={parentSkipRound}
            disabled={phase === 'done'}
          >
            {COPY.stage4.parentSkip}
          </button>
        </div>
      )}
    </section>
  );
}
