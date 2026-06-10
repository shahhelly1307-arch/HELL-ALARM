/// <reference types="vite/client" />
/// <reference types="vite/client" />

interface Window {
  api?: {
    notify: (title: string, body: string, silent?: boolean) => Promise<boolean>
  }
}
