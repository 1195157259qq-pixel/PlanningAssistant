import React, { useState } from 'react'
import { useStore } from './store'
import { ViewType } from './types'
import NavBar from './components/NavBar'
import TaskListView from './components/TaskListView'
import DayView from './components/DayView'
import WeekView from './components/WeekView'
import MonthView from './components/MonthView'
import ToolsView from './components/ToolsView'
import TaskForm from './components/TaskForm'

const views: { key: ViewType; label: string }[] = [
  { key: 'list', label: '列表' },
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'tools', label: '工具' },
]

export default function App() {
  const { state, dispatch } = useStore()
  const [showForm, setShowForm] = useState(false)

  const viewMap: Record<string, React.ReactElement> = {
    list: React.createElement(TaskListView),
    day: React.createElement(DayView),
    week: React.createElement(WeekView),
    month: React.createElement(MonthView),
    tools: React.createElement(ToolsView),
  }

  return React.createElement('div', { className: 'app' },
    React.createElement(NavBar),
    React.createElement('main', { className: 'main-content' },
      viewMap[state.currentView]
    ),
    React.createElement('div', { className: 'bottom-tab-bar' },
      ...views.map(v =>
        React.createElement('button', {
          key: v.key,
          className: 'bottom-tab' + (state.currentView === v.key ? ' active' : ''),
          onClick: () => dispatch({ type: 'SET_VIEW', payload: v.key }),
        }, v.label)
      ),
    ),
    React.createElement('button', {
      className: 'fab',
      onClick: () => setShowForm(true),
      title: '新建任务',
    }, '+'),
    showForm && React.createElement(TaskForm, { onClose: () => setShowForm(false) }),
  )
}
