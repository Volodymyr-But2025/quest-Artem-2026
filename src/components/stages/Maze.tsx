import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COPY } from "../../data/copy";
import { playBuzz, startTensionLoop, stopTensionLoop } from "../../utils/beep";

interface Props {
  onSuccess: () => void;
}

/** 0 стіна, 1 шлях, 2 крихка клітинка (зникає після виходу), 5 ціль */
const BASE_GRID: number[][] = [
  [1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 2, 0, 1, 1, 1, 0, 2, 1, 1],
  [1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1],
  [2, 0, 2, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1],
  [1, 0, 1, 0, 2, 0, 1, 0, 0, 0, 0],
  [1, 0, 2, 1, 1, 0, 1, 1, 2, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 5],
];

const START = { r: 0, c: 0 };
const ROWS = BASE_GRID.length;
const COLS = BASE_GRID[0].length;
const GO_TIME = 90;
const RETURN_TIME = 30;
const MAX_LIVES = 3;
const VISION_RADIUS = 2;

type Dir = "up" | "down" | "left" | "right";
type Status = "idle" | "playing" | "won" | "lost";
type Phase = "go" | "return";

const DELTA: Record<Dir, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

function inVision(r: number, c: number, pos: { r: number; c: number }) {
  return Math.max(Math.abs(r - pos.r), Math.abs(c - pos.c)) <= VISION_RADIUS;
}

