import React, { useMemo } from 'react'
import { useStore } from '../store'
import { STATUS_COLORS } from '../types'

export default function Statistics() {
  const { state } = useStore()
  const todayStr = new Date().toISOString().split('T')[0]

  const stats = useMemo(() => {
    const total = state.tasks.length
    const done = state.tasks.filter(t => t.status === 'done' || t.status === 'overdue-done').length
    const todo = state.tasks.filter(t => t.status === 'todo' || t.status === 'overdue').length
    const todayTasks = state.tasks.filter(t => t.hasDueDate && t.dueDate === todayStr)
    const todayDone = todayTasks.filter(t => t.status === 'done' || t.status === 'overdue-done').length

    const categoryStats: Record<string, { total: number; done: number }> = {}
    state.tasks.forEach(t => {
      const cat = t.category || '未分类'
      if (!categoryStats[cat]) categoryStats[cat] = { total: 0, done: 0 }
      categoryStats[cat].total++
      if (t.status === 'done' || t.status === 'overdue-done') categoryStats[cat].done++
    })

    const dueDateStats: Record<string, { total: number; done: number }> = {}
    state.tasks.filter(t => t.hasDueDate).forEach(t => {
      if (!dueDateStats[t.dueDate]) dueDateStats[t.dueDate] = { total: 0, done: 0 }
      dueDateStats[t.dueDate].total++
      if (t.status === 'done' || t.status === 'overdue-done') dueDateStats[t.dueDate].done++
    })

    return { total, done, todo, todayTasks: todayTasks.length, todayDone, categoryStats, dueDateStats }
  }, [state.tasks, todayStr])

  const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  const cardStyle: React.CSSProperties = {
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    boxShadow: 'var(--shadow)',
    marginBottom: 12,
  }

  const statNumStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
  }

  const barTrackStyle: React.CSSProperties = {
    height: 8,
    borderRadius: 4,
    background: '#f3f4f6',
    overflow: 'hidden',
    marginTop: 6,
  }

  return React.createElement('div', null,

    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 } },
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 } }, '全部任务'),
        React.createElement('div', { style: { ...statNumStyle, color: 'var(--text)' } }, stats.total),
        React.createElement('div', { style: barTrackStyle },
          React.createElement('div', { style: { height: '100%', width: rate + '%', background: 'var(--primary)', borderRadius: 4, transition: 'width 0.3s' } }),
        ),
        React.createElement('div', { style: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 } }, '完成率 ', rate, '%'),
      ),
      React.createElement('div', { style: cardStyle },
        React.createElement('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 } }, '今日任务'),
        React.createElement('div', { style: { ...statNumStyle, color: '#10b981' } }, stats.todayDone + '/' + stats.todayTasks),
        React.createElement('div', { style: barTrackStyle },
          React.createElement('div', { style: { height: '100%', width: stats.todayTasks > 0 ? (stats.todayDone / stats.todayTasks * 100) + '%' : '0%', background: '#10b981', borderRadius: 4 } }),
        ),
        React.createElement('div', { style: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 } }, stats.todayTasks > 0 ? '完成 ' + stats.todayDone + ' 项' : '无今日任务'),
      ),
    ),

    React.createElement('div', { style: cardStyle },
      React.createElement('div', { style: { fontSize: 13, fontWeight: 600, marginBottom: 12 } }, '状态分布'),
      React.createElement('div', { style: { display: 'flex', gap: 8 } },
        ...(['todo', 'done', 'overdue', 'overdue-done'] as const).map(s => {
          const count = state.tasks.filter(t => t.status === s).length
          const total = stats.total || 1
          return React.createElement('div', { key: s, style: { flex: 1, textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: 22, fontWeight: 700, color: STATUS_COLORS[s] } }, count),
            React.createElement('div', { style: barTrackStyle },
              React.createElement('div', { style: { height: '100%', width: (count / total * 100) + '%', background: STATUS_COLORS[s], borderRadius: 4 } }),
            ),
            React.createElement('div', { style: { fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 } }, statusLabel(s)),
          )
        }),
      ),
    ),

    Object.keys(stats.categoryStats).length > 0 && React.createElement('div', { style: cardStyle },
      React.createElement('div', { style: { fontSize: 13, fontWeight: 600, marginBottom: 12 } }, '分类统计'),
      ...Object.entries(stats.categoryStats).map(([cat, cs]) =>
        React.createElement('div', { key: cat, style: { marginBottom: 10 } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 } },
            React.createElement('span', null, cat),
            React.createElement('span', { style: { color: 'var(--text-secondary)' } }, cs.done, '/', cs.total),
          ),
          React.createElement('div', { style: barTrackStyle },
            React.createElement('div', { style: { height: '100%', width: (cs.done / cs.total * 100) + '%', background: 'var(--primary)', borderRadius: 4 } }),
          ),
        ),
      ),
    ),

    stats.total === 0 && React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'empty-state-text' }, '暂无数据，添加任务后查看统计'),
    ),
  )
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    todo: '待办', done: '已办', overdue: '过期待办', 'overdue-done': '过期已办',
  }
  return map[s] || s
}
