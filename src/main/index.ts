import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Window matches the visible pomodoro frame (451x366 in 512 design space).
  const FRAME_W = 451
  const FRAME_H = 366
  const SCALE = 1.8

  const mainWindow = new BrowserWindow({
    width: Math.round(FRAME_W * SCALE),
    height: Math.round(FRAME_H * SCALE),
    minWidth: Math.round(FRAME_W * 0.9),
    minHeight: Math.round(FRAME_H * 0.9),
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Lock to the frame's aspect ratio so resizing keeps proportions.
  mainWindow.setAspectRatio(FRAME_W / FRAME_H)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ipcMain.on('window:minimize', () => mainWindow.minimize())
  ipcMain.on('window:toggle-maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  })
  ipcMain.on('window:close', () => mainWindow.close())

  // Native OS notification (Windows/macOS/Linux). Returns false if the platform
  // can't show one, so the renderer can fall back to the HTML5 Notification API.
  ipcMain.handle(
    'notify',
    (_e, payload: { title: string; body: string; silent?: boolean }): boolean => {
      if (!Notification.isSupported()) return false
      const n = new Notification({
        title: payload.title,
        body: payload.body,
        silent: payload.silent ?? false,
        // Strawberry icon on Windows/Linux; macOS ignores this and shows the
        // app bundle's icon (also the strawberry in packaged builds).
        icon
      })
      // Clicking the toast brings the timer back to the foreground.
      n.on('click', () => {
        if (mainWindow.isDestroyed()) return
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      })
      n.show()
      return true
    }
  )

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.pixelpomodoro.app')

  // Show the strawberry in the macOS dock during dev (packaged builds use build/icon.icns).
  if (process.platform === 'darwin') {
    app.dock?.setIcon(icon)
  }

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})