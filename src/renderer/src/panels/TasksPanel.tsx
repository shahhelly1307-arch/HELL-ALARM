import { useState } from 'react'
import { AddTaskInput } from '../components/tasks/AddTaskInput'
import { TaskFilters } from '../components/tasks/TaskFilters'
import { TaskRow } from '../components/tasks/TaskRow'
import { pct, TASK_LIST } from '../lib/canvas'
import { applyTaskFilter, newTask, type Task, type TaskFilter } from '../lib/tasks'

interface TasksPanelProps {
  tasks: Task[]
  setTasks: (updater: (prev: Task[]) => Task[]) => void
  dark: boolean
}

export function TasksPanel({ tasks, setTasks, dark }: TasksPanelProps): React.JSX.Element {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const filtered = applyTaskFilter(tasks, filter)
  const hasDone = tasks.some((t) => t.done)

  function patchTask(id: string, patch: Partial<Task>): void {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function addTask(text: string): void {
    setTasks((prev) => [...prev, newTask(text)])
  }

  // Trash clears every completed task at once.
  function clearDone(): void {
    setTasks((prev) => prev.filter((t) => !t.done))
    setSelectedId((id) => (id && tasks.some((t) => t.id === id && t.done) ? null : id))
  }

  // Reorder applies to the unfiltered tasks array using id identity, so dragging
  // works regardless of which filter view is active.
  function reorder(): void {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) return
    const draggedTask = filtered[dragIndex]
    const targetTask = filtered[dragOverIndex]
    if (!draggedTask || !targetTask) return
    setTasks((prev) => {
      const next = prev.slice()
      const fromIdx = next.findIndex((t) => t.id === draggedTask.id)
      const toIdx = next.findIndex((t) => t.id === targetTask.id)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }

  function endDrag(): void {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <>
      <AddTaskInput onAdd={addTask} dark={dark} />

      {/* Scrollable list — rows stack at the Figma row pitch; overflow scrolls. */}
      <div
        className="task-list-viewport"
        style={{
          left: pct(TASK_LIST.x),
          top: pct(TASK_LIST.y),
          width: pct(TASK_LIST.w),
          height: pct(TASK_LIST.h)
        }}
      >
        <div className="task-list-track">
          {filtered.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              dark={dark}
              isSelected={selectedId === task.id}
              isDragOver={dragOverIndex === i && dragIndex !== i}
              onSelect={() => setSelectedId(task.id === selectedId ? null : task.id)}
              onToggle={() => patchTask(task.id, { done: !task.done })}
              onTextChange={(text) => patchTask(task.id, { text })}
              onDragStart={() => setDragIndex(i)}
              onDragOver={() => setDragOverIndex(i)}
              onDragEnd={endDrag}
              onDrop={() => {
                reorder()
                endDrag()
              }}
            />
          ))}
        </div>
      </div>

      <TaskFilters
        filter={filter}
        dark={dark}
        setFilter={setFilter}
        onClearDone={clearDone}
        hasDone={hasDone}
      />
    </>
  )
}