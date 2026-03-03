"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { formatTimerDisplay } from "@/lib/utils";

const STORAGE_KEY = "adhd-scorecard-timer";

export interface TimerState {
  goalId: string | null;
  sessionId: string | null;
  isRunning: boolean;
  startTime: number | null; // Date.now()
  elapsed: number;          // seconds before current start
  pomodoroMode: boolean;
  pomodoroPhase: "work" | "break";
  pomodoroCount: number;
}

interface TimerContextValue {
  timerState: TimerState;
  displayTime: string;
  totalElapsed: number; // seconds
  startTimer: (goalId: string, pomodoro?: boolean) => Promise<void>;
  stopTimer: (focusRating?: number) => Promise<void>;
  togglePomodoro: () => void;
}

const defaultState: TimerState = {
  goalId: null,
  sessionId: null,
  isRunning: false,
  startTime: null,
  elapsed: 0,
  pomodoroMode: false,
  pomodoroPhase: "work",
  pomodoroCount: 0,
};

const TimerContext = createContext<TimerContextValue>({
  timerState: defaultState,
  displayTime: "00:00",
  totalElapsed: 0,
  startTimer: async () => {},
  stopTimer: async () => {},
  togglePomodoro: () => {},
});

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(defaultState);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved: TimerState = JSON.parse(raw);
      if (saved.isRunning && saved.startTime) {
        setState(saved);
        startInterval();
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startInterval() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
  }

  function clearTimerInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // Compute total elapsed seconds
  const totalElapsed =
    state.isRunning && state.startTime
      ? state.elapsed + Math.floor((Date.now() - state.startTime) / 1000)
      : state.elapsed;

  // Suppress unused tick warning — it exists to trigger re-render
  void tick;

  const displayTime = formatTimerDisplay(totalElapsed);

  const startTimer = useCallback(
    async (goalId: string, pomodoro = false) => {
      // Stop any existing session first
      if (state.isRunning && state.sessionId) {
        await stopTimer();
      }

      const res = await fetch("/api/timer/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });
      const { sessionId } = await res.json();

      const next: TimerState = {
        goalId,
        sessionId,
        isRunning: true,
        startTime: Date.now(),
        elapsed: 0,
        pomodoroMode: pomodoro,
        pomodoroPhase: "work",
        pomodoroCount: state.pomodoroCount,
      };
      setState(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      startInterval();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.isRunning, state.sessionId, state.pomodoroCount]
  );

  const stopTimer = useCallback(
    async (focusRating?: number) => {
      if (!state.sessionId) return;

      clearTimerInterval();

      const finalElapsed = state.isRunning && state.startTime
        ? state.elapsed + Math.floor((Date.now() - state.startTime) / 1000)
        : state.elapsed;

      await fetch("/api/timer/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: state.sessionId, focusRating, elapsed: finalElapsed }),
      });

      setState(defaultState);
      localStorage.removeItem(STORAGE_KEY);
    },
    [state.sessionId, state.isRunning, state.startTime, state.elapsed]
  );

  const togglePomodoro = useCallback(() => {
    setState((s) => {
      const next = { ...s, pomodoroMode: !s.pomodoroMode };
      if (s.isRunning) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <TimerContext.Provider
      value={{ timerState: state, displayTime, totalElapsed, startTimer, stopTimer, togglePomodoro }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
