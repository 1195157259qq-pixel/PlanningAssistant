import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react'
import { AppState, AppAction, Task, TaskStatus, CountdownEvent } from './types'

function getTodayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function collectCategories(tasks: Task[], existing: string[]): string[] {
  const set = new Set(existing)
  tasks.forEach(t => {
    if (t.category) set.add(t.category)
  })
  return Array.from(set).sort()
}

function refreshOverdue(tasks: Task[]): Task[] {
  const todayStr = getTodayStr()
  return tasks.map(task => {
    if (!task.hasDueDate || !task.dueDate) return task
    if (task.status === 'todo' && task.dueDate < todayStr) {
      return { ...task, status: 'overdue' as TaskStatus }
    }
    if (task.status === 'overdue' && task.dueDate >= todayStr) {
      return { ...task, status: 'todo' as TaskStatus }
    }
    return task
  })
}

function generateRepeatTasks(tasks: Task[]): Task[] {
  const todayStr = getTodayStr()
  const generatedTasks: Task[] = []

  tasks.forEach(task => {
    if (task.repeat === 'none' || !task.hasDueDate || !task.dueDate || !task.createdAt) return

    const creationDate = task.createdAt.split('T')[0]
    const dueDate = task.dueDate

    const start = new Date(creationDate + 'T00:00:00')
    const end = new Date(dueDate + 'T00:00:00')

    if (start > end) return

    const creationDay = start.getDay()
    const creationDayNum = start.getDate()
    const creationMonth = start.getMonth()

    let cursor = new Date(start)

    while (cursor <= end) {
      const cursorStr = formatDateLocal(cursor)
      let shouldAdd = false

      switch (task.repeat) {
        case 'daily':
          shouldAdd = true
          break
        case 'weekly':
          shouldAdd = cursor.getDay() === creationDay
          break
        case 'monthly': {
          const lastDayOfMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
          const targetDay = Math.min(creationDayNum, lastDayOfMonth)
          shouldAdd = cursor.getDate() === targetDay
          break
        }
        case 'yearly':
          shouldAdd = cursor.getMonth() === creationMonth && cursor.getDate() === creationDayNum
          break
      }

      if (shouldAdd) {
        const alreadyExists =
          tasks.some(t => t.title === task.title && t.dueDate === cursorStr) ||
          generatedTasks.some(t => t.title === task.title && t.dueDate === cursorStr)
        if (!alreadyExists) {
          const newStatus: TaskStatus = cursorStr < todayStr ? 'overdue' : 'todo'
          generatedTasks.push({
            ...task,
            id: generateId(),
            dueDate: cursorStr,
            repeat: 'none',
            status: newStatus,
            createdAt: new Date().toISOString(),
          })
        }
      }

      cursor.setDate(cursor.getDate() + 1)
    }
  })

  return [...tasks, ...generatedTasks]
}

const initialState: AppState = {
  tasks: [],
  currentView: 'list',
  selectedDate: getTodayStr(),
  categories: [],
  countdowns: [],
  pomodoroSessions: 0,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        status: action.payload.hasDueDate && action.payload.dueDate < getTodayStr() ? 'overdue' : 'todo',
      }
      const tasks = refreshOverdue(generateRepeatTasks([...state.tasks, newTask]))
      const categories = collectCategories(tasks, state.categories)
      return { ...state, tasks, categories }
    }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: refreshOverdue(generateRepeatTasks(state.tasks.map(t => t.id === action.payload.id ? action.payload : t))),
      }
    case 'DELETE_TASK': {
      const tasks = refreshOverdue(state.tasks.filter(t => t.id !== action.payload))
      const categories = collectCategories(tasks, state.categories)
      return { ...state, tasks, categories }
    }
    case 'SET_STATUS': {
      const tasks = state.tasks.map(t => {
        if (t.id !== action.payload.id) return t
        return { ...t, status: action.payload.status }
      })
      return { ...state, tasks }
    }
    case 'SET_VIEW':
      return { ...state, currentView: action.payload }
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload }
    case 'LOAD_TASKS':
      return { ...state, tasks: refreshOverdue(generateRepeatTasks(action.payload)) }
    case 'LOAD_STATE': {
      const categories = collectCategories(action.payload.tasks, action.payload.categories || [])
      return { ...state, ...action.payload, categories }
    }
    case 'ADD_COUNTDOWN': {
      const newCountdown: CountdownEvent = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      return { ...state, countdowns: [...state.countdowns, newCountdown] }
    }
    case 'DELETE_COUNTDOWN':
      return { ...state, countdowns: state.countdowns.filter(c => c.id !== action.payload) }
    case 'INCREMENT_POMODORO':
      return { ...state, pomodoroSessions: state.pomodoroSessions + 1 }
    case 'UPDATE_CATEGORIES':
      return { ...state, categories: action.payload }
    default:
      return state
  }
}

interface StoreContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const StoreContext = createContext<StoreContextValue | null>(null)

const STORAGE_KEY = 'planning-assistant-state'

export function StoreProvider({ children }: { children: ReactNode }) {
  const tasksRef = useRef<Task[]>([])

  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        const tasks: Task[] = (data.tasks || []).map((t: Partial<Task>) => ({
          ...t,
          repeat: t.repeat || 'none',
          category: t.category || '',
          location: t.location || '',
          hasDueDate: t.hasDueDate ?? (!!t.dueDate),
        }))
        const countdowns: CountdownEvent[] = (data.countdowns || []).map((c: Partial<CountdownEvent>) => ({
          ...c,
          targetTime: c.targetTime || '',
        }))
        return {
          ...init,
          tasks: refreshOverdue(generateRepeatTasks(tasks)),
          categories: data.categories || [],
          countdowns,
          pomodoroSessions: data.pomodoroSessions || 0,
        }
      }
    } catch { /* ignore */ }
    return init
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tasks: state.tasks,
      categories: state.categories,
      countdowns: state.countdowns,
      pomodoroSessions: state.pomodoroSessions,
    }))
  }, [state.tasks, state.categories, state.countdowns, state.pomodoroSessions])

  useEffect(() => {
    tasksRef.current = state.tasks
  }, [state.tasks])

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'LOAD_TASKS', payload: tasksRef.current })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return React.createElement(StoreContext.Provider, { value: { state, dispatch } }, children)
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { getTodayStr, generateId, refreshOverdue }
