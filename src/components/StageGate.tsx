import type { Stage } from '../state/useMission';
import { CipherWheel } from './stages/CipherWheel';
import { CodeEntry } from './stages/CodeEntry';
import { Finale } from './stages/Finale';
import { Maze } from './stages/Maze';
import { MemoryPiano } from './stages/MemoryPiano';
import { PatronWord } from './stages/PatronWord';
import { PianoWord } from './stages/PianoWord';
import { TripleSafe } from './stages/TripleSafe';

interface Props {
  stage: Stage;
  safeFails: number;
  onAdvance: () => void;
  onSafeFail: () => void;
}

export function StageGate({ stage, safeFails, onAdvance, onSafeFail }: Props) {
  switch (stage) {
    case 1:
      return <CodeEntry onSuccess={onAdvance} />;
    case 2:
      return <CipherWheel onSuccess={onAdvance} />;
    case 3:
      return <PianoWord onSuccess={onAdvance} />;
    case 4:
      return <MemoryPiano onSuccess={onAdvance} />;
    case 5:
      return <PatronWord onSuccess={onAdvance} />;
    case 6:
      return <Maze onSuccess={onAdvance} />;
    case 7:
      return (
        <TripleSafe
          safeFails={safeFails}
          onFail={onSafeFail}
          onSuccess={onAdvance}
        />
      );
    case 8:
      return <Finale />;
    default:
      return <CodeEntry onSuccess={onAdvance} />;
  }
}