export function Maze({ onSuccess }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<Phase>("go");
  const [pos, setPos] = useState(START);
  const [vanished, setVanished] = useState<Set<string>>(() => new Set());
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set([cellKey(START.r, START.c)]),
  );
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(GO_TIME);
  const [bump, setBump] = useState(false);
  const [message, setMessage] = useState<string>(COPY.stage6.hint);
  const advancedRef = useRef(false);

  const grid = useMemo(() => BASE_GRID, []);

  useEffect(() => {
    if (status !== "won") return;
    const id = window.setTimeout(onSuccess, 1400);
    return () => window.clearTimeout(id);
  }, [status, onSuccess]);

  useEffect(() => {
    if (status !== "playing") {
      stopTensionLoop();
      return;
    }
    startTensionLoop(phase);
    return () => stopTensionLoop();
  }, [status, phase]);

  const resetRun = useCallback((next: Status = "idle") => {
    setPos(START);
    setVanished(new Set());
    setVisited(new Set([cellKey(START.r, START.c)]));
    setPhase("go");
    setTimeLeft(GO_TIME);
    setBump(false);
    setStatus(next);
    setMessage(next === "playing" ? COPY.stage6.playingHint : COPY.stage6.hint);
  }, []);

  const restartGame = useCallback(() => {
    advancedRef.current = false;
    setLives(MAX_LIVES);
    resetRun("idle");
    setMessage(COPY.stage6.hint);
  }, [resetRun]);

  const failRun = useCallback((reason: string) => {
    playBuzz();
    stopTensionLoop();
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setStatus("lost");
        setMessage(COPY.stage6.gameOver);
      } else {
        setStatus("idle");
        setPos(START);
        setVanished(new Set());
        setVisited(new Set([cellKey(START.r, START.c)]));
        setPhase("go");
        setTimeLeft(GO_TIME);
        setMessage(
          `${reason} ${COPY.stage6.livesLeft}: ${next}. ${COPY.stage6.tryAgain}`,
        );
      }
      return Math.max(0, next);
    });
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    if (timeLeft <= 0) {
      failRun(phase === "return" ? COPY.stage6.boom : COPY.stage6.timeUp);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [status, timeLeft, failRun, phase]);

  const isBlocked = useCallback(
    (r: number, c: number) => {
      if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return true;
      if (vanished.has(cellKey(r, c))) return true;
      return grid[r][c] === 0;
    },
    [grid, vanished],
  );

  const tryMove = useCallback(
    (dir: Dir) => {
      if (status !== "playing" || advancedRef.current) return;
      const { dr, dc } = DELTA[dir];
      const nr = pos.r + dr;
      const nc = pos.c + dc;

      if (isBlocked(nr, nc)) {
        setBump(true);
        window.setTimeout(() => setBump(false), 180);
        return;
      }

      if (grid[pos.r][pos.c] === 2) {
        setVanished((v) => new Set(v).add(cellKey(pos.r, pos.c)));
      }

      setPos({ r: nr, c: nc });
      setVisited((v) => new Set(v).add(cellKey(nr, nc)));

      if (phase === "go" && grid[nr][nc] === 5) {
        setPhase("return");
        setTimeLeft(RETURN_TIME);
        setMessage(COPY.stage6.signalGot);
        return;
      }

      if (phase === "return" && nr === START.r && nc === START.c) {
        advancedRef.current = true;
        setStatus("won");
        setMessage(COPY.stage6.success);
      }
    },
    [status, pos, isBlocked, grid, phase],
  );

  useEffect(() => {
    if (status !== "playing") return;

    function onKey(e: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      tryMove(dir);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, tryMove]);

  function startGame() {
    if (status === "won") return;
    if (lives <= 0) {
      restartGame();
      return;
    }
    advancedRef.current = false;
    resetRun("playing");
  }

  const timerDanger =
    status === "playing" && (phase === "return" || timeLeft <= 10);

  return (
    <section className="panel">
      <h2>{COPY.stage6.title}</h2>
      <p>{COPY.stage6.body}</p>

      <ol className="howto">
        <li>{COPY.stage6.step1}</li>
        <li>{COPY.stage6.step2}</li>
        <li>{COPY.stage6.step3}</li>
      </ol>

      <div className="maze-hud">
        <div className={`maze-timer${timerDanger ? " danger" : ""}`}>
          ⏱ {timeLeft}s
        </div>
        <div className="maze-phase" aria-live="polite">
          {status === "playing"
            ? phase === "return"
              ? COPY.stage6.phaseReturn
              : COPY.stage6.phaseGo
            : COPY.stage6.phaseIdle}
        </div>
        <div className="maze-lives">
          {COPY.stage6.lives}: {"♥".repeat(lives)}
          {"♡".repeat(Math.max(0, MAX_LIVES - lives))}
        </div>
      </div>

      <div
        className={`maze maze-play maze-dense ${bump ? "maze-bump" : ""}`}
        role="application"
        aria-label="Лабіринт Керота"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {grid.flatMap((row, r) =>
          row.map((cell, c) => {
            const key = cellKey(r, c);
            const gone = vanished.has(key);
            const isPlayer = pos.r === r && pos.c === c;
            const visible = inVision(r, c, pos);
            const remembered = visited.has(key);
            const revealed = visible || remembered;

            if (!revealed) {
              return <div key={key} className="maze-cell fog" />;
            }

            let kind = "path";
            if (gone || cell === 0) kind = "wall";
            else if (cell === 5) kind = "goal";
            else if (cell === 2) kind = "fragile";
            else if (r === START.r && c === START.c) kind = "start";

            const dim = !visible && remembered ? " visited" : "";
            const escapeHome =
              phase === "return" && r === START.r && c === START.c
                ? " escape-home"
                : "";

            return (
              <div
                key={key}
                className={`maze-cell ${kind}${dim}${escapeHome}${isPlayer ? " player" : ""}`}
              >
                {isPlayer ? (
                  <span className="maze-token" aria-label="Керот — песик">
                    🐶
                  </span>
                ) : cell === 5 && !gone && phase === "go" ? (
                  <span className="maze-station">
                    <strong>5</strong>
                  </span>
                ) : cell === 2 && !gone ? (
                  <span className="maze-fragile-mark" aria-hidden="true">
                    ◇
                  </span>
                ) : null}
              </div>
            );
          }),
        )}
      </div>

      {status === "idle" || status === "lost" ? (
        <button type="button" className="btn btn-primary" onClick={startGame}>
          {status === "lost" || lives <= 0
            ? COPY.stage6.restart
            : COPY.stage6.start}
        </button>
      ) : (
        <div className="dpad" aria-label="Керування">
          <button
            type="button"
            className="btn btn-secondary dpad-btn"
            onClick={() => tryMove("up")}
            disabled={status !== "playing"}
          >
            ↑
          </button>
          <div className="dpad-mid">
            <button
              type="button"
              className="btn btn-secondary dpad-btn"
              onClick={() => tryMove("left")}
              disabled={status !== "playing"}
            >
              ←
            </button>
            <button
              type="button"
              className="btn btn-secondary dpad-btn"
              onClick={() => tryMove("down")}
              disabled={status !== "playing"}
            >
              ↓
            </button>
            <button
              type="button"
              className="btn btn-secondary dpad-btn"
              onClick={() => tryMove("right")}
              disabled={status !== "playing"}
            >
              →
            </button>
          </div>
        </div>
      )}

      <div className="setup-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={restartGame}
          disabled={status === "won"}
        >
          {COPY.stage6.restart}
        </button>
      </div>

      <div
        className={`message ${status === "won" ? "success" : status === "lost" || timerDanger ? "error" : ""}`}
        role="status"
      >
        {message}
      </div>
    </section>
  );
}
