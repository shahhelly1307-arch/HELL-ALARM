// Resolve a public-dir asset path (e.g. "timer/background.png") so it loads in
// both dev and the packaged build. Vite sets import.meta.env.BASE_URL to "/" when
// served over http (dev) and to "./" for the file:// build, where an absolute
// "/timer/..." would otherwise resolve to the filesystem root and 404.
const BASE = import.meta.env.BASE_URL

export type Theme = 'light-mode' | 'dark-mode'

export function modeDir(dark: boolean): Theme {
  return dark ? 'dark-mode' : 'light-mode'
}

// Resolve a shared (theme-agnostic) public asset, e.g. "animations/sleeping-animation/x.png".
export function asset(path: string): string {
  return `${BASE}${path.replace(/^\/+/, '')}`
}

// Resolve a themed asset, e.g. themed("main/frame.png", dark) -> "<base>light-mode/main/frame.png".
export function themed(path: string, dark: boolean): string {
  return asset(`${modeDir(dark)}/${path.replace(/^\/+/, '')}`)
}