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
      React.createElement('div', { className: 'form-date-row', style: { marginBottom: 8 } },
        React.createElement('select', {
          className: 'form-date-select',
          value: dateParts.year,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPart('year', parseInt(e.target.value)),
        },
          ...YEAR_RANGE.map(y =>
            React.createElement('option', { key: y, value: y }, y + '年'),
          ),
        ),
        React.createElement('select', {
          className: 'form-date-select',
          value: dateParts.month,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setPart('month', parseInt(e.target.value)),
        },
          ...MONTHS.map(m =>
            React.createElement('option', { key: m, value: m }, m + '月'),
          ),
        ),
        React.createElement('select', {
          className: 'form-date-select',
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
      hasTime && React.createElement('div', { className: 'form-date-row', style: { marginBottom: 8 } },
        React.createElement('select', { className: 'form-date-select', value: hour, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setHour(parseInt(e.target.value)) },
          ...HOURS.map(h => React.createElement('option', { key: h, value: h }, pad(h) + '时')),
        ),
        React.createElement('select', { className: 'form-date-select', value: minute, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMinute(parseInt(e.target.value)) },
          ...MINUTES.map(m => React.createElement('option', { key: m, value: m }, pad(m) + '分')),
        ),
        React.createElement('select', { className: 'form-date-select', value: second, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSecond(parseInt(e.target.value)) },
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

        const display = d > 0
          ? `${d}天 ${pad(h)}:${pad(m)}:${pad(s)}`
          : `${pad(h)}:${pad(m)}:${pad(s)}`

        return React.createElement('div', {
          key: cd.id,
          className: 'countdown-card' + (passed ? '' : d <= 3 ? ' urgent' : ''),
          style: passed ? { opacity: 0.6 } : {},
        },
          React.createElement('div', { className: 'countdown-header' },
            React.createElement('span', { className: 'countdown-label' }, cd.title),
            React.createElement('span', { className: 'countdown-date' },
              cd.targetDate + (cd.targetTime ? ' ' + cd.targetTime : ''),
            ),
          ),
          React.createElement('div', { className: 'countdown-sub' },
            passed ? '事件已发生' : `距离「${cd.title}」还剩`,
          ),
          React.createElement('div', { className: 'countdown-timer' },
            passed ? '已到达' : display,
          ),
          React.createElement('button', {
            className: 'btn btn-xs countdown-del',
            onClick: () => dispatch({ type: 'DELETE_COUNTDOWN', payload: cd.id }),
          }, '删除'),
        )
      }),
  )
}
