/* eslint-disable react-hooks/set-state-in-effect --
   The timer effects intentionally drive state from the countdown reaching zero,
   from duration changes, and from the day rolling over; that's the whole point. */
import { useEffect, useRef, useState } from 'react'
import { asset } from './assets'

export type TimerPhase = 'focus' | 'short' | 'long'

export interface TimerDurations {
  focusMin: number
  shortBreakMin: number
  longBreakMin: number
}

export interface TimerFeedback {
  soundOn: boolean
  notificationOn: boolean
}

export interface Timer {
  phase: TimerPhase
  running: boolean
  secondsLeft: number
  pomodorosToday: number
  toggle: () => void
  reset: () => void
  skip: () => void
}

// A long break replaces the short break after this many focus sessions.
const SESSIONS_BEFORE_LONG = 4
const COUNT_KEY = 'pixel-pomodoro-count'

export function useTimer(durations: TimerDurations, feedback: TimerFeedback): Timer {
  const phaseSeconds = (p: TimerPhase): number =>
    Math.max(
      1,
      Math.round(
        (p === 'focus'
          ? durations.focusMin
          : p === 'short'
            ? durations.shortBreakMin
            : durations.longBreakMin) * 60
      )
    )

  const [phase, setPhase] = useState<TimerPhase>('focus')
  const [running, setRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(() => phaseSeconds('focus'))
  const [pomodorosToday, setPomodorosToday] = useState(() => loadCount())
  const focusStreak = useRef(0)

  // Persist the day's tally across restarts.
  useEffect(() => {
    saveCount(pomodorosToday)
  }, [pomodorosToday])

  // Reset the tally when the day rolls over (covers the app being left open past midnight).
  useEffect(() => {
    const check = (): void => {
      if (readStoredDate() !== todayKey()) {
        setPomodorosToday(0)
        saveCount(0)
      }
    }
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [])

  // Tick once per second while running (self-rescheduling keeps it drift-tolerant
  // and pauses cleanly on unmount / when `running` flips).
  useEffect(() => {
    if (!running || secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [running, secondsLeft])

  // While idle, keep the displayed time in sync with the current phase duration so
  // changing the durations in Settings updates the clock immediately.
  useEffect(() => {
    if (!running) setSecondsLeft(phaseSeconds(phase))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durations.focusMin, durations.shortBreakMin, durations.longBreakMin])

  // Advance focus → break → focus. Shared by the auto-complete (countdown hits 0)
  // and the manual skip button.
  function advance(opts: { count: boolean; alert: boolean }): void {
    setRunning(false)
    if (opts.alert && feedback.soundOn) playAlarm()
    if (phase === 'focus') {
      if (opts.count) setPomodorosToday((n) => n + 1)
      focusStreak.current += 1
      const next: TimerPhase = focusStreak.current % SESSIONS_BEFORE_LONG === 0 ? 'long' : 'short'
      setPhase(next)
      setSecondsLeft(phaseSeconds(next))
      if (opts.alert && feedback.notificationOn) {
        notify(
          'Focus complete!',
          next === 'long' ? 'Take a long break.' : 'Take a short break.',
          feedback.soundOn
        )
      }
    } else {
      setPhase('focus')
      setSecondsLeft(phaseSeconds('focus'))
      if (opts.alert && feedback.notificationOn)
        notify('Break over', 'Back to focus.', feedback.soundOn)
    }
  }

  // Auto-complete when the countdown reaches zero.
  useEffect(() => {
    if (running && secondsLeft <= 0) advance({ count: true, alert: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, secondsLeft])

  function toggle(): void {
    if (!running && feedback.notificationOn) requestNotifyPermission()
    setSecondsLeft((s) => (s <= 0 ? phaseSeconds(phase) : s))
    setRunning((r) => !r)
  }

  // Full reset: stop, return to a fresh focus session (clears the streak), and
  // zero today's pomodoro count.
  function reset(): void {
    setRunning(false)
    setPhase('focus')
    focusStreak.current = 0
    setSecondsLeft(phaseSeconds('focus'))
    setPomodorosToday(0)
  }

  // Skip jumps to the next phase but does NOT count a pomodoro — a pomodoro only
  // counts when a full focus/study session actually elapses (auto-complete below).
  function skip(): void {
    advance({ count: false, alert: false })
  }

  return { phase, running, secondsLeft, pomodorosToday, toggle, reset, skip }
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

// --- daily persistence ---------------------------------------------------------

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function loadCount(): number {
  try {
    const raw = localStorage.getItem(COUNT_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    return date === todayKey() && typeof count === 'number' ? count : 0
  } catch {
    return 0
  }
}

function saveCount(count: number): void {
  try {
    localStorage.setItem(COUNT_KEY, JSON.stringify({ date: todayKey(), count }))
  } catch {
    // localStorage unavailable — ignore
  }
}

function readStoredDate(): string | null {
  try {
    const raw = localStorage.getItem(COUNT_KEY)
    return raw ? (JSON.parse(raw).date ?? null) : null
  } catch {
    return null
  }
}

// --- feedback helpers (best-effort; never throw) -------------------------------

// Phase-complete chime. Falls back to a synthesized beep if the file can't play.
const alarmSrc = asset('audio/Alarm.m4a')

function playAlarm(): void {
  try {
    const el = new Audio(alarmSrc)
    void el.play().catch(() => beep())
  } catch {
    beep()
  }
}

function beep(): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
    osc.start(now)
    osc.stop(now + 0.6)
    osc.onended = () => ctx.close()
  } catch {
    // audio unavailable — ignore
  }
}

function requestNotifyPermission(): void {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission()
    }
  } catch {
    // ignore
  }
}

// Prefer Electron's native OS notification (reliable on Windows/macOS/Linux);
// fall back to the renderer's HTML5 Notification API if the bridge is absent
// (e.g. running the renderer in a plain browser) or the platform can't show one.
function notify(title: string, body: string, silent = false): void {
  try {
    const native = window.api?.notify
    if (native) {
      void native(title, body, silent)
        .then((shown) => {
          if (!shown) htmlNotify(title, body)
        })
        .catch(() => htmlNotify(title, body))
      return
    }
  } catch {
    // fall through to HTML5
  }
  htmlNotify(title, body)
}

// Strawberry favicon shown inside HTML5 notifications (native macOS notifications
// ignore custom icons and show the app bundle's strawberry icon instead).
const notifIcon = asset('light-mode/stats/strawberry-stat-display.png')

function htmlNotify(title: string, body: string): void {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: notifIcon })
    }
  } catch {
    // ignore
  }
}