import { pct, SETTINGS_CONTROLS_RIGHT_X } from '../../lib/canvas'

interface SettingsToggleProps {
  on: boolean
  onToggle: () => void
  centerY: number
}

export function SettingsToggle({ on, onToggle, centerY }: SettingsToggleProps): React.JSX.Element {
  const TRACK_W = 26
  const TRACK_H = 13
  const THUMB = 9
  const trackX = SETTINGS_CONTROLS_RIGHT_X - TRACK_W
  const trackY = centerY - TRACK_H / 2
  const thumbY = trackY + (TRACK_H - THUMB) / 2
  const thumbX = on ? trackX + TRACK_W - THUMB - 2 : trackX + 2
  return (
    <>
      <button
        className={`settings-toggle-track ${on ? 'is-on' : 'is-off'}`}
        style={{
          left: pct(trackX),
          top: pct(trackY),
          width: pct(TRACK_W),
          height: pct(TRACK_H)
        }}
        onClick={onToggle}
        aria-pressed={on}
      />
      <div
        className={`settings-toggle-thumb ${on ? 'is-on' : 'is-off'}`}
        style={{
          left: pct(thumbX),
          top: pct(thumbY),  
          width: pct(THUMB),
          height: pct(THUMB)
        }}
      />
    </>
  )
}