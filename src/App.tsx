import { Shell } from './components/Shell';
import { StageGate } from './components/StageGate';
import { useMission } from './state/useMission';

export default function App() {
  const { stage, safeFails, advance, recordSafeFail, resetMission, goToStage } =
    useMission();

  return (
    <Shell stage={stage} onReset={resetMission} onGoToStage={goToStage}>
      <StageGate
        key={stage}
        stage={stage}
        safeFails={safeFails}
        onAdvance={advance}
        onSafeFail={recordSafeFail}
      />
    </Shell>
  );
}
