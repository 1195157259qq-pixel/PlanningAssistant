import React, { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Task, STATUS_COLORS } from '../types'
import TaskDetailModal from './TaskDetailModal'

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function WeekView() {
  const { state, dispatch } = useStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const weekStart = getWeekStart(state.selectedDate)
  const weekEnd = addDays(weekStart, 6)

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {}
    weekDays.forEach(d => { map[d] = [] })
    state.tasks.forEach(task => {
      if (map[task.dueDate]) {
        map[task.dueDate].push(task)
      }
    })
    return map
  }, [state.tasks, weekDays])

  function formatMonthDay(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return React.createElement('div', { className: 'view-container' },
    React.createElement('div', { className: 'date-nav' },
      React.createElement('button', {
        className: 'date-nav-btn',
        onClick: () => dispatch({ type: 'SET_DATE', payload: addDays(weekStart, -7) }),
      }, '\u2039'),
      React.createElement('span', { className: 'date-nav-date' },
        `${formatMonthDay(weekStart)} - ${formatMonthDay(weekEnd)}`,
      ),
      React.createElement('button', {
        className: 'date-nav-btn',
        onClick: () => dispatch({ type: 'SET_DATE', payload: addDays(weekStart, 7) }),
      }, '\u203A'),
      React.createElement('button', {
        className: 'date-nav-today',
        onClick: () => dispatch({ type: 'SET_DATE', payload: todayStr }),
      }, '今天'),
    ),
    React.createElement('div', { className: 'week-view' },
      React.createElement('div', { className: 'week-header' },
        ...weekDays.map((d, i) =>
          React.createElement('div', {
            key: d,
            className: 'week-day-header' + (d === todayStr ? ' today' : ''),
          },
            React.createElement('span', { className: 'week-day-num' },
              String(new Date(d + 'T00:00:00').getDate()),
            ),
            DAY_NAMES[i],
          ),
        ),
      ),
      React.createElement('div', { className: 'week-body' },
        ...weekDays.map(d =>
          React.createElement('div', { key: d, className: 'week-day-col' },
            ...tasksByDay[d].map(task => {
              const isDone = task.status === 'done' || task.status === 'overdue-done'
              return React.createElement('div', {
                key: task.id,
                className: 'week-task-dot',
                style: {
                  background: STATUS_COLORS[task.status],
                  textDecoration: isDone ? 'line-through' : 'none',
                  opacity: isDone ? 0.65 : 1,
                },
                onClick: () => setSelectedTask(task),
                title: task.title,
              }, task.title)
            }),
          ),
        ),
      ),
    ),
    selectedTask && React.createElement(TaskDetailModal, {
      task: selectedTask,
      onClose: () => setSelectedTask(null),
    }),
  )
}
