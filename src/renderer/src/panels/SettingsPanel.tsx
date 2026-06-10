import { SettingsModifier } from '../components/settings/SettingsModifier'
import { SettingsToggle } from '../components/settings/SettingsToggle'
import { SETTINGS_ROWS } from '../lib/canvas'
import type { SettingsState } from '../lib/settings'

export type { SettingsState } from '../lib/settings'

interface SettingsPanelProps {
  settings: SettingsState
  setSettings: (updater: (prev: SettingsState) => SettingsState) => void
}

export function SettingsPanel({ settings, setSettings }: SettingsPanelProps): React.JSX.Element {
  return (
    <>
      <SettingsModifier
        centerY={SETTINGS_ROWS.focusTime}
        value={settings.focusMin}
        onChange={(v) => setSettings((s) => ({ ...s, focusMin: v }))}
        min={5}
        max={90}
        step={5}
      />
      <SettingsModifier
        centerY={SETTINGS_ROWS.longBreak}
        value={settings.longBreakMin}
        onChange={(v) => setSettings((s) => ({ ...s, longBreakMin: v }))}
        min={5}
        max={60}
        step={5}
      />
      <SettingsModifier
        centerY={SETTINGS_ROWS.shortBreak}
        value={settings.shortBreakMin}
        onChange={(v) => setSettings((s) => ({ ...s, shortBreakMin: v }))}
        min={1}
        max={30}
        step={1}
      />
      <SettingsToggle
        centerY={SETTINGS_ROWS.sound}
        on={settings.soundOn}
        onToggle={() => setSettings((s) => ({ ...s, soundOn: !s.soundOn }))}
      />
      <SettingsToggle
        centerY={SETTINGS_ROWS.notification}
        on={settings.notificationOn}
        onToggle={() => setSettings((s) => ({ ...s, notificationOn: !s.notificationOn }))}
      />
      <SettingsToggle
        centerY={SETTINGS_ROWS.darkMode}
        on={settings.darkModeOn}
        onToggle={() => setSettings((s) => ({ ...s, darkModeOn: !s.darkModeOn }))}
      />
    </>
  )
}