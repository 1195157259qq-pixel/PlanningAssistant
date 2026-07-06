import { useState } from 'react'
import { useStore } from './store'
import { ViewType, Task } from './types'
import NavBar from './components/NavBar'
import TaskListView from './components/TaskListView'
import DayView from './components/DayView'
import WeekView from './components/WeekView'
import MonthView from './components/MonthView'
import ToolsView from './components/ToolsView'
import TaskForm from './components/TaskForm'
import ToastContainer, { useToast } from './components/Toast'
import { useNotifications } from './components/useNotifications'
import Settings from './components/Settings'

const views: { key: ViewType; label: string }[] = [
  { key: 'list', label: '列表' },
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'tools', label: '工具' },
]

export default function App() {
  const { state, dispatch } = useStore()
  const { toasts, addToast, removeToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>(undefined)
  const [showSettings, setShowSettings] = useState(false)
  const { permission, requestPermission } = useNotifications(state.tasks)

  const handleOpenForm = () => {
    setEditTask(undefined)
    setShowForm(true)
  }

  const handleEdit = (task: Task) => {
    setEditTask(task)
    setShowForm(true)
  }

  const handleDeleteWithUndo = (task: Task) => {
    dispatch({ type: 'DELETE_TASK', payload: task.id })
    addToast({
      message: '任务已删除',
      actionLabel: '撤销',
      onAction: () => {
        dispatch({ type: 'ADD_TASK', payload: task })
      },
    })
  }

  const handleTaskClick = (task: Task) => {
    setEditTask(task)
    setShowForm(true)
  }

  const renderView = () => {
    switch (state.currentView) {
      case 'list':
        return <TaskListView key="list" onEdit={handleEdit} onDeleteWithUndo={handleDeleteWithUndo} onTaskClick={handleTaskClick} />
      case 'day':
        return <DayView key="day" onEdit={handleEdit} onDeleteWithUndo={handleDeleteWithUndo} onTaskClick={handleTaskClick} />
      case 'week':
        return <WeekView key="week" onEdit={handleEdit} onDeleteWithUndo={handleDeleteWithUndo} onTaskClick={handleTaskClick} />
      case 'month':
        return <MonthView key="month" onTaskClick={handleTaskClick} />
      case 'tools':
        return <ToolsView key="tools" />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <NavBar
        notificationPermission={permission}
        onRequestNotification={requestPermission}
        onOpenSettings={() => setShowSettings(true)}
      />
      <main className="main-content">
        {renderView()}
      </main>
      <div className="bottom-tab-bar">
        {views.map(v => (
          <button
            key={v.key}
            className={'bottom-tab' + (state.currentView === v.key ? ' active' : '')}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: v.key })}
          >
            {v.label}
          </button>
        ))}
      </div>
      <button className="fab" onClick={handleOpenForm} title="新建任务">+</button>
      {showForm && <TaskForm onClose={() => { setShowForm(false); setEditTask(undefined) }} editTask={editTask} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
