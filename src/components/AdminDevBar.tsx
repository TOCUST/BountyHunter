'use client'
import { useState } from 'react'

export default function AdminDevBar() {
  const [userId, setUserId] = useState('')

  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/;`
  }

  function randomId() {
    try { return crypto.randomUUID() } catch { return Math.random().toString(36).slice(2, 10) }
  }

  const apply = (role: 'ADMIN'|'MEMBER') => {
    const id = userId || randomId()
    setCookie('dev_user_id', id)
    setCookie('dev_user_role', role)
    location.reload()
  }

  return (
    <div className="w-full bg-yellow-100 border-b border-yellow-300 text-sm px-3 py-2 flex items-center gap-2">
      <span className="font-medium">DevAuth:</span>
      <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="userId (optional)" className="px-2 py-1 border rounded" />
      <button onClick={()=>apply('ADMIN')} className="px-2 py-1 bg-black text-white rounded">Use ADMIN</button>
      <button onClick={()=>apply('MEMBER')} className="px-2 py-1 bg-gray-200 rounded">Use MEMBER</button>
    </div>
  )
}


