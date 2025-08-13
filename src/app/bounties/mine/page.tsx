'use client'
import { useEffect, useState } from 'react'

type Bounty = {
  id: string
  title: string
  reviewStatus: 'DRAFT'|'PENDING_REVIEW'|'APPROVED'|'REJECTED'
  status: string
  createdAt: string
}

export default function MyBountiesPage() {
  const [items, setItems] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/bounties/mine')
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  const resubmit = async (id: string) => {
    await fetch(`/api/bounties/${id}/submit`, { method: 'POST' })
    await load()
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">我的发布</h1>
      {loading && <div>Loading...</div>}
      <div className="grid gap-3">
        {items.map(b => (
          <div key={b.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-sm opacity-70">审核：{b.reviewStatus} · 状态：{b.status}</div>
            </div>
            <div className="flex gap-2 text-sm">
              <a href={`/bounties/${b.id}`} className="px-3 py-1 bg-gray-200 rounded">详情</a>
              {(b.reviewStatus === 'DRAFT' || b.reviewStatus === 'REJECTED') && (
                <button onClick={()=>resubmit(b.id)} className="px-3 py-1 bg-blue-600 text-white rounded">重新提交审核</button>
              )}
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <div className="opacity-70">暂无内容</div>}
      </div>
    </main>
  )
}


