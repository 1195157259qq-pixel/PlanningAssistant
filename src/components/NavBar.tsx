import React from 'react'

interface Props {
  notificationPermission?: NotificationPermission
  onRequestNotification?: () => void
  onOpenSettings?: () => void
}

export default function NavBar({ notificationPermission, onRequestNotification, onOpenSettings }: Props) {
  const showBell = 'Notification' in window && notificationPermission !== 'granted'

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-mascot">🐣</span>
        <span className="navbar-title">计划助手</span>
      </div>
      <div className="navbar-actions">
        {showBell && (
          <button className="nav-btn" onClick={onRequestNotification} title="开启通知提醒">
            🔔
          </button>
        )}
        <button className="nav-btn" onClick={onOpenSettings} title="设置">
          ⚙
        </button>
      </div>
    </nav>
  )
}
