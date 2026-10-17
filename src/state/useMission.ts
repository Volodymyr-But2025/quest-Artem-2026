import { useCallback, useEffect, useState } from 'react';

export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface MissionState {
  stage: Stage;
  safeFails: number;
}

const STORAGE_KEY = 'artem-mission-v3';

const DEFAULT_STATE: MissionState = {
  stage: 1,
  safeFails: 0,
};

function loadState(): MissionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<MissionState>;
    const stage = Number(parsed.stage);
    if (stage < 1 || stage > 8) return DEFAULT_STATE;
    return {
      stage: stage as Stage,
      safeFails: Number(parsed.safeFails) || 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useMission() {
  const [state, setState] = useState<MissionState>(() => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const advance = useCallback(() => {
    setState((prev) => {
      if (prev.stage >= 8) return prev;
      return { ...prev, stage: (prev.stage + 1) as Stage };
    });
  }, []);

  const recordSafeFail = useCallback(() => {
    setState((prev) => ({ ...prev, safeFails: prev.safeFails + 1 }));
  }, []);

  const resetMission = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const goToStage = useCallback((stage: Stage) => {
    setState({ stage, safeFails: 0 });
  }, []);

  return {
    stage: state.stage,
    safeFails: state.safeFails,
    advance,
    recordSafeFail,
    resetMission,
    goToStage,
  };
}
