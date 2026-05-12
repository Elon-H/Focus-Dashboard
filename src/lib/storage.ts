import type { AppData } from "../types";
import { todayKey } from "./date";

const STORAGE_KEY = "focus-projects-app:v1";

export const defaultAppData: AppData = {
  projects: [],
  timerSettings: {
    focusMinutes: 30,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  },
  dailyFocusCount: {
    date: todayKey(),
    count: 0,
  },
  focusHistory: {},
};

function normalizeTimerMinute(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}

function normalizeFocusHistory(data: Partial<AppData>): Record<string, number> {
  const rawHistory = data.focusHistory;
  const history: Record<string, number> = {};

  if (rawHistory && typeof rawHistory === "object" && !Array.isArray(rawHistory)) {
    Object.entries(rawHistory).forEach(([date, count]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && typeof count === "number" && count > 0) {
        history[date] = Math.floor(count);
      }
    });
  }

  if (!rawHistory) {
    const storedDate = data.dailyFocusCount?.date;
    const storedCount = data.dailyFocusCount?.count ?? 0;
    const today = todayKey();

    if (storedDate === today && storedCount > 0) {
      history[today] = Math.floor(storedCount);
    }
  }

  return history;
}

function normalizeAppData(data: Partial<AppData>): AppData {
  const storedDate = data.dailyFocusCount?.date;
  const today = todayKey();
  const focusHistory = normalizeFocusHistory(data);
  const todayHistoryCount = focusHistory[today] ?? 0;
  const storedTodayCount =
    storedDate === today && typeof data.dailyFocusCount?.count === "number"
      ? data.dailyFocusCount.count
      : 0;
  const todayCount = Math.max(storedTodayCount, todayHistoryCount);

  if (todayCount > 0) {
    focusHistory[today] = todayCount;
  }

  return {
    projects: Array.isArray(data.projects) ? data.projects : [],
    timerSettings: {
      focusMinutes: normalizeTimerMinute(
        data.timerSettings?.focusMinutes,
        defaultAppData.timerSettings.focusMinutes,
      ),
      shortBreakMinutes: normalizeTimerMinute(
        data.timerSettings?.shortBreakMinutes,
        defaultAppData.timerSettings.shortBreakMinutes,
      ),
      longBreakMinutes: normalizeTimerMinute(
        data.timerSettings?.longBreakMinutes,
        defaultAppData.timerSettings.longBreakMinutes,
      ),
    },
    dailyFocusCount: {
      date: today,
      count: todayCount,
    },
    focusHistory,
  };
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return defaultAppData;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAppData;
    return normalizeAppData(JSON.parse(raw) as Partial<AppData>);
  } catch (error) {
    console.warn("Failed to load local app data.", error);
    return defaultAppData;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save local app data.", error);
  }
}

export function clearAppData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
