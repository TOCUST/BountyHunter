'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  bountyId?: string
  contractId?: string
  createdAt: string
  bounty?: { id: string; title: string }
  contract?: { id: string }
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'BOUNTY_SUBMITTED':
    case 'BOUNTY_APPROVED':
    case 'BOUNTY_REJECTED':
      return <Bell size={20} className="text-blue-500" />
    case 'PROPOSAL_RECEIVED':
    case 'PROPOSAL_ACCEPTED':
      return <CheckCircle size={20} className="text-green-500" />
    case 'OFFER_RECEIVED':
    case 'OFFER_EXPIRED':
      return <Clock size={20} className="text-orange-500" />
    case 'CONTRACT_FUNDED':
    case 'WORK_SUBMITTED':
    case 'WORK_ACCEPTED':
    case 'FUNDS_RELEASED':
    case 'FUNDS_REFUNDED':
      return <CheckCircle size={20} className="text-purple-500" />
    case 'POINTS_EARNED':
    case 'POINTS_WITHDRAWN':
      return <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
    default:
      return <AlertCircle size={20} className="text-gray-500" />
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?take=100')
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    for (const id of unreadIds) {
      await markAsRead(id)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">通知中心</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            全部标记已读 ({unreadCount})
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          全部 ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-md ${
            filter === 'unread' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          未读 ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {filter === 'unread' ? '没有未读通知' : '暂无通知'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 ${
                !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                      {notification.bountyId && (
                        <Link
                          href={`/bounties/${notification.bountyId}`}
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          查看任务
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="标记已读"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="删除通知"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
