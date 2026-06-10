import {
  designVw,
  pct,
  TASK_FILTER_LABELS,
  TASK_FILTER_SEGMENTS,
  TASK_FILTER_SPRITES,
  TASK_SPRITES
} from '../../lib/canvas'
import { themed } from '../../lib/assets'
import type { TaskFilter } from '../../lib/tasks'

interface TaskFiltersProps {
  filter: TaskFilter
  dark: boolean
  setFilter: (f: TaskFilter) => void
  onClearDone: () => void
  hasDone: boolean
}

const ORDER: TaskFilter[] = ['all', 'active', 'done']
const TRASH = TASK_SPRITES.trash

export function TaskFilters({
  filter,
  dark,
  setFilter,
  onClearDone,
  hasDone
}: TaskFiltersProps): React.JSX.Element {
  return (
    <>
      {/* Full-frame bar PNG for the active filter — already positioned in the art. */}
      <img className="canvas-layer" src={themed(TASK_FILTER_SPRITES[filter], dark)} alt="" />

      {/* Labels at their exact Figma positions (the PNGs have no baked text). */}
      {ORDER.map((value) => {
        const lab = TASK_FILTER_LABELS[value]
        return (
          <div
            key={`label-${value}`}
            className={`task-filter-label ${filter === value ? 'is-active' : ''}`}
            style={{
              left: pct(lab.x),
              top: pct(lab.y),
              width: pct(lab.w),
              height: pct(lab.h),
              fontSize: designVw(8),
              lineHeight: designVw(17)
            }}
          >
            {value}
          </div>
        )
      })}

      {/* Transparent click targets covering each pill. */}
      {ORDER.map((value) => {
        const seg = TASK_FILTER_SEGMENTS[value]
        return (
          <button
            key={`hit-${value}`}
            className="task-hit"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            aria-label={`Show ${value} tasks`}
            style={{ left: pct(seg.x), top: pct(seg.y), width: pct(seg.w), height: pct(seg.h) }}
          />
        )
      })}

      {/* Full-frame trash PNG (dimmed when nothing to clear) + click target. */}
      <img
        className={`canvas-layer task-trash-img ${hasDone ? '' : 'is-disabled'}`}
        src={themed(TRASH.key, dark)}
        alt=""
      />
      <button
        className="task-hit"
        onClick={onClearDone}
        disabled={!hasDone}
        aria-label="Clear completed tasks"
        title={hasDone ? 'Clear completed tasks' : 'No completed tasks to clear'}
        style={{ left: pct(TRASH.x), top: pct(TRASH.y), width: pct(TRASH.w), height: pct(TRASH.h) }}
      />
    </>
  )
}