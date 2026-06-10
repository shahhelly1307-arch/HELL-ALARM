import { useState } from 'react'
import { designVw, pct, TASK_SPRITES } from '../../lib/canvas'
import { themed } from '../../lib/assets'

interface AddTaskInputProps {
  onAdd: (text: string) => void
  dark: boolean
}

const FIELD = TASK_SPRITES.addField
const BTN = TASK_SPRITES.addButton

export function AddTaskInput({ onAdd, dark }: AddTaskInputProps): React.JSX.Element {
  const [text, setText] = useState('')

  function submit(): void {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <>
      {/* Full-frame field + "+" button PNGs at their baked positions. */}
      <img className="canvas-layer" src={themed(FIELD.key, dark)} alt="" />
      <img className="canvas-layer" src={themed(BTN.key, dark)} alt="" />

      {/* Text input overlaid on the field pill. */}
      <input
        className="task-add-input"
        value={text}
        placeholder="add a task..."
        style={{
          left: pct(FIELD.x),
          top: pct(FIELD.y),
          width: pct(FIELD.w),
          height: pct(FIELD.h),
          fontSize: designVw(8)
        }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          else if (e.key === 'Escape') setText('')
        }}
      />

      {/* Transparent click target over the "+" button. */}
      <button
        className="task-hit"
        onClick={submit}
        disabled={!text.trim()}
        aria-label="Add task"
        title="Add task"
        style={{ left: pct(BTN.x), top: pct(BTN.y), width: pct(BTN.w), height: pct(BTN.h) }}
      />
    </>
  )
}