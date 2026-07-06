import React, { useMemo } from 'react'
import { useStore } from '../store'
import { Task, STATUS_COLORS } from '../types'

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']

function getMonthFirstDay(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function formatDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function makeDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function getTodayStr(): string {
  return formatDateLocal(new Date())
}

interface Props {
  onTaskClick?: (task: Task) => void
}

export default function MonthView({ onTaskClick }: Props) {
  const { state, dispatch } = useStore()

  const todayStr = getTodayStr()
  const selectedParts = state.selectedDate.split('-')
  const selYear = parseInt(selectedParts[0])
  const selMonth = parseInt(selectedParts[1]) - 1

  const goPrev = () => {
    const newDate = new Date(selYear, selMonth - 1, 1)
    dispatch({ type: 'SET_DATE', payload: formatDateLocal(newDate) })
  }
  const goNext = () => {
    const newDate = new Date(selYear, selMonth + 1, 1)
    dispatch({ type: 'SET_DATE', payload: formatDateLocal(newDate) })
  }
  const goToday = () => dispatch({ type: 'SET_DATE', payload: todayStr })
  const goDay = (d: string) => {
    dispatch({ type: 'SET_DATE', payload: d })
    dispatch({ type: 'SET_VIEW', payload: 'day' })
  }

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
      date: makeDateStr(selYear, selMonth - 1, prevMonthDays - i),
      day: prevMonthDays - i,
      isOther: true,
    })
  }

  for (let d = 1; d <= daysCount; d++) {
    cells.push({
      date: makeDateStr(selYear, selMonth, d),
      day: d,
      isOther: false,
    })
  }

  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: makeDateStr(selYear, selMonth + 1, d),
      day: d,
      isOther: true,
    })
  }

  return (
    <div className="view-container">
      <div className="date-nav">
        <button className="date-nav-btn" onClick={goPrev}>{'\u25C0'}</button>
        <span className="date-nav-date">{selYear}年{selMonth + 1}月</span>
        <button className="date-nav-btn" onClick={goNext}>{'\u25B6'}</button>
        <button className="date-nav-today" onClick={goToday}>今天</button>
      </div>
      <div className="month-view">
        <div className="month-header">
          {DAY_NAMES.map(name => (
            <div key={name} className="month-day-name">{name}</div>
          ))}
        </div>
        <div className="month-body">
          {cells.map(cell => {
            const tasks = tasksByDay[cell.date] || []
            const isToday = cell.date === todayStr
            return (
              <div
                key={cell.date}
                className={'month-cell' + (cell.isOther ? ' other-month' : '') + (isToday ? ' today' : '')}
                onClick={() => goDay(cell.date)}
              >
                <div className="month-cell-date">{cell.day}</div>
                {tasks.slice(0, 3).map(task => {
                  const isDone = task.status === 'done'
                  return (
                    <div
                      key={task.id}
                      className="month-task-dot"
                      style={{
                        background: STATUS_COLORS[task.status],
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.65 : 1,
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        onTaskClick?.(task)
                      }}
                    >{task.title}</div>
                  )
                })}
                {tasks.length > 3 && (
                  <div className="month-more">+{tasks.length - 3} 更多</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
