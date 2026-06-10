export interface SettingsState {
  focusMin: number
  longBreakMin: number
  shortBreakMin: number
  soundOn: boolean
  notificationOn: boolean
  darkModeOn: boolean
}

const STORAGE_KEY = 'pixel-pomodoro-settings'

export const DEFAULT_SETTINGS: SettingsState = {
  focusMin: 25,
  longBreakMin: 15,
  shortBreakMin: 5,
  soundOn: true,
  notificationOn: true,
  darkModeOn: false
}

export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS
    // Merge over defaults so missing/invalid fields (e.g. a setting added in a
    // later version) fall back rather than breaking the whole object.
    return {
      focusMin: numberOr(parsed.focusMin, DEFAULT_SETTINGS.focusMin),
      longBreakMin: numberOr(parsed.longBreakMin, DEFAULT_SETTINGS.longBreakMin),
      shortBreakMin: numberOr(parsed.shortBreakMin, DEFAULT_SETTINGS.shortBreakMin),
      soundOn: boolOr(parsed.soundOn, DEFAULT_SETTINGS.soundOn),
      notificationOn: boolOr(parsed.notificationOn, DEFAULT_SETTINGS.notificationOn),
      darkModeOn: boolOr(parsed.darkModeOn, DEFAULT_SETTINGS.darkModeOn)
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: SettingsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable; silently drop.
  }
}

function numberOr(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function boolOr(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}