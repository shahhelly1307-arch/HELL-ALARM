import { themed } from './assets'

export const CANVAS = 512
export const FRAME_W = 451

export function pct(value: number): string {
  return `${(value / CANVAS) * 100}%`
}

export function pctOf(value: number, parentDesignWidth: number): string {
  return `${(value / parentDesignWidth) * 100}%`
}

export function designVw(designPx: number): string {
  return `${(designPx / FRAME_W) * 100}vw`
}

export type PanelId = 'timer' | 'tasks' | 'stats' | 'settings'

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

export const STRAWBERRY_SLOTS = [
  { x: 6, y: 3 },
  { x: 31, y: 3 },
  { x: 56, y: 3 },
  { x: 81, y: 3 },
  { x: 106, y: 3 },
  { x: 131, y: 3 }
]

export const STRAWBERRY_OVERFLOW_LABEL = {
  x: 353,
  y: 237,
  width: 30,
  height: 15,
  fontSize: 7,
  lineHeightPx: 14.875
}

export const SETTINGS_ROWS = {
  focusTime: 192.5,
  longBreak: 215.5,
  shortBreak: 238.5,
  sound: 272.5,
  notification: 294.5,
  darkMode: 316.5
}

export const SETTINGS_CONTROLS_RIGHT_X = 375

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface SpriteBox extends Box {
  key: string
}

export const TASK_SPRITES = {
  row: { key: 'tasks/task.png', x: 188, y: 207, w: 183, h: 32 },
  checkbox: { key: 'tasks/checkbox.png', x: 195, y: 212, w: 17, h: 16 },
  checkboxDone: { key: 'tasks/checkbox-done.png', x: 195, y: 212, w: 17, h: 16 },
  addField: { key: 'tasks/add-task.png', x: 189, y: 174, w: 154, h: 23 },
  addButton: { key: 'tasks/add.png', x: 347, y: 174, w: 24, h: 23 },
  trash: { key: 'tasks/tasks-trash-button.png', x: 351, y: 349, w: 26, h: 24 }
} as const

export const TASK_FILTER_SPRITES: Record<TaskFilterKey, string> = {
  all: 'tasks/all.png',
  active: 'tasks/active.png',
  done: 'tasks/done.png'
}

export const TASK_FILTER_SEGMENTS: Record<TaskFilterKey, Box> = {
  all: { x: 189, y: 347, w: 43, h: 22 },
  active: { x: 232, y: 347, w: 45, h: 22 },
  done: { x: 277, y: 347, w: 46, h: 22 }
}

export const TASK_FILTER_LABELS: Record<TaskFilterKey, Box> = {
  all: { x: 204, y: 352, w: 12, h: 17 },
  active: { x: 241, y: 352, w: 30, h: 17 },
  done: { x: 289, y: 352, w: 24, h: 17 }
}

type TaskFilterKey = 'all' | 'active' | 'done'

export const TASK_ROW_PITCH = TASK_SPRITES.row.h

export const TASK_LIST = {
  x: TASK_SPRITES.row.x,
  y: TASK_SPRITES.row.y,
  w: TASK_SPRITES.row.w,
  h: TASK_ROW_PITCH * 4
}

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
