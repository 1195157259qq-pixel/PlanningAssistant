import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../store'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

type Phase = 'work' | 'break' | 'longBreak'

export default function Pomodoro() {
  const { state, dispatch } = useStore()

  const [workTime, setWorkTime] = useState(25)
  const [breakTime, setBreakTime] = useState(5)
  const [longBreakTime, setLongBreakTime] = useState(15)
  const [phase, setPhase] = useState<Phase>('work')
  const [remaining, setRemaining] = useState(workTime * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
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

  const enterFullscreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {})
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }

  const toggle = () => {
    if (!running) {
      enterFullscreen()
    }
    setRunning(prev => !prev)
  }

  const togglePause = () => {
    setRunning(prev => !prev)
  }

  const handleExit = () => {
    clearTimer()
    setRunning(false)
    exitFullscreen()
  }

  const reset = () => {
    switchPhase('work', workTime * 60)
    setSessions(0)
    exitFullscreen()
  }

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setRunning(false)
            exitFullscreen()
            if (phase === 'work') {
              dispatch({ type: 'INCREMENT_POMODORO' })
              const newSessions = sessions + 1
              setSessions(newSessions)
              if (newSessions % 4 === 0) {
                switchPhase('longBreak', longBreakTime * 60)
              } else {
                switchPhase('break', breakTime * 60)
              }
            } else {
              switchPhase('work', workTime * 60)
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
  }, [running, phase, sessions, workTime, breakTime, longBreakTime])

  useEffect(() => {
    if (!running) {
      setRemaining(workTime * 60)
    }
  }, [workTime])

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const displayM = Math.floor(remaining / 60)
  const displayS = remaining % 60
  const totalDuration = phase === 'work' ? workTime * 60 : phase === 'break' ? breakTime * 60 : longBreakTime * 60
  const progress = totalDuration > 0 ? ((totalDuration - remaining) / totalDuration) * 100 : 0

  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: config.bg,
      }}>
        <div style={{
          width: 260, height: 260, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `conic-gradient(${config.color} ${progress * 3.6}deg, ${config.bg} 0deg)`,
          boxShadow: '0 4px 30px rgba(0,0,0,0.12)',
        }}>
          <div style={{
            width: 210, height: 210, borderRadius: '50%', background: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 64, fontWeight: 200, color: config.color }}>
              {pad(displayM)}:{pad(displayS)}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>{config.label}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          <button className="btn btn-primary" onClick={togglePause} style={{
            minWidth: 120, padding: '14px 0', fontSize: 18, background: config.color,
          }}>{running ? '暂停' : '继续'}</button>
          <button className="btn btn-secondary" onClick={handleExit} style={{
            minWidth: 120, padding: '14px 0', fontSize: 18,
          }}>退出</button>
        </div>
      </div>
    )
  }

  const selStyle: React.CSSProperties = {
    padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)',
    fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', background: '#fff',
    textAlign: 'center', outline: 'none', width: 60,
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>专注</span>
        <select style={selStyle} value={workTime} disabled={running}
          onChange={e => setWorkTime(parseInt(e.target.value))}>
          {[15, 20, 25, 30, 45, 60].map(v => <option key={v} value={v}>{v}分</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>休息</span>
        <select style={selStyle} value={breakTime} disabled={running}
          onChange={e => setBreakTime(parseInt(e.target.value))}>
          {[3, 5, 10, 15, 20].map(v => <option key={v} value={v}>{v}分</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>长休</span>
        <select style={selStyle} value={longBreakTime} disabled={running}
          onChange={e => setLongBreakTime(parseInt(e.target.value))}>
          {[10, 15, 20, 25, 30].map(v => <option key={v} value={v}>{v}分</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
        {(['work', 'break', 'longBreak'] as Phase[]).map(p => (
          <button
            key={p}
            className={'filter-tab' + (phase === p ? ' active' : '')}
            onClick={() => switchPhase(p, p === 'work' ? workTime * 60 : p === 'break' ? breakTime * 60 : longBreakTime * 60)}
            style={phase === p ? { background: phaseConfig[p].color, color: '#fff' } : {}}
          >{phaseConfig[p].label}</button>
        ))}
      </div>

      <div style={{
        width: 200, height: 200, borderRadius: '50%', margin: '0 auto 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `conic-gradient(${config.color} ${progress * 3.6}deg, ${config.bg} 0deg)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: 160, height: 160, borderRadius: '50%', background: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 48, fontWeight: 200, color: config.color }}>
            {pad(displayM)}:{pad(displayS)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{config.label}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={toggle}
          style={{ minWidth: 100, background: config.color }}>
          {running ? '暂停' : '开始'}
        </button>
        <button className="btn btn-secondary" onClick={reset}>重置</button>
      </div>
    </div>
  )
}
