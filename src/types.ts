export type TaskStatus = 'todo' | 'done' | 'overdue' | 'overdue-done'
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

export type ViewType = 'list' | 'day' | 'week' | 'month' | 'tools'

export interface AppState {
  tasks: Task[]
  currentView: ViewType
  selectedDate: string
  categories: string[]
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

export const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': '待办',
  'done': '已办',
  'overdue': '过期待办',
  'overdue-done': '过期已办',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'todo': '#3b82f6',
  'done': '#10b981',
  'overdue': '#ef4444',
  'overdue-done': '#f59e0b',
}

export const REPEAT_LABELS: Record<RepeatType, string> = {
  'none': '不重复',
  'daily': '每天',
  'weekly': '每周',
  'monthly': '每月',
  'yearly': '每年',
}
