import React, { useMemo } from 'react'
import { useStore } from '../store'
import { Task, STATUS_COLORS } from '../types'

function formatDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return formatDateLocal(d)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return formatDateLocal(d)
}

function getTodayStr(): string {
  return formatDateLocal(new Date())
}

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

interface Props {
  onEdit?: (task: Task) => void
  onDeleteWithUndo?: (task: Task) => void
  onTaskClick?: (task: Task) => void
}

export default function WeekView({ onTaskClick }: Props) {
  const { state, dispatch } = useStore()

  const todayStr = getTodayStr()
  const weekStart = getWeekStart(state.selectedDate)
  const weekEnd = addDays(weekStart, 6)

  const goPrev = () => dispatch({ type: 'SET_DATE', payload: addDays(weekStart, -7) })
  const goNext = () => dispatch({ type: 'SET_DATE', payload: addDays(weekStart, 7) })
  const goToday = () => dispatch({ type: 'SET_DATE', payload: todayStr })
  const goDay = (d: string) => {
    dispatch({ type: 'SET_DATE', payload: d })
    dispatch({ type: 'SET_VIEW', payload: 'day' })
  }

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

  return (
    <div className="view-container">
      <div className="date-nav">
        <button className="date-nav-btn" onClick={goPrev}>{'\u25C0'}</button>
        <span className="date-nav-date">{formatMonthDay(weekStart)} - {formatMonthDay(weekEnd)}</span>
        <button className="date-nav-btn" onClick={goNext}>{'\u25B6'}</button>
        <button className="date-nav-today" onClick={goToday}>今天</button>
      </div>
      <div className="week-view">
        <div className="week-header">
          {weekDays.map((d, i) => (
            <div
              key={d}
              className={'week-day-header' + (d === todayStr ? ' today' : '')}
              onClick={() => goDay(d)}
              style={{ cursor: 'pointer' }}
            >
              <span className="week-day-num">{String(new Date(d + 'T00:00:00').getDate())}</span>
              {DAY_NAMES[i]}
            </div>
          ))}
        </div>
        <div className="week-body">
          {weekDays.map(d => (
            <div key={d} className="week-day-col">
              <div onClick={() => goDay(d)} style={{ cursor: 'pointer', minHeight: 8 }} />
              {tasksByDay[d].map(task => {
                const isDone = task.status === 'done'
                return (
                  <div
                    key={task.id}
                    className="week-task-dot"
                    style={{
                      background: STATUS_COLORS[task.status],
                      textDecoration: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.65 : 1,
                    }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      onTaskClick?.(task)
                    }}
                    title={task.title}
                  >{task.title}</div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
