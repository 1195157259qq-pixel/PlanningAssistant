import React, { useRef } from 'react'
import { useStore } from '../store'
import { Task } from '../types'

export default function DataManager() {
  const { state, dispatch } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = {
      tasks: state.tasks,
      categories: state.categories,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const d = new Date()
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    a.download = `planning-assistant-${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string)
        if (!data.tasks || !Array.isArray(data.tasks)) {
          alert('无效的备份文件格式')
          return
        }
        const tasks: Task[] = data.tasks.map((t: Partial<Task>) => ({
          ...t,
          id: t.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          repeat: t.repeat || 'none',
          category: t.category || '',
          location: t.location || '',
          hasDueDate: t.hasDueDate ?? (!!t.dueDate),
          createdAt: t.createdAt || new Date().toISOString(),
        }))
        const categories = Array.from(new Set([...state.categories, ...(data.categories || [])]))
        dispatch({ type: 'LOAD_STATE', payload: { tasks, currentView: state.currentView, selectedDate: state.selectedDate, categories, countdowns: data.countdowns || [], pomodoroSessions: data.pomodoroSessions || 0 } })
      } catch {
        alert('文件解析失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return React.createElement('div', { style: { padding: '20px 0' } },
    React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 } },
      React.createElement('button', {
        className: 'btn btn-primary',
        onClick: handleExport,
        disabled: state.tasks.length === 0,
        style: { minWidth: 140 },
      }, '导出数据 (JSON)'),
      React.createElement('label', {
        className: 'btn btn-secondary',
        style: { minWidth: 140, cursor: 'pointer', textAlign: 'center' as const },
      },
        '导入数据 (JSON)',
        React.createElement('input', {
          ref: fileInputRef,
          type: 'file',
          accept: '.json',
          onChange: handleImport,
          style: { display: 'none' },
        }),
      ),
    ),
    React.createElement('div', {
      style: {
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius)',
        padding: 16,
        boxShadow: 'var(--shadow)',
        fontSize: 13,
        color: 'var(--text-secondary)',
        lineHeight: 1.8,
      },
    },
      React.createElement('div', { style: { fontWeight: 600, color: 'var(--text)', marginBottom: 8 } }, '数据说明'),
      React.createElement('div', null, '总任务数: ', state.tasks.length),
      React.createElement('div', null, '总分类数: ', state.categories.length),
      React.createElement('div', null,
        '已完成: ',
        state.tasks.filter(t => t.status === 'done').length,
      ),
      React.createElement('div', null,
        '待处理: ',
        state.tasks.filter(t => t.status === 'todo' || t.status === 'overdue').length,
      ),
      React.createElement('div', { style: { marginTop: 8, fontSize: 11 } },
        '数据保存在浏览器本地存储中。导出为 JSON 文件可备份到本地。',
      ),
    ),
  )
}
