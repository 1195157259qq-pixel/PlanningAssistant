import React, { useState, useRef, useEffect, useCallback } from 'react'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export default function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = () => {
    setRunning(true)
  }

  const pause = () => {
    setRunning(false)
    clearTimer()
  }

  const reset = () => {
    setRunning(false)
    clearTimer()
    setElapsed(0)
    setLaps([])
  }

  const lap = () => {
    setLaps(prev => [elapsed, ...prev])
  }

  useEffect(() => {
    if (running) {
      const startTime = Date.now() - elapsed * 1000
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 50)
    }
    return () => clearTimer()
  }, [running])

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const displayH = Math.floor(elapsed / 3600)
  const displayM = Math.floor((elapsed % 3600) / 60)
  const displayS = elapsed % 60

  const timerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 0 20px',
  }

  const digitStyle: React.CSSProperties = {
    fontSize: 64,
    fontWeight: 200,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: 4,
  }

  function formatLap(t: number): string {
    const h = Math.floor(t / 3600)
    const m = Math.floor((t % 3600) / 60)
    const s = t % 60
    return pad(h) + ':' + pad(m) + ':' + pad(s)
  }

  return React.createElement('div', null,
    React.createElement('div', { style: timerStyle },
      React.createElement('div', { style: digitStyle },
        pad(displayH) + ':' + pad(displayM) + ':' + pad(displayS),
      ),
    ),
    React.createElement('div', { style: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 } },
      running
        ? React.createElement('button', { className: 'btn btn-primary', onClick: pause, style: { minWidth: 80 } }, '暂停')
        : React.createElement('button', { className: 'btn btn-primary', onClick: start, style: { minWidth: 80 } }, elapsed > 0 ? '继续' : '开始'),
      running && React.createElement('button', { className: 'btn btn-secondary', onClick: lap }, '计次'),
      elapsed > 0 && !running && React.createElement('button', { className: 'btn btn-secondary', onClick: reset }, '重置'),
    ),
    laps.length > 0 && React.createElement('div', { style: { maxHeight: 300, overflowY: 'auto' } },
      React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 } }, '计次记录'),
      ...laps.map((t, i) =>
        React.createElement('div', {
          key: i,
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 12px',
            fontSize: 14,
            fontVariantNumeric: 'tabular-nums',
            borderBottom: '1px solid var(--border)',
            background: i === 0 ? '#f0fdf4' : 'transparent',
          },
        },
          React.createElement('span', { style: { color: 'var(--text-secondary)' } }, '#' + (laps.length - i)),
          React.createElement('span', { style: { fontWeight: 600 } }, formatLap(t)),
        ),
      ),
    ),
  )
}
