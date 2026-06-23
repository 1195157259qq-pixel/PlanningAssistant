import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { AppState, AppAction, Task, TaskStatus } from './types'

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
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
    if (task.status === 'done' && task.dueDate < todayStr) {
      return { ...task, status: 'overdue-done' as TaskStatus }
    }
    if (task.status === 'overdue' && task.dueDate >= todayStr) {
      return { ...task, status: 'todo' as TaskStatus }
    }
    if (task.status === 'overdue-done' && task.dueDate >= todayStr) {
      return { ...task, status: 'done' as TaskStatus }
    }
    return task
  })
}

const initialState: AppState = {
  tasks: [],
  currentView: 'list',
  selectedDate: getTodayStr(),
  categories: [],
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
      const tasks = refreshOverdue([...state.tasks, newTask])
      const categories = collectCategories(tasks, state.categories)
      return { ...state, tasks, categories }
    }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: refreshOverdue(state.tasks.map(t => t.id === action.payload.id ? action.payload : t)),
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
      return { ...state, tasks: refreshOverdue(action.payload) }
    case 'LOAD_STATE': {
      const categories = collectCategories(action.payload.tasks, action.payload.categories || [])
      return { ...state, ...action.payload, categories }
    }
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
        return {
          ...init,
          tasks: refreshOverdue(tasks),
          categories: data.categories || [],
        }
      }
    } catch { /* ignore */ }
    return init
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tasks: state.tasks,
      categories: state.categories,
    }))
  }, [state.tasks, state.categories])

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'LOAD_TASKS', payload: state.tasks })
    }, 60000)
    return () => clearInterval(interval)
  }, [state.tasks])

  return React.createElement(StoreContext.Provider, { value: { state, dispatch } }, children)
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export { getTodayStr, generateId, refreshOverdue }
