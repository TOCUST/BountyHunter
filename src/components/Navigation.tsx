'use client'

import Link from 'next/link'
import { NotificationBell } from './NotificationBell'

export function Navigation() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              赏金猎人
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/bounties" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                任务列表
              </Link>
              <Link href="/bounties/new" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                发布任务
              </Link>
              <Link href="/bounties/mine" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                我的任务
              </Link>
              <Link href="/offers" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                我的 Offer
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <div className="text-sm text-gray-600">
              <Link href="/admin/moderation" className="hover:text-gray-900">审核</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
