import { ElectronAPI } from '@electron-toolkit/preload'

export interface WindowAPI {
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
}

export interface API {
  window: WindowAPI
  notify: (title: string, body: string, silent?: boolean) => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}