import React, { useState, useMemo } from 'react'
import { useStore, getTodayStr } from '../store'
import { Task, TaskStatus, STATUS_COLORS } from '../types'
import TaskItem from './TaskItem'

type FilterKey = 'all' | TaskStatus
type DateRangeKey = 'today' | 'week' | 'month' | 'all'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'todo', label: '待办' },
  { key: 'done', label: '已办' },
  { key: 'overdue', label: '过期未办' },
]

const DATE_RANGES: { key: DateRangeKey; label: string }[] = [
  { key: 'today', label: '当日' },
  { key: 'week', label: '一周内' },
  { key: 'month', label: '一月内' },
  { key: 'all', label: '所有' },
]

interface Props {
  onEdit?: (task: Task) => void
  onDeleteWithUndo?: (task: Task) => void
  onTaskClick?: (task: Task) => void
}

export default function TaskListView({ onEdit, onDeleteWithUndo, onTaskClick }: Props) {
  const { state } = useStore()
  const [filter, setFilter] = useState<FilterKey>('todo')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRangeKey>('today')

  const todayStr = getTodayStr()

  function addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + n)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const weekEnd = addDays(todayStr, 7)
  const monthEnd = addDays(todayStr, 30)

  const filteredTasks = useMemo(() => {
    let tasks = filter === 'all' ? state.tasks : state.tasks.filter(t => t.status === filter)
    if (filter === 'todo') {
      if (dateRange === 'today') {
        tasks = tasks.filter(t => t.dueDate === todayStr)
      } else if (dateRange === 'week') {
        tasks = tasks.filter(t => t.dueDate >= todayStr && t.dueDate <= weekEnd)
      } else if (dateRange === 'month') {
        tasks = tasks.filter(t => t.dueDate >= todayStr && t.dueDate <= monthEnd)
      }
    }
    if (catFilter) {
      tasks = tasks.filter(t => t.category === catFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
      )
    }
    return tasks
  }, [state.tasks, filter, search, catFilter, todayStr, weekEnd, monthEnd, dateRange])

  const hasTasks = state.tasks.length > 0

  return React.createElement('div', { className: 'view-container' },
    hasTasks && React.createElement('div', { className: 'list-toolbar' },
      React.createElement('div', { className: 'search-box' },
        React.createElement('input', {
          className: 'form-input search-input',
          type: 'text',
          value: search,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
          placeholder: '搜索任务...',
        }),
        search && React.createElement('button', {
          className: 'search-clear',
          onClick: () => setSearch(''),
        }, '\u2715'),
      ),
    ),
    hasTasks && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
      React.createElement('div', { className: 'filter-tabs', style: { marginBottom: 0 } },
        ...FILTERS.map(f =>
          React.createElement('button', {
            key: f.key,
            className: 'filter-tab' + (filter === f.key ? ' active' : ''),
            onClick: () => setFilter(f.key),
            style: filter === f.key && f.key !== 'all'
              ? { background: STATUS_COLORS[f.key], color: '#fff' }
              : {},
          }, f.label + ' (' + (f.key === 'all'
            ? state.tasks.length
            : f.key === 'todo'
              ? state.tasks.filter(t => t.status === 'todo' && (dateRange === 'today' ? t.dueDate === todayStr : dateRange === 'week' ? (t.dueDate >= todayStr && t.dueDate <= weekEnd) : dateRange === 'month' ? (t.dueDate >= todayStr && t.dueDate <= monthEnd) : true)).length
              : state.tasks.filter(t => t.status === f.key).length) + ')'),
        ),
      ),
      state.categories.length > 0 && React.createElement('select', {
        style: {
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          fontSize: 12,
          fontFamily: 'inherit',
          cursor: 'pointer',
          background: '#fff',
          outline: 'none',
          flexShrink: 0,
        },
        value: catFilter,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setCatFilter(e.target.value),
      },
        React.createElement('option', { value: '' }, '全部分类'),
        ...state.categories.map(c =>
          React.createElement('option', { key: c, value: c }, c + ' (' + state.tasks.filter(t => t.category === c).length + ')'),
        ),
      ),
    ),
    filter === 'todo' && hasTasks && React.createElement('div', { className: 'filter-tabs', style: { marginBottom: 12 } },
      ...DATE_RANGES.map(dr =>
        React.createElement('button', {
          key: dr.key,
          className: 'filter-tab filter-tab-sm' + (dateRange === dr.key ? ' active' : ''),
          onClick: () => setDateRange(dr.key),
          style: dateRange === dr.key
            ? { background: 'var(--todo)', color: '#fff' }
            : {},
        }, dr.label),
      ),
    ),
    !hasTasks && React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'empty-state-text' }, '还没有任务，点击右下角 + 新建'),
    ),
    hasTasks && filteredTasks.length === 0 && React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'empty-state-text' }, search || catFilter ? '未找到匹配的任务' : '该分类下没有任务'),
    ),
    hasTasks && filteredTasks.length > 0 && React.createElement('div', { className: 'task-list' },
      ...filteredTasks.map(task =>
        React.createElement(TaskItem, {
          key: task.id,
          task,
          onSelect: onTaskClick || (() => {}),
          onDeleteWithUndo,
        })
      ),
    ),
  )
}
