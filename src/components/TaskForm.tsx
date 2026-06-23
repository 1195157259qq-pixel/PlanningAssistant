import React, { useState, useMemo } from 'react'
import { useStore, getTodayStr } from '../store'
import { RepeatType, REPEAT_LABELS } from '../types'

interface Props {
  onClose: () => void
}

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

function parseTime(t: string) {
  const parts = t.split(':')
  return {
    hour: parseInt(parts[0]) || 8,
    minute: parseInt(parts[1]) || 0,
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

const YEAR_RANGE = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() + i - 0)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

export default function TaskForm({ onClose }: Props) {
  const { state, dispatch } = useStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hasDueDate, setHasDueDate] = useState(true)
  const [dueDate, setDueDate] = useState(getTodayStr())
  const [isAllDay, setIsAllDay] = useState(true)
  const [dueTime, setDueTime] = useState('')
  const [repeat, setRepeat] = useState<RepeatType>('none')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')

  const dateParts = useMemo(() => parseDate(dueDate), [dueDate])
  const timeParts = useMemo(() => parseTime(dueTime || '08:00'), [dueTime])
  const maxDay = daysInMonth(dateParts.year, dateParts.month)

  const setPart = (part: 'year' | 'month' | 'day', val: number) => {
    const p = { ...dateParts, [part]: val }
    if (part === 'year' || part === 'month') {
      const md = Math.min(p.day, daysInMonth(p.year, p.month))
      p.day = md
    }
    setDueDate(`${p.year}-${pad(p.month)}-${pad(p.day)}`)
  }

  const setTimePart = (part: 'hour' | 'minute', val: number) => {
    const t = { ...timeParts, [part]: val }
    setDueTime(`${pad(t.hour)}:${pad(t.minute)}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: title.trim(),
        description: description.trim(),
        dueDate: hasDueDate ? dueDate : '',
        dueTime: hasDueDate && !isAllDay ? dueTime : '',
        hasDueDate,
        repeat,
        category: category.trim(),
        location: location.trim(),
        status: 'todo',
      },
    })
    onClose()
  }

  const selStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 4px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: '#fff',
    outline: 'none',
    textAlign: 'center',
    appearance: 'auto',
  }

  return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
    React.createElement('div', { className: 'modal', onClick: (e: React.MouseEvent) => e.stopPropagation() },
      React.createElement('div', { className: 'modal-title' }, '新建任务'),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, '任务标题 *'),
          React.createElement('input', {
            className: 'form-input',
            type: 'text',
            value: title,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value),
            placeholder: '输入任务标题',
            autoFocus: true,
          }),
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, '任务描述'),
          React.createElement('textarea', {
            className: 'form-textarea',
            value: description,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value),
            placeholder: '输入任务描述（可选）',
          }),
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label', style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' } },
            React.createElement('input', {
              type: 'checkbox',
              checked: hasDueDate,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHasDueDate(e.target.checked),
              style: { cursor: 'pointer' },
            }),
            '设置截止时间',
          ),
          hasDueDate && React.createElement('div', { style: { marginTop: 8 } },
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
            React.createElement('div', { style: { display: 'flex', gap: 6, alignItems: 'center' } },
              React.createElement('select', {
                style: { ...selStyle, opacity: isAllDay ? 0.4 : 1 },
                value: timeParts.hour,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setTimePart('hour', parseInt(e.target.value)),
                disabled: isAllDay,
              },
                ...HOURS.map(h =>
                  React.createElement('option', { key: h, value: h }, pad(h) + '时'),
                ),
              ),
              React.createElement('span', { style: { fontSize: 14, color: isAllDay ? '#ccc' : '#999' } }, ':'),
              React.createElement('select', {
                style: { ...selStyle, opacity: isAllDay ? 0.4 : 1 },
                value: timeParts.minute,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setTimePart('minute', parseInt(e.target.value)),
                disabled: isAllDay,
              },
                ...MINUTES.map(m =>
                  React.createElement('option', { key: m, value: m }, pad(m) + '分'),
                ),
              ),
            ),
            React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: isAllDay,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setIsAllDay(e.target.checked),
                style: { cursor: 'pointer' },
              }),
              '全天',
            ),
          ),
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, '重复'),
          React.createElement('select', {
            className: 'form-input',
            value: repeat,
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setRepeat(e.target.value as RepeatType),
          },
            ...(Object.entries(REPEAT_LABELS) as [RepeatType, string][]).map(([val, label]) =>
              React.createElement('option', { key: val, value: val }, label),
            ),
          ),
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, '分类'),
          React.createElement('input', {
            className: 'form-input',
            type: 'text',
            value: category,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value),
            placeholder: '输入或选择分类',
            list: 'category-list',
          }),
          React.createElement('datalist', { id: 'category-list' },
            ...state.categories.map(c =>
              React.createElement('option', { key: c, value: c }),
            ),
          ),
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label' }, '地点'),
          React.createElement('input', {
            className: 'form-input',
            type: 'text',
            value: location,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value),
            placeholder: '输入地点（可选）',
          }),
        ),
        React.createElement('div', { className: 'form-actions' },
          React.createElement('button', {
            className: 'btn btn-secondary',
            type: 'button',
            onClick: onClose,
          }, '取消'),
          React.createElement('button', {
            className: 'btn btn-primary',
            type: 'submit',
            disabled: !title.trim(),
          }, '创建任务'),
        ),
      ),
    ),
  )
}
