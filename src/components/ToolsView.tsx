import React, { useState } from 'react'
import Countdown from './Countdown'
import Stopwatch from './Stopwatch'
import Pomodoro from './Pomodoro'
import Statistics from './Statistics'

type ToolTab = 'countdown' | 'stopwatch' | 'pomodoro' | 'stats'

const TOOLS: { key: ToolTab; label: string }[] = [
  { key: 'countdown', label: '倒计时' },
  { key: 'stopwatch', label: '计时器' },
  { key: 'pomodoro', label: '番茄钟' },
  { key: 'stats', label: '统计' },
]

const toolMap: Record<ToolTab, React.ReactElement> = {
  countdown: React.createElement(Countdown),
  stopwatch: React.createElement(Stopwatch),
  pomodoro: React.createElement(Pomodoro),
  stats: React.createElement(Statistics),
}

export default function ToolsView() {
  const [tab, setTab] = useState<ToolTab>('countdown')

  return React.createElement('div', { className: 'view-container' },
    React.createElement('div', { className: 'filter-tabs' },
      ...TOOLS.map(t =>
        React.createElement('button', {
          key: t.key,
          className: 'filter-tab' + (tab === t.key ? ' active' : ''),
          onClick: () => setTab(t.key),
        }, t.label),
      ),
    ),
    React.createElement('div', null, toolMap[tab]),
  )
}
