import type { ReactNode } from 'react';
import logoUrl from '../assets/logo.jpg';
import { PARENT_STAGE_JUMP } from '../config';
import { COPY } from '../data/copy';
import type { Stage } from '../state/useMission';

interface ShellProps {
  stage: Stage;
  onReset: () => void;
  onGoToStage?: (stage: Stage) => void;
  children: ReactNode;
}

const JUMP_STAGES: Array<{ stage: Stage; label: string }> = [
  { stage: 1, label: '1' },
  { stage: 2, label: '2' },
  { stage: 3, label: '3' },
  { stage: 4, label: '4' },
  { stage: 5, label: '5' },
  { stage: 6, label: '6' },
  { stage: 7, label: '7' },
  { stage: 8, label: 'Ф' },
];

export function Shell({ stage, onReset, onGoToStage, children }: ShellProps) {
  const stageLabel = stage === 8 ? 'Фінал' : `Етап ${stage} / 7`;

  return (
    <div className="app-shell">
      <header className="shell-header">
        <div className="shell-brand">
          <img
            className="shell-logo"
            src={logoUrl}
            alt="Емблема агентської місії"
            width={72}
            height={72}
          />
          <div className="shell-brand-text">
            <div className="shell-eyebrow">{COPY.agentLabel}</div>
            <h1 className="shell-title">{COPY.appTitle}</h1>
            <div className="shell-stage">{stageLabel}</div>
          </div>
        </div>
      </header>

      <main className="shell-main">{children}</main>

      <footer className="shell-footer">
        {PARENT_STAGE_JUMP && onGoToStage && (
          <div className="parent-jump" aria-label="Батьківський перемикач етапів">
            <div className="parent-jump-label">Батьки: етап</div>
            <div className="parent-jump-row">
              {JUMP_STAGES.map((item) => (
                <button
                  key={item.stage}
                  type="button"
                  className={`parent-jump-btn${stage === item.stage ? ' active' : ''}`}
                  onClick={() => onGoToStage(item.stage)}
                  aria-current={stage === item.stage ? 'step' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <button type="button" className="btn btn-ghost" onClick={onReset}>
          {COPY.resetMission}
        </button>
      </footer>
    </div>
  );
}
