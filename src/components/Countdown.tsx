import React, { useState, useMemo, useEffect } from 'react'
import { useStore, getTodayStr } from '../store'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function parseDate(d: string) {
  const parts = d.split('-')
  return {
    year: parseInt(parts[0]) || new Date().getFullYear(),
    month: parseInt(parts[1]) || 1,
    day: parseInt(parts[2]) || 1,
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function calcRemaining(cd: { targetDate: string; targetTime: string }) {
  const target = new Date(cd.targetDate + 'T' + (cd.targetTime || '00:00:00'))
  const diff = target.getTime() - Date.now()
  const totalSeconds = Math.max(0, Math.floor(diff / 1000))
  return {
    totalSeconds,
    passed: diff <= 0,
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  }
}

const YEAR_RANGE = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const SECONDS = Array.from({ length: 60 }, (_, i) => i)

export default function Countdown() {
  const { state, dispatch } = useStore()
  const todayStr = getTodayStr()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const [title, setTitle] = useState('')
  const [dateStr, setDateStr] = useState(todayStr)
  const [hour, setHour] = useState(0)
  const [minute, setMinute] = useState(0)
  const [second, setSecond] = useState(0)
  const [hasTime, setHasTime] = useState(false)

  const dateParts = useMemo(() => parseDate(dateStr), [dateStr])
  const maxDay = daysInMonth(dateParts.year, dateParts.month)

  const setPart = (part: 'year' | 'month' | 'day', val: number) => {
    const p = { ...dateParts, [part]: val }
    if (part === 'year' || part === 'month') {
      const md = Math.min(p.day, daysInMonth(p.year, p.month))
      p.day = md
    }
    setDateStr(`${p.year}-${pad(p.month)}-${pad(p.day)}`)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    dispatch({
      type: 'ADD_COUNTDOWN',
      payload: {
        title: title.trim(),
        targetDate: dateStr,
        targetTime: hasTime ? `${pad(hour)}:${pad(minute)}:${pad(second)}` : '',
      },
    })
    setTitle('')
    setDateStr(todayStr)
    setHasTime(false)
    setHour(0)
    setMinute(0)
    setSecond(0)
  }

  const selStyle: React.CSSProperties = {
    padding: '8px 4px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: '#fff',
    outline: 'none',
    textAlign: 'center',
    appearance: 'auto',
    flex: 1,
    minWidth: 0,
  }

  return React.createElement('div', null,
    React.createElement('form', { onSubmit: handleAdd, style: { marginBottom: 20 } },
      React.createElement('div', { className: 'form-group' },
        React.createElement('input', {
          className: 'form-input',
          type: 'text',
          value: title,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value),
          placeholder: '输入事件名称',
        }),
      ),
      React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 8 } },
        React.createElement('select', {
          style: selStyle,
          value: dateParts.year,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPart('year', parseInt(e.target.value)),
        },
          ...YEAR_RANGE.map(y =>
            React.createElement('option', { key: y, value: y }, y + '年'),
          ),
        ),
        React.createElement('select', {
          style: selStyle,
          value: dateParts.month,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPart('month', parseInt(e.target.value)),
        },
          ...MONTHS.map(m =>
            React.createElement('option', { key: m, value: m }, m + '月'),
          ),
        ),
        React.createElement('select', {
          style: selStyle,
          value: dateParts.day,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPart('day', parseInt(e.target.value)),
        },
          ...Array.from({ length: maxDay }, (_, i) => i + 1).map(d =>
            React.createElement('option', { key: d, value: d }, d + '日'),
          ),
        ),
      ),
      React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, cursor: 'pointer', fontSize: 13 } },
        React.createElement('input', {
          type: 'checkbox',
          checked: hasTime,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHasTime(e.target.checked),
          style: { cursor: 'pointer' },
        }),
        '设置具体时间',
      ),
      hasTime && React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 8 } },
        React.createElement('select', { style: selStyle, value: hour, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setHour(parseInt(e.target.value)) },
          ...HOURS.map(h => React.createElement('option', { key: h, value: h }, pad(h) + '时')),
        ),
        React.createElement('select', { style: selStyle, value: minute, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMinute(parseInt(e.target.value)) },
          ...MINUTES.map(m => React.createElement('option', { key: m, value: m }, pad(m) + '分')),
        ),
        React.createElement('select', { style: selStyle, value: second, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSecond(parseInt(e.target.value)) },
          ...SECONDS.map(s => React.createElement('option', { key: s, value: s }, pad(s) + '秒')),
        ),
      ),
      React.createElement('button', {
        className: 'btn btn-primary',
        type: 'submit',
        disabled: !title.trim(),
        style: { width: '100%' },
      }, '添加倒计时'),
    ),

    state.countdowns.length === 0 && React.createElement('div', { className: 'empty-state' },
      React.createElement('div', { className: 'empty-state-text' }, '暂无倒计时事件，添加一个吧'),
    ),

    ...state.countdowns
      .sort((a, b) => new Date(a.targetDate + 'T' + (a.targetTime || '00:00:00')).getTime() - new Date(b.targetDate + 'T' + (b.targetTime || '00:00:00')).getTime())
      .map(cd => {
        const { passed, d, h, m, s } = calcRemaining(cd)

        return React.createElement('div', {
          key: cd.id,
          style: {
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius)',
            padding: 16,
            boxShadow: 'var(--shadow)',
            marginBottom: 12,
            borderLeft: `4px solid ${passed ? '#10b981' : '#3b82f6'}`,
          },
        },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 15, fontWeight: 600 } }, cd.title),
              React.createElement('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 } },
                cd.targetDate + (cd.targetTime ? ' ' + cd.targetTime : ''),
              ),
            ),
            React.createElement('button', {
              className: 'btn btn-secondary btn-xs',
              onClick: () => dispatch({ type: 'DELETE_COUNTDOWN', payload: cd.id }),
              style: { color: '#ef4444' },
            }, '删除'),
          ),
          React.createElement('div', { style: { fontSize: 28, fontWeight: 700, textAlign: 'center', marginTop: 12, fontVariantNumeric: 'tabular-nums' } },
            passed
              ? '已到达'
              : d + '天 ' + pad(h) + ':' + pad(m) + ':' + pad(s),
          ),
          React.createElement('div', { style: { fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 4 } },
            passed ? '事件已发生' : '距离事件还剩',
          ),
        )
      }),
  )
}
