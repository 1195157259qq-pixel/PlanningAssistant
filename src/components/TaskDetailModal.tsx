import React from 'react'
import { useStore } from '../store'
import { Task, STATUS_COLORS, REPEAT_LABELS } from '../types'

interface Props {
  task: Task
  onClose: () => void
  onEdit?: () => void
  onDeleteWithUndo?: (task: Task) => void
}

export default function TaskDetailModal({ task, onClose, onEdit, onDeleteWithUndo }: Props) {
  const { dispatch } = useStore()
  const isDone = task.status === 'done'

  const toggleDone = () => {
    const newStatus: typeof task.status = isDone ? 'todo' : 'done'
    dispatch({ type: 'SET_STATUS', payload: { id: task.id, status: newStatus } })
  }

  const handleDelete = () => {
    if (onDeleteWithUndo) {
      onDeleteWithUndo(task)
    } else {
      dispatch({ type: 'DELETE_TASK', payload: task.id })
    }
    onClose()
  }

  return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
    React.createElement('div', { className: 'modal task-detail', onClick: (e: React.MouseEvent) => e.stopPropagation() },
      React.createElement('div', { className: 'modal-title' }, task.title),
      task.description && React.createElement('div', { className: 'task-detail-desc' }, task.description),
      React.createElement('div', { className: 'task-meta-row' },
        React.createElement('span', null,
          task.hasDueDate
            ? '\u{1F4C5} ' + task.dueDate + (task.dueTime ? ' ' + task.dueTime : '')
            : '无截止时间',
        ),
        React.createElement('span', {
          className: 'task-status-badge',
          style: { background: STATUS_COLORS[task.status], color: '#fff' },
        }, statusLabel(task.status)),
      ),
      (task.repeat !== 'none' || task.category || task.location) &&
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' } },
          task.repeat !== 'none' && React.createElement('div', null, '\u{1F501} 重复: ', REPEAT_LABELS[task.repeat]),
          task.category && React.createElement('div', null, '\u{1F4C1} 分类: ', task.category),
          task.location && React.createElement('div', null, '\u{1F4CD} 地点: ', task.location),
        ),
      React.createElement('div', { className: 'form-actions' },
        onEdit && React.createElement('button', { className: 'btn btn-primary', onClick: onEdit }, '编辑'),
        React.createElement('button', { className: 'btn btn-secondary', onClick: toggleDone },
          isDone ? '\u21A9 标记未完成' : '\u2713 标记已完成',
        ),
        React.createElement('button', { className: 'btn btn-secondary', onClick: handleDelete, style: { color: '#ef4444' } },
          '\u2715 删除',
        ),
        React.createElement('button', { className: 'btn btn-primary', onClick: onClose }, '关闭'),
      ),
    ),
  )
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    todo: '待办', done: '已办', overdue: '过期待办', 'overdue-done': '过期已办',
  }
  return map[s] || s
}
