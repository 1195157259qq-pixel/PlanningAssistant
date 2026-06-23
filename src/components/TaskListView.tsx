import React, { useState, useMemo } from 'react'
import { useStore } from '../store'
import { Task, TaskStatus, STATUS_COLORS } from '../types'
import TaskItem from './TaskItem'
import TaskDetailModal from './TaskDetailModal'

type FilterKey = 'all' | TaskStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'todo', label: '待办' },
  { key: 'done', label: '已办' },
  { key: 'overdue', label: '过期待办' },
  { key: 'overdue-done', label: '过期已办' },
]

export default function TaskListView() {
  const { state } = useStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const filteredTasks = useMemo(() => {
    let tasks = filter === 'all' ? state.tasks : state.tasks.filter(t => t.status === filter)
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
  }, [state.tasks, filter, search])

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
    hasTasks && React.createElement('div', { className: 'filter-tabs' },
      ...FILTERS.map(f =>
        React.createElement('button', {
          key: f.key,
          className: 'filter-tab' + (filter === f.key ? ' active' : ''),
          onClick: () => setFilter(f.key),
          style: filter === f.key && f.key !== 'all'
            ? { background: STATUS_COLORS[f.key], color: '#fff' }
            : {},
        }, f.label + ' (' + (f.key === 'all' ? state.tasks.length : state.tasks.filter(t => t.status === f.key).length) + ')'),
      ),
    ),
    !hasTasks && React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'empty-state-icon' }, '\uD83D\uDCCB'),
      React.createElement('div', { className: 'empty-state-text' }, '还没有任务，点击右上角新建'),
    ),
    hasTasks && filteredTasks.length === 0 && React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'empty-state-text' }, search ? '未找到匹配的任务' : '该分类下没有任务'),
    ),
    hasTasks && filteredTasks.length > 0 && React.createElement('div', { className: 'task-list' },
      ...filteredTasks.map(task =>
        React.createElement(TaskItem, {
          key: task.id,
          task,
          onSelect: setSelectedTask,
        })
      ),
    ),
    selectedTask && React.createElement(TaskDetailModal, {
      task: selectedTask,
      onClose: () => setSelectedTask(null),
    }),
  )
}
