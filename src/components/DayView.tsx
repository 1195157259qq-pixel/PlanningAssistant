import { useMemo } from 'react'
import { useStore } from '../store'
import { Task, STATUS_COLORS, REPEAT_COLORS } from '../types'

function formatDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return formatDateLocal(d)
}

function getTodayStr(): string {
  return formatDateLocal(new Date())
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface Props {
  onEdit?: (task: Task) => void
  onDeleteWithUndo?: (task: Task) => void
  onTaskClick?: (task: Task) => void
}

export default function DayView({ onTaskClick }: Props) {
  const { state, dispatch } = useStore()

  const dateStr = state.selectedDate
  const todayStr = getTodayStr()

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

  return (
    <div className="view-container">
      <div className="date-nav">
        <button className="date-nav-btn" onClick={() => {
          dispatch({ type: 'SET_DATE', payload: addDays(state.selectedDate, -1) })
        }}>{'\u25C0'}</button>
        <span className="date-nav-date">{formatDateCN(dateStr)}</span>
        <button className="date-nav-btn" onClick={() => {
          dispatch({ type: 'SET_DATE', payload: addDays(state.selectedDate, 1) })
        }}>{'\u25B6'}</button>
        <button className="date-nav-today" onClick={() => {
          dispatch({ type: 'SET_DATE', payload: todayStr })
        }}>今天</button>
      </div>
      <div className="day-view">
        {dayTasks.length === 0 ? (
          <div className="day-no-tasks">当天没有任务</div>
        ) : (
          <div className="day-slots">
            {HOURS.map(hour => {
              const tasks = tasksByHour[hour]
              if (tasks.length === 0) return null
              return (
                <div className="day-slot" key={hour}>
                  <div className="day-slot-time">{String(hour).padStart(2, '0')}:00</div>
                  <div className="day-slot-content">
                    {tasks.map(task => {
                      const isDone = task.status === 'done'
                      const color = REPEAT_COLORS[task.repeat]
                      return (
                        <div
                          key={task.id}
                          className="day-task-chip"
                          style={{
                            background: color + 'dd',
                            textDecoration: isDone ? 'line-through' : 'none',
                            opacity: isDone ? 0.55 : 1,
                          }}
                          onClick={() => onTaskClick?.(task)}
                        >
                          {task.title}{task.dueTime ? ' ' + task.dueTime : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
