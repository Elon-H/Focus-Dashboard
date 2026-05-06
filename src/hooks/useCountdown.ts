import { useCallback, useEffect, useMemo, useState } from "react";
import type { TimerMode, TimerSettings, TimerStatus } from "../types";

const modeDurations: Record<TimerMode, keyof TimerSettings> = {
  focus: "focusMinutes",
  "short-break": "shortBreakMinutes",
  "long-break": "longBreakMinutes",
};

export function getModeSeconds(mode: TimerMode, settings: TimerSettings): number {
  return settings[modeDurations[mode]] * 60;
}

export function useCountdown(
  mode: TimerMode,
  settings: TimerSettings,
  onComplete: () => void,
) {
  const durationSeconds = useMemo(() => getModeSeconds(mode, settings), [mode, settings]);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [status, setStatus] = useState<TimerStatus>("idle");

  useEffect(() => {
    if (status === "idle") {
      setRemainingSeconds(durationSeconds);
    }
  }, [durationSeconds, status]);

  useEffect(() => {
    if (status !== "running") return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setStatus("idle");
          window.setTimeout(onComplete, 0);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onComplete, status]);

  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setRemainingSeconds(durationSeconds);
  }, [durationSeconds]);

  return {
    durationSeconds,
    remainingSeconds,
    status,
    start,
    pause,
    reset,
    setStatus,
    setRemainingSeconds,
  };
}
