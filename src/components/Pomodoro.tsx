import React, { useState, useRef, useEffect, useCallback } from 'react'

const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60
const LONG_BREAK_TIME = 15 * 60

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

type Phase = 'work' | 'break' | 'longBreak'

export default function Pomodoro() {
  const [phase, setPhase] = useState<Phase>('work')
  const [remaining, setRemaining] = useState(WORK_TIME)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phaseConfig: Record<Phase, { label: string; color: string; bg: string }> = {
    work: { label: '专注', color: '#ef4444', bg: '#fef2f2' },
    break: { label: '休息', color: '#10b981', bg: '#f0fdf4' },
    longBreak: { label: '长休息', color: '#3b82f6', bg: '#eff6ff' },
  }

  const config = phaseConfig[phase]

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const switchPhase = useCallback((newPhase: Phase, duration: number) => {
    setPhase(newPhase)
    setRemaining(duration)
    setRunning(false)
    clearTimer()
  }, [])

  const toggle = () => {
    setRunning(prev => !prev)
  }

  const reset = () => {
    switchPhase('work', WORK_TIME)
    setSessions(0)
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setRunning(false)
            if (phase === 'work') {
              const newSessions = sessions + 1
              setSessions(newSessions)
              if (newSessions % 4 === 0) {
                switchPhase('longBreak', LONG_BREAK_TIME)
              } else {
                switchPhase('break', BREAK_TIME)
              }
            } else {
              switchPhase('work', WORK_TIME)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearTimer()
    }
    return () => clearTimer()
  }, [running, phase, sessions])

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const displayM = Math.floor(remaining / 60)
  const displayS = remaining % 60
  const totalDuration = phase === 'work' ? WORK_TIME : phase === 'break' ? BREAK_TIME : LONG_BREAK_TIME
  const progress = totalDuration > 0 ? ((totalDuration - remaining) / totalDuration) * 100 : 0

  return React.createElement('div', { style: { textAlign: 'center', padding: '20px 0' } },
    React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 } },
      ...(['work', 'break', 'longBreak'] as Phase[]).map(p =>
        React.createElement('button', {
          key: p,
          className: 'filter-tab' + (phase === p ? ' active' : ''),
          onClick: () => switchPhase(p, p === 'work' ? WORK_TIME : p === 'break' ? BREAK_TIME : LONG_BREAK_TIME),
          style: phase === p ? { background: phaseConfig[p].color, color: '#fff' } : {},
        }, phaseConfig[p].label),
      ),
    ),

    React.createElement('div', {
      style: {
        width: 200,
        height: 200,
        borderRadius: '50%',
        margin: '0 auto 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `conic-gradient(${config.color} ${progress * 3.6}deg, ${config.bg} 0deg)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      },
    },
      React.createElement('div', {
        style: {
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
        React.createElement('div', {
          style: { fontSize: 48, fontWeight: 200, fontVariantNumeric: 'tabular-nums', color: config.color },
        }, pad(displayM) + ':' + pad(displayS)),
        React.createElement('div', { style: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 } }, config.label),
      ),
    ),

    React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 } },
      React.createElement('button', {
        className: 'btn btn-primary',
        onClick: toggle,
        style: { minWidth: 100, background: config.color },
      }, running ? '暂停' : '开始'),
      React.createElement('button', { className: 'btn btn-secondary', onClick: reset }, '重置'),
    ),

    React.createElement('div', { style: { fontSize: 13, color: 'var(--text-secondary)' } },
      '已完成 ', sessions, ' 个番茄',
      sessions > 0 && ' (' + Math.floor(sessions / 4) + ' 组长休息已完成)',
    ),
  )
}
