import { useState } from 'react'
import { designVw, spriteCropStyle, TASK_SPRITES } from '../../lib/canvas'
import type { Task } from '../../lib/tasks'

interface TaskRowProps {
  task: Task
  dark: boolean
  isSelected: boolean
  isDragOver: boolean
  onSelect: () => void
  onToggle: () => void
  onTextChange: (text: string) => void
  onDragStart: () => void
  onDragOver: () => void
  onDragEnd: () => void
  onDrop: () => void
}

// Inner element placement, expressed as a percentage of the row box (the row is
// TASK_SPRITES.row.w x .h design units). Derived from the Figma sprite offsets so
// the checkbox and text land exactly where the "task 1" group has them.
const ROW = TASK_SPRITES.row
const CB = TASK_SPRITES.checkbox
// The pill art occupies the top 27px of the 37px slot; center the checkbox/text
// inside that band so they sit on the pill, not in the gap below it.
const ART_H = 27
const ART_H_PCT = (ART_H / ROW.h) * 100
const CB_LEFT = ((CB.x - ROW.x) / ROW.w) * 100
const CB_TOP = ((CB.y - ROW.y) / ROW.h) * 100
const CB_W = (CB.w / ROW.w) * 100
const CB_H = (CB.h / ROW.h) * 100
// Text starts just right of the checkbox and runs to the row's right edge.
const TXT_X = CB.x + CB.w + 5
const TXT_LEFT = ((TXT_X - ROW.x) / ROW.w) * 100
const TXT_W = ((ROW.x + ROW.w - 6 - TXT_X) / ROW.w) * 100

export function TaskRow({
  task,
  dark,
  isSelected,
  isDragOver,
  onSelect,
  onToggle,
  onTextChange,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop
}: TaskRowProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  function commitEdit(): void {
    const next = editText.trim()
    if (next && next !== task.text) onTextChange(next)
    setEditing(false)
  }

  return (
    <div
      className={`task-row ${isSelected ? 'is-selected' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
      draggable={!editing}
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      style={{
        // Row height = pitch, derived from the row sprite aspect (cqw = 1% of the
        // viewport width; the canvas is square so this gives ROW.h design units).
        height: `calc(100cqw * ${ROW.h} / ${ROW.w})`,
        ...spriteCropStyle(ROW, dark)
      }}
    >
      <button
        className="task-checkbox"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        aria-pressed={task.done}
        aria-label={task.done ? 'Mark not done' : 'Mark done'}
        style={{
          left: `${CB_LEFT}%`,
          top: `${CB_TOP}%`,
          width: `${CB_W}%`,
          height: `${CB_H}%`,
          ...spriteCropStyle(task.done ? TASK_SPRITES.checkboxDone : TASK_SPRITES.checkbox, dark)
        }}
      />

      {editing ? (
        <input
          className="task-edit-input"
          value={editText}
          autoFocus
          style={{
            top: `${(1 / ROW.h) * 100}%`,
            left: `${TXT_LEFT}%`,
            width: `${TXT_W}%`,
            height: `${ART_H_PCT}%`,
            fontSize: designVw(8)
          }}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            else if (e.key === 'Escape') {
              setEditText(task.text)
              setEditing(false)
            }
          }}
        />
      ) : (
        <button
          className={`task-text ${task.done ? 'is-done' : ''}`}
          style={{
            top: `${(1 / ROW.h) * 100}%`,
            left: `${TXT_LEFT}%`,
            width: `${TXT_W}%`,
            height: `${ART_H_PCT}%`,
            fontSize: designVw(8)
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
            setEditText(task.text)
            setEditing(true)
          }}
          title="Click to edit"
        >
          {task.text}
        </button>
      )}
    </div>
  )
}