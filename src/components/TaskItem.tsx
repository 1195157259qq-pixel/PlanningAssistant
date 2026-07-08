import React from 'react'
import { useStore } from '../store'
import { Task, TaskStatus, STATUS_LABELS, STATUS_COLORS, REPEAT_LABELS, REPEAT_COLORS } from '../types'

interface Props {
  task: Task
  onSelect: (task: Task) => void
  onDeleteWithUndo?: (task: Task) => void
}

export default function TaskItem({ task, onSelect, onDeleteWithUndo }: Props) {
  const { dispatch } = useStore()
  const isDone = task.status === 'done'

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus: TaskStatus = isDone ? 'todo' : 'done'
    dispatch({ type: 'SET_STATUS', payload: { id: task.id, status: newStatus } })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    dispatch({ type: 'SET_STATUS', payload: { id: task.id, status: e.target.value as TaskStatus } })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeleteWithUndo) {
      onDeleteWithUndo(task)
    } else {
      dispatch({ type: 'DELETE_TASK', payload: task.id })
    }
  }

  return React.createElement('div', {
    className: 'task-item',
    'data-status': task.status,
    onClick: () => onSelect(task),
    style: { cursor: 'pointer' },
  },
    React.createElement('button', {
      className: 'task-check',
      'data-checked': isDone ? 'true' : 'false',
      onClick: toggleDone,
      title: isDone ? '标记为未完成' : '标记为已完成',
    }, isDone ? '\u2713' : ''),
    React.createElement('div', { className: 'task-body' },
      React.createElement('div', {
        className: 'task-title',
        style: { textDecoration: isDone ? 'line-through' : 'none' },
      }, task.title),
      task.description && React.createElement('div', { className: 'task-desc' }, task.description),
      (task.repeat !== 'none' || task.category || task.location) &&
        React.createElement('div', { style: { display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' } },
          task.repeat !== 'none' && React.createElement('span', {
            className: 'task-info-tag',
            style: { background: REPEAT_COLORS[task.repeat] + '20', color: REPEAT_COLORS[task.repeat] },
          }, REPEAT_LABELS[task.repeat]),
          task.category && React.createElement('span', { className: 'task-info-tag', style: { background: '#eef2ff', color: '#4f46e5' } }, task.category),
          task.location && React.createElement('span', { className: 'task-info-tag', style: { background: '#fef3c7', color: '#92400e' } }, task.location),
        ),
    ),
    React.createElement('div', { className: 'task-meta' },
      React.createElement('div', { className: 'task-due' },
        task.hasDueDate
          ? task.dueDate + (task.dueTime ? ' ' + task.dueTime : '')
          : '无截止时间',
      ),
      React.createElement('select', {
        className: 'status-select',
        value: task.status,
        onChange: handleStatusChange,
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
        style: { color: STATUS_COLORS[task.status], borderColor: STATUS_COLORS[task.status] },
      },
        ...Object.entries(STATUS_LABELS).map(([val, label]) =>
          React.createElement('option', { key: val, value: val }, label)
        ),
      ),
      React.createElement('div', { className: 'task-actions' },
        React.createElement('button', {
          className: 'btn btn-secondary btn-xs',
          onClick: handleDelete,
          title: '删除',
        }, '删除'),
      ),
    ),
  )
}
