import { designVw, pct, SETTINGS_CONTROLS_RIGHT_X } from '../../lib/canvas'

interface SettingsModifierProps {
  value: number
  unit?: string
  onChange: (v: number) => void
  centerY: number
  min: number
  max: number
  step: number
}

export function SettingsModifier({
  value,
  unit = 'min',
  onChange,
  centerY,
  min,
  max,
  step
}: SettingsModifierProps): React.JSX.Element {
  const W = 95
  const H = 18
  const leftX = SETTINGS_CONTROLS_RIGHT_X - W
  const top = centerY - H / 2
  const fontSize = designVw(8)
  const arrowFontSize = designVw(8)
  return (
    <div
      className="settings-modifier-pill"
      style={{
        left: pct(leftX),
        top: pct(top),
        width: pct(W),
        height: pct(H),
        fontSize
      }}
    >
      <button
        className="settings-modifier-arrow"
        style={{ fontSize: arrowFontSize }}
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        ◀
      </button>
      <span className="settings-modifier-value">
        {value} {unit}
      </span>
      <button
        className="settings-modifier-arrow"
        style={{ fontSize: arrowFontSize }}
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        aria-label="Increase"
      >
        ▶
      </button>
    </div>
  )
}