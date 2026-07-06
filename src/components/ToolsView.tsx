import React, { useState } from 'react'
import Countdown from './Countdown'
import Pomodoro from './Pomodoro'
import Statistics from './Statistics'
import DataManager from './DataManager'

type ToolTab = 'countdown' | 'pomodoro' | 'stats' | 'data'

const TOOLS: { key: ToolTab; label: string }[] = [
  { key: 'countdown', label: '倒计时' },
  { key: 'pomodoro', label: '番茄钟' },
  { key: 'stats', label: '统计' },
  { key: 'data', label: '数据' },
]

const toolMap: Record<ToolTab, React.ReactElement> = {
  countdown: React.createElement(Countdown),
  pomodoro: React.createElement(Pomodoro),
  stats: React.createElement(Statistics),
  data: React.createElement(DataManager),
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
