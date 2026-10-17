import { useMemo } from 'react';
import logoUrl from '../../assets/logo.jpg';
import { COPY } from '../../data/copy';

const COLORS = ['#3ecf8e', '#e8b84a', '#6ec6ff', '#ff7a59', '#f0f0f0', '#b388ff'];

export function Finale() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        delay: `${(i % 12) * 0.12}s`,
        duration: `${2.4 + (i % 5) * 0.35}s`,
        color: COLORS[i % COLORS.length],
      })),
    [],
  );

  return (
    <section className="panel finale">
      <div className="confetti" aria-hidden="true">
        {pieces.map((p) => (
          <i
            key={p.id}
            style={{
              left: p.left,
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      <img
        className="finale-logo"
        src={logoUrl}
        alt="Емблема агентської місії"
        width={112}
        height={112}
      />
      <h2>{COPY.finale.title}</h2>
      <p>{COPY.finale.body}</p>
    </section>
  );
}
