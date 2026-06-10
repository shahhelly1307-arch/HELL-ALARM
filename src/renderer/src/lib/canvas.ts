import { themed } from './assets'

// Layout constants in 512x512 design space and helpers to map to render units.
export const CANVAS = 512

// The visible pomodoro frame is 451 design units wide. The renderer's CSS clips
// the canvas so that this 451-unit-wide strip fills 100vw. Use FRAME_W (not CANVAS)
// when converting design pixels to vw, so text sizes match Figma's proportions.
export const FRAME_W = 451

export function pct(value: number): string {
  return `${(value / CANVAS) * 100}%`
}

// Percentage relative to a non-canvas parent of `parentDesignWidth` design units.
// Use this when positioning a child of a wrapper (e.g. a row or overlay), since plain
// pct() assumes the parent is the 512-unit-wide canvas.
export function pctOf(value: number, parentDesignWidth: number): string {
  return `${(value / parentDesignWidth) * 100}%`
}

// Convert a Figma design-pixel size to a vw value that matches the visible frame scale.
export function designVw(designPx: number): string {
  return `${(designPx / FRAME_W) * 100}vw`
}

export type PanelId = 'timer' | 'tasks' | 'stats' | 'settings'
export type WindowControlId = 'minimize' | 'maximize' | 'close'

export interface Hitbox {
  id: string
  label: string
  left: number
  top: number
  width: number
  height: number
  color: string
}

export const SIDE_PANEL: (Hitbox & { id: PanelId })[] = [
  { id: 'timer', label: 'Timer', left: 39, top: 128, width: 48, height: 57, color: '#ff4d6d' },
  { id: 'tasks', label: 'Tasks', left: 39, top: 192, width: 48, height: 57, color: '#f9c74f' },
  { id: 'stats', label: 'Stats', left: 39, top: 256, width: 48, height: 57, color: '#43aa8b' },
  { id: 'settings', label: 'Settings', left: 39, top: 320, width: 48, height: 57, color: '#577590' }
]

export const WINDOW_CONTROLS: (Hitbox & { id: WindowControlId; asset: string })[] = [
  {
    id: 'minimize',
    label: 'Min',
    left: 403,
    top: 84,
    width: 20,
    height: 19,
    color: '#8d99ae',
    asset: 'minimize'
  },
  {
    id: 'maximize',
    label: 'Max',
    left: 428,
    top: 84,
    width: 20,
    height: 19,
    color: '#9d4edd',
    asset: 'window'
  },
  {
    id: 'close',
    label: 'Close',
    left: 454,
    top: 84,
    width: 20,
    height: 19,
    color: '#e63946',
    asset: 'exit'
  }
]

export const DRAG_REGION = { left: 30, top: 77, width: 450, height: 51 }
export const FRAME_FOOTPRINT = { left: 30, top: 77, width: 451, height: 366 }
export const FRAME_CONTENT = { left: 137, top: 128, width: 323, height: 268 }

export const RESET_HITBOX: Hitbox & { id: 'reset' } = {
  id: 'reset',
  label: 'Reset',
  left: 451,
  top: 413,
  width: 19,
  height: 20,
  color: '#06d6a0'
}

// Stats panel — 6 strawberry slot offsets (matches Figma's pomodoro-count group).
export const STRAWBERRY_SLOTS = [
  { x: 6, y: 3 },
  { x: 31, y: 3 },
  { x: 56, y: 3 },
  { x: 81, y: 3 },
  { x: 106, y: 3 },
  { x: 131, y: 3 }
]

// Matches the "+3" design placeholder text node in the stats group.
// Width is widened from Figma's 11 to 30 to give room for "+10".."+99" overflow.
export const STRAWBERRY_OVERFLOW_LABEL = {
  x: 353,
  y: 237,
  width: 30,
  height: 15,
  fontSize: 7,
  lineHeightPx: 14.875
}

// Settings panel — Y centers (matching the figma text labels' vertical centers).
export const SETTINGS_ROWS = {
  focusTime: 192.5,
  longBreak: 215.5,
  shortBreak: 238.5,
  sound: 272.5,
  notification: 294.5,
  darkMode: 316.5
}

