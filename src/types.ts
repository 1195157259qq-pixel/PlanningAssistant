export type TaskStatus = 'todo' | 'done' | 'overdue'
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  dueTime: string
  hasDueDate: boolean
  repeat: RepeatType
  category: string
  location: string
  status: TaskStatus
  createdAt: string
}

export interface CountdownEvent {
  id: string
  title: string
  targetDate: string
  targetTime: string
  createdAt: string
}

export type ViewType = 'list' | 'day' | 'week' | 'month' | 'tools'

export interface AppState {
  tasks: Task[]
  currentView: ViewType
  selectedDate: string
  categories: string[]
  countdowns: CountdownEvent[]
  pomodoroSessions: number
}

export type AppAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_STATUS'; payload: { id: string; status: TaskStatus } }
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_COUNTDOWN'; payload: Omit<CountdownEvent, 'id' | 'createdAt'> }
  | { type: 'DELETE_COUNTDOWN'; payload: string }
  | { type: 'INCREMENT_POMODORO' }
  | { type: 'UPDATE_CATEGORIES'; payload: string[] }

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': '待办',
  'done': '已办',
  'overdue': '过期未办',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'todo': '#7cc5ea',
  'done': '#8fd4a3',
  'overdue': '#f5a97f',
}

export const REPEAT_LABELS: Record<RepeatType, string> = {
  'none': '不重复',
  'daily': '每日',
  'weekly': '每周',
  'monthly': '每月',
  'yearly': '每年',
}

export const REPEAT_COLORS: Record<RepeatType, string> = {
  'none': '#a599b0',
  'daily': '#f7a1c4',
  'weekly': '#f5a97f',
  'monthly': '#7cc5ea',
  'yearly': '#8fd4a3',
}
