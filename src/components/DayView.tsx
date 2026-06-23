import React, { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Task, STATUS_COLORS } from '../types'
import TaskDetailModal from './TaskDetailModal'

function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayView() {
  const { state, dispatch } = useStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const dateStr = state.selectedDate
  const todayStr = new Date().toISOString().split('T')[0]

  const dayTasks = useMemo(() => {
    return state.tasks.filter(t => t.dueDate === dateStr)
  }, [state.tasks, dateStr])

  const tasksByHour = useMemo(() => {
    const map: Record<number, Task[]> = {}
    HOURS.forEach(h => { map[h] = [] })
    dayTasks.forEach(task => {
      if (task.dueTime) {
        const hour = parseInt(task.dueTime.split(':')[0], 10)
        if (hour >= 0 && hour < 24) {
          map[hour].push(task)
          return
        }
      }
      map[8].push(task)
    })
    return map
  }, [dayTasks])

  return React.createElement('div', { className: 'view-container' },
    React.createElement('div', { className: 'date-nav' },
      React.createElement('button', {
        className: 'date-nav-btn',
        onClick: () => dispatch({ type: 'SET_DATE', payload: addDays(dateStr, -1) }),
      }, '\u2039'),
      React.createElement('span', { className: 'date-nav-date' }, formatDateCN(dateStr)),
      React.createElement('button', {
        className: 'date-nav-btn',
        onClick: () => dispatch({ type: 'SET_DATE', payload: addDays(dateStr, 1) }),
      }, '\u203A'),
      React.createElement('button', {
        className: 'date-nav-today',
        onClick: () => dispatch({ type: 'SET_DATE', payload: todayStr }),
      }, '今天'),
    ),
    React.createElement('div', { className: 'day-view' },
      dayTasks.length === 0
        ? React.createElement('div', { className: 'day-no-tasks' }, '当天没有任务')
        : React.createElement('div', { className: 'day-slots' },
            ...HOURS.map(hour => {
              const tasks = tasksByHour[hour]
              if (tasks.length === 0) return null
              return React.createElement('div', { className: 'day-slot', key: hour },
                React.createElement('div', { className: 'day-slot-time' },
                  `${String(hour).padStart(2, '0')}:00`,
                ),
                React.createElement('div', { className: 'day-slot-content' },
                  ...tasks.map(task => {
                    const isDone = task.status === 'done' || task.status === 'overdue-done'
                    return React.createElement('div', {
                      key: task.id,
                      className: 'day-task-chip',
                      style: {
                        background: STATUS_COLORS[task.status],
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.65 : 1,
                      },
                      onClick: () => setSelectedTask(task),
                    }, task.title + (task.dueTime ? ' ' + task.dueTime : ''))
                  }),
                ),
              )
            }),
          ),
    ),
    selectedTask && React.createElement(TaskDetailModal, {
      task: selectedTask,
      onClose: () => setSelectedTask(null),
    }),
  )
}