// All settings controls right-align to this x in 512-canvas space.
export const SETTINGS_CONTROLS_RIGHT_X = 375

// ---------------------------------------------------------------------------
// Tasks panel — Figma-exported sprites + layout (512-canvas design space).
//
// Each task PNG is a full-frame 512x512 export with the actual art baked at a
// fixed offset. `SpriteBox` records the opaque content box (x,y,w,h) so we can
// crop the sprite out with scale-independent background ratios via
// spriteCropStyle() — no per-render pixel math needed.
// ---------------------------------------------------------------------------

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface SpriteBox extends Box {
  // Logical, theme-agnostic path (e.g. "tasks/task.png"); resolved per-theme at render.
  key: string
}

export const TASK_SPRITES = {
  // Row "slot": the pill art is 27px tall starting at y=207; we crop a PITCH-tall
  // (32px) window so each row element includes a 5px gap to the next row.
  row: { key: 'tasks/task.png', x: 188, y: 207, w: 183, h: 32 },
  // Both checkbox states share one box (covers the checkmark overshoot) so they
  // line up exactly when toggled.
  checkbox: { key: 'tasks/checkbox.png', x: 195, y: 212, w: 17, h: 16 },
  checkboxDone: { key: 'tasks/checkbox-done.png', x: 195, y: 212, w: 17, h: 16 },
  addField: { key: 'tasks/add-task.png', x: 189, y: 174, w: 154, h: 23 },
  addButton: { key: 'tasks/add.png', x: 347, y: 174, w: 24, h: 23 },
  trash: { key: 'tasks/tasks-trash-button.png', x: 351, y: 349, w: 26, h: 24 }
} as const

// Filter bar: each PNG is the WHOLE 3-segment control (labels baked in) with one
// segment shown selected. They share the same full-bar content box, so we render
// only the one matching the active filter and overlay transparent segment hitboxes.
// Logical (theme-agnostic) paths; resolved per-theme at render with themed().
export const TASK_FILTER_SPRITES: Record<TaskFilterKey, string> = {
  all: 'tasks/all.png',
  active: 'tasks/active.png',
  done: 'tasks/done.png'
}
// Clickable segments — the filter bar (x 189..323) split into thirds at the
// midpoints between the Figma label centers (all=210, active=254, done=301).
export const TASK_FILTER_SEGMENTS: Record<TaskFilterKey, Box> = {
  all: { x: 189, y: 347, w: 43, h: 22 },
  active: { x: 232, y: 347, w: 45, h: 22 },
  done: { x: 277, y: 347, w: 46, h: 22 }
}

// Label text boxes — copied exactly from the Figma "all" / "active" / "done" nodes.
export const TASK_FILTER_LABELS: Record<TaskFilterKey, Box> = {
  all: { x: 204, y: 352, w: 12, h: 17 },
  active: { x: 241, y: 352, w: 30, h: 17 },
  done: { x: 289, y: 352, w: 24, h: 17 }
}

type TaskFilterKey = 'all' | 'active' | 'done'

// Pitch between consecutive task rows (row slot height).
export const TASK_ROW_PITCH = TASK_SPRITES.row.h // 32

// Scrollable task-list viewport: from the first row's top down toward the filter
// bar. Height = 4 full rows (4 * pitch); extra rows scroll.
export const TASK_LIST = {
  x: TASK_SPRITES.row.x,
  y: TASK_SPRITES.row.y,
  w: TASK_SPRITES.row.w,
  h: TASK_ROW_PITCH * 4
}

// Crop a full-frame sprite to its content box. Used only by the repeating task
// rows (a single pill PNG reused at N positions); the single-instance assets
// render full-frame instead. Returns plain CSS background props.
export function spriteCropStyle(
  s: SpriteBox,
  dark: boolean,
  canvas = CANVAS
): {
  backgroundImage: string
  backgroundRepeat: string
  backgroundSize: string
  backgroundPosition: string
} {
  return {
    backgroundImage: `url(${themed(s.key, dark)})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${(canvas / s.w) * 100}% ${(canvas / s.h) * 100}%`,
    backgroundPosition: `${(s.x / (canvas - s.w)) * 100}% ${(s.y / (canvas - s.h)) * 100}%`
  }
}