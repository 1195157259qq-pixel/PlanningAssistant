import { useEffect, useState, useRef } from 'react'
import { Task } from '../types'

export function useNotifications(tasks: Task[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const notifiedRef = useRef<Set<string>>(new Set())

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  useEffect(() => {
    if (!('Notification' in window)) return
    setPermission(Notification.permission)
  }, [])

  useEffect(() => {
    if (permission !== 'granted') return
    if (tasks.length === 0) return

    const checkAndNotify = () => {
      const now = new Date()
      const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

      tasks.forEach(task => {
        if (!task.hasDueDate || !task.dueDate) return
        if (task.status === 'done') return
        if (task.dueDate !== todayStr) return
        if (!task.dueTime) return

        const [tH, tM] = task.dueTime.split(':').map(Number)
        const [nH, nM] = [now.getHours(), now.getMinutes()]
        const diffMin = (tH * 60 + tM) - (nH * 60 + nM)

        if (diffMin >= 0 && diffMin <= 5 && !notifiedRef.current.has(task.id + todayStr)) {
          notifiedRef.current.add(task.id + todayStr)
          const minText = diffMin === 0 ? '现在' : `${diffMin}分钟后`
          new Notification('计划助手', {
            body: `${minText}: ${task.title}`,
            icon: '/icon-192.png',
            tag: task.id + todayStr,
          })
        }
      })
    }

    checkAndNotify()
    const interval = setInterval(checkAndNotify, 60000)
    return () => clearInterval(interval)
  }, [tasks, permission])

  return { permission, requestPermission }
}
