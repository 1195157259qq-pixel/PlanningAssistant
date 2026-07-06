import React, { useState, useMemo } from 'react'
import { useStore, getTodayStr } from '../store'
import { Task, TaskStatus, STATUS_COLORS } from '../types'
import TaskItem from './TaskItem'

type FilterKey = 'all' | TaskStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'todo', label: '待办' },
  { key: 'done', label: '已办' },
  { key: 'overdue', label: '过期未办' },
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

  const todayStr = getTodayStr()

  const filteredTasks = useMemo(() => {
    let tasks = filter === 'all' ? state.tasks : state.tasks.filter(t => t.status === filter)
    if (filter === 'todo') {
      tasks = tasks.filter(t => t.dueDate === todayStr)
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
  }, [state.tasks, filter, search, catFilter, todayStr])

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
              ? state.tasks.filter(t => t.status === 'todo' && t.dueDate === todayStr).length
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
