'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  bountyId?: string
  contractId?: string
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?take=10')
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
      setUnreadCount(data.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b">
            <h3 className="font-medium">通知</h3>
          </div>
          
          {loading ? (
            <div className="p-4 text-center text-gray-500">加载中...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">暂无通知</div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id)
                    if (notification.bountyId) {
                      window.location.href = `/bounties/${notification.bountyId}`
                    }
                    setIsOpen(false)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                    </div>
                    <div className="text-xs text-gray-400 ml-2">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <a href="/notifications" className="text-sm text-blue-600 hover:underline">
                查看全部通知
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
