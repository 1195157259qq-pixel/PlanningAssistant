import React, { useState, useRef, useEffect, useCallback } from 'react'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function Countdown() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = () => {
    if (totalSeconds <= 0) return
    setRemaining(totalSeconds)
    setRunning(true)
  }

  const pause = () => {
    setRunning(false)
    clearTimer()
  }

  const reset = () => {
    setRunning(false)
    clearTimer()
    setRemaining(0)
  }

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearTimer()
  }, [running])

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const displayH = Math.floor(remaining / 3600)
  const displayM = Math.floor((remaining % 3600) / 60)
  const displayS = remaining % 60

  const selStyle: React.CSSProperties = {
    padding: '8px 6px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 16,
    fontFamily: 'inherit',
    cursor: running ? 'default' : 'pointer',
    background: '#fff',
    textAlign: 'center',
    outline: 'none',
  }

  const timerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 0',
  }

  const digitStyle: React.CSSProperties = {
    fontSize: 64,
    fontWeight: 200,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: 4,
    color: remaining === 0 && !running ? 'var(--text-secondary)' : 'var(--text)',
  }

  return React.createElement('div', null,
    running
      ? React.createElement('div', { style: timerStyle },
          React.createElement('div', { style: digitStyle },
            pad(displayH) + ':' + pad(displayM) + ':' + pad(displayS),
          ),
          React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 } },
            React.createElement('button', { className: 'btn btn-primary', onClick: pause }, '暂停'),
            React.createElement('button', { className: 'btn btn-secondary', onClick: reset }, '重置'),
          ),
        )
      : React.createElement('div', null,
          React.createElement('div', { style: timerStyle },
            React.createElement('div', { style: digitStyle },
              remaining > 0
                ? pad(displayH) + ':' + pad(displayM) + ':' + pad(displayS)
                : '00:00:00',
            ),
          ),
          React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 } },
            React.createElement('select', {
              style: selStyle,
              value: hours,
              disabled: running,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setHours(parseInt(e.target.value)),
            },
              ...Array.from({ length: 24 }, (_, i) =>
                React.createElement('option', { key: i, value: i }, pad(i) + ' 时'),
              ),
            ),
            React.createElement('span', { style: { fontSize: 20, color: '#999' } }, ':'),
            React.createElement('select', {
              style: selStyle,
              value: minutes,
              disabled: running,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMinutes(parseInt(e.target.value)),
            },
              ...Array.from({ length: 60 }, (_, i) =>
                React.createElement('option', { key: i, value: i }, pad(i) + ' 分'),
              ),
            ),
            React.createElement('span', { style: { fontSize: 20, color: '#999' } }, ':'),
            React.createElement('select', {
              style: selStyle,
              value: seconds,
              disabled: running,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSeconds(parseInt(e.target.value)),
            },
              ...Array.from({ length: 60 }, (_, i) =>
                React.createElement('option', { key: i, value: i }, pad(i) + ' 秒'),
              ),
            ),
          ),
          React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center' } },
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: start,
              disabled: totalSeconds <= 0,
              style: { minWidth: 100 },
            }, remaining > 0 ? '继续' : '开始'),
            remaining > 0 && React.createElement('button', { className: 'btn btn-secondary', onClick: reset }, '重置'),
          ),
        ),
  )
}
