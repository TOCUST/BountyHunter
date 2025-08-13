'use client'
import { useEffect, useState } from 'react'

type QueueItem = {
  id: string
  title: string
  description: string
  creatorId: string
  budgetMin: number
  budgetMax: number
  createdAt: string
  contentRiskScore: number
  autoReviewReason: string | null
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'x-user-role': 'ADMIN' } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function ModerationAdminPage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<QueueItem[]>('/api/moderation/queue')
      setItems(data)
    } catch (e: any) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const approve = async (id: string) => {
    await api(`/api/bounties/${id}/approve`, { method: 'POST' })
    await load()
  }
  const reject = async (id: string) => {
    const reason = prompt('驳回原因：') || '不符合发布规范'
    await api(`/api/bounties/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
    await load()
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">审核队列</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid gap-4">
        {items.map(it => (
          <div key={it.id} className="border rounded p-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="text-lg font-medium">{it.title}</div>
                <div className="opacity-80 text-sm">预算 ₩{it.budgetMin} - ₩{it.budgetMax}</div>
                <div className="opacity-60 text-sm">风险分：{it.contentRiskScore} {it.autoReviewReason && `( ${it.autoReviewReason} )`}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>approve(it.id)} className="px-3 py-1 bg-green-600 text-white rounded">通过</button>
                <button onClick={()=>reject(it.id)} className="px-3 py-1 bg-red-600 text-white rounded">驳回</button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap opacity-90 text-sm">{it.description}</p>
          </div>
        ))}
        {!loading && items.length === 0 && <div className="opacity-70">暂无待审核任务</div>}
      </div>
    </main>
  )
}


