import React, { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Task, STATUS_COLORS } from '../types'
import TaskDetailModal from './TaskDetailModal'

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']

function getMonthFirstDay(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function MonthView() {
  const { state, dispatch } = useStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const selectedParts = state.selectedDate.split('-')
  const selYear = parseInt(selectedParts[0])
  const selMonth = parseInt(selectedParts[1]) - 1

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {}
    state.tasks.forEach(task => {
      if (!map[task.dueDate]) map[task.dueDate] = []
      map[task.dueDate].push(task)
    })
    return map
  }, [state.tasks])

  const firstDay = getMonthFirstDay(selYear, selMonth)
  const daysCount = getDaysInMonth(selYear, selMonth)
  const prevMonthDays = getDaysInMonth(selYear, selMonth - 1)

  const cells: { date: string; day: number; isOther: boolean }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      date: formatDate(selYear, selMonth - 1, prevMonthDays - i),
      day: prevMonthDays - i,
      isOther: true,
    })
  }

  for (let d = 1; d <= daysCount; d++) {
    cells.push({
      date: formatDate(selYear, selMonth, d),
      day: d,
      isOther: false,
    })
  }

  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: formatDate(selYear, selMonth + 1, d),
      day: d,
      isOther: true,
    })
  }

  const changMonth = (delta: number) => {
    const newDate = new Date(selYear, selMonth + delta, 1)
    dispatch({ type: 'SET_DATE', payload: newDate.toISOString().split('T')[0] })
  }

  return React.createElement('div', { className: 'view-container' },
    React.createElement('div', { className: 'date-nav' },
      React.createElement('button', {
        className: 'date-nav-btn',
        onClick: () => changMonth(-1),
      }, '\u2039'),
      React.createElement('span', { className: 'date-nav-date' },
        `${selYear}年${selMonth + 1}月`,
      ),
      React.createElement('button', {
        className: 'date-nav-btn',
        onClick: () => changMonth(1),
      }, '\u203A'),
      React.createElement('button', {
        className: 'date-nav-today',
        onClick: () => dispatch({ type: 'SET_DATE', payload: todayStr }),
      }, '今天'),
    ),
    React.createElement('div', { className: 'month-view' },
      React.createElement('div', { className: 'month-header' },
        ...DAY_NAMES.map(name =>
          React.createElement('div', { key: name, className: 'month-day-name' }, name),
        ),
      ),
      React.createElement('div', { className: 'month-body' },
        ...cells.map(cell => {
          const tasks = tasksByDay[cell.date] || []
          const isToday = cell.date === todayStr

          return React.createElement('div', {
            key: cell.date,
            className: 'month-cell' +
              (cell.isOther ? ' other-month' : '') +
              (isToday ? ' today' : ''),
            onClick: () => dispatch({ type: 'SET_DATE', payload: cell.date }),
          },
            React.createElement('div', { className: 'month-cell-date' }, String(cell.day)),
            ...tasks.slice(0, 3).map(task => {
              const isDone = task.status === 'done' || task.status === 'overdue-done'
              return React.createElement('div', {
                key: task.id,
                className: 'month-task-dot',
                style: {
                  background: STATUS_COLORS[task.status],
                  textDecoration: isDone ? 'line-through' : 'none',
                  opacity: isDone ? 0.65 : 1,
                },
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation()
                  setSelectedTask(task)
                },
              }, task.title)
            }),
            tasks.length > 3 && React.createElement('div', { className: 'month-more' },
              `+${tasks.length - 3} 更多`,
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
