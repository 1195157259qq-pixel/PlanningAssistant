import React, { useState, useEffect, useCallback } from 'react'

export interface ToastItem {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return React.createElement('div', { className: 'toast-container' },
    ...toasts.map(toast =>
      React.createElement(Toast, {
        key: toast.id,
        toast,
        onRemove,
      }),
    ),
  )
}

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleAction = () => {
    toast.onAction?.()
    onRemove(toast.id)
  }

  return React.createElement('div', { className: 'toast' },
    React.createElement('span', { className: 'toast-message' }, toast.message),
    toast.actionLabel && toast.onAction && React.createElement('button', {
      className: 'toast-action',
      onClick: handleAction,
    }, toast.actionLabel),
    React.createElement('button', {
      className: 'toast-close',
      onClick: () => onRemove(toast.id),
    }, '\u2715'),
  )
}
