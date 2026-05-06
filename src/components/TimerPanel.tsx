import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useCountdown } from "../hooks/useCountdown";
import { useAppStore } from "../stores/AppStoreContext";
import type { TimerMode, TimerSettings } from "../types";

const modeLabels: Record<TimerMode, string> = {
  focus: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${`${minutes}`.padStart(2, "0")}:${`${rest}`.padStart(2, "0")}`;
}

export function TimerPanel() {
  const { data, updateTimerSettings, incrementFocusSession } = useAppStore();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [settingsDraft, setSettingsDraft] = useState<TimerSettings>(data.timerSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSettingsDraft(data.timerSettings);
  }, [data.timerSettings]);

  const handleComplete = useCallback(() => {
    if (mode === "focus") {
      incrementFocusSession();
    }

    setMessage(`${modeLabels[mode]} finished. Take the next step deliberately.`);

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Focus Projects", {
          body: `${modeLabels[mode]} countdown finished.`,
        });
      } catch {
        setMessage(`${modeLabels[mode]} finished. Browser notification could not be shown.`);
      }
    }
  }, [incrementFocusSession, mode]);

  const { durationSeconds, remainingSeconds, status, start, pause, reset, setStatus } =
    useCountdown(mode, data.timerSettings, handleComplete);

  const progress = useMemo(() => {
    if (durationSeconds === 0) return 0;
    return Math.round(((durationSeconds - remainingSeconds) / durationSeconds) * 100);
  }, [durationSeconds, remainingSeconds]);

  function applySettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateTimerSettings(settingsDraft);
    setMessage("Timer settings saved.");
  }

  const ensureNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      setMessage("This browser does not support notifications. Timer will still show page alerts.");
      return;
    }

    if (Notification.permission === "granted") {
      return;
    }

    if (Notification.permission === "denied") {
      setMessage("Browser notifications are blocked. Enable them in site settings if needed.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setMessage(
        permission === "granted"
          ? "Browser notifications enabled."
          : "Browser notifications were not enabled. Timer will still show page alerts.",
      );
    } catch {
      setMessage("Browser notification permission could not be requested.");
    }
  }, []);

  function handleStart() {
    void ensureNotificationPermission();
    start();
  }

  function switchMode(nextMode: TimerMode) {
    setMode(nextMode);
    setStatus("idle");
    setMessage("");
  }

  return (
    <section id="timer" className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            Pomodoro
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">番茄钟专注倒计时</h2>
        </div>
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-950">
          <p className="text-xs font-semibold uppercase text-emerald-700">Today completed</p>
          <p className="text-2xl font-bold">{data.dailyFocusCount.count}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(modeLabels) as TimerMode[]).map((item) => (
              <button
                key={item}
                className={`btn ${
                  mode === item ? "bg-slate-950 text-white" : "btn-secondary"
                }`}
                type="button"
                onClick={() => switchMode(item)}
              >
                {modeLabels[item]}
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center text-center">
            <p className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-teal-800 shadow-sm">
              Current Mode: {modeLabels[mode]}
            </p>
            <div className="mt-5 text-[clamp(3.5rem,12vw,8rem)] font-black leading-none tracking-normal text-slate-950">
              {formatSeconds(remainingSeconds)}
            </div>
            <div className="mt-5 h-3 w-full max-w-xl overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-teal-700 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Status: {status === "running" ? "Running" : status === "paused" ? "Paused" : "Idle"}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {status === "running" ? (
              <button className="btn btn-secondary" type="button" onClick={pause}>
                暂停
              </button>
            ) : (
              <button className="btn btn-primary" type="button" onClick={handleStart}>
                {status === "paused" ? "继续" : "开始"}
              </button>
            )}
            <button className="btn btn-secondary" type="button" onClick={reset}>
              重置
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
              {message}
            </div>
          )}
        </div>

        <form className="rounded-lg border border-slate-200 bg-white p-4" onSubmit={applySettings}>
          <h3 className="text-base font-bold text-slate-950">自定义时长</h3>
          <div className="mt-4 space-y-3">
            <NumberField
              label="Focus minutes"
              value={settingsDraft.focusMinutes}
              onChange={(value) => setSettingsDraft((current) => ({ ...current, focusMinutes: value }))}
            />
            <NumberField
              label="Short break"
              value={settingsDraft.shortBreakMinutes}
              onChange={(value) =>
                setSettingsDraft((current) => ({ ...current, shortBreakMinutes: value }))
              }
            />
            <NumberField
              label="Long break"
              value={settingsDraft.longBreakMinutes}
              onChange={(value) =>
                setSettingsDraft((current) => ({ ...current, longBreakMinutes: value }))
              }
            />
          </div>
          <button className="btn btn-primary mt-4 w-full" type="submit">
            保存设置
          </button>
        </form>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <input
        className="form-input mt-1"
        min={1}
        max={240}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
