'use client'
import { useEffect, useState } from 'react'

type Item = { id: string; title: string; budgetMin: number; budgetMax: number; createdAt: string }

export default function BountiesListPage() {
  const [q, setQ] = useState('')
  const [min, setMin] = useState<number | ''>('')
  const [max, setMax] = useState<number | ''>('')
  const [items, setItems] = useState<Item[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async (reset = false) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (min) params.set('min', String(min))
    if (max) params.set('max', String(max))
    params.set('take', '20')
    if (!reset && cursor) params.set('cursor', cursor)
    const res = await fetch(`/api/bounties?${params.toString()}`)
    const data = await res.json()
    setItems(reset ? data.items : [...items, ...data.items])
    setCursor(data.nextCursor)
    setLoading(false)
  }

  useEffect(()=>{ void load(true) }, [])

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">赏金列表</h1>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索标题/描述" className="border px-2 py-1 rounded flex-1" />
        <input type="number" value={min} onChange={e=>setMin(e.target.value ? Number(e.target.value) : '')} placeholder="最小预算" className="border px-2 py-1 rounded w-32" />
        <input type="number" value={max} onChange={e=>setMax(e.target.value ? Number(e.target.value) : '')} placeholder="最大预算" className="border px-2 py-1 rounded w-32" />
        <button onClick={()=>{ setCursor(null); load(true) }} className="px-3 py-1 bg-black text-white rounded">筛选</button>
      </div>
      <div className="grid gap-3">
        {items.map(it => (
          <a key={it.id} href={`/bounties/${it.id}`} className="border rounded p-3 hover:bg-gray-50">
            <div className="font-medium">{it.title}</div>
            <div className="text-sm opacity-70">预算 ₩{it.budgetMin} - ₩{it.budgetMax}</div>
          </a>
        ))}
      </div>
      <div className="mt-4">
        <button disabled={!cursor || loading} onClick={()=>load(false)} className="px-3 py-1 border rounded disabled:opacity-50">{loading ? '加载中...' : '加载更多'}</button>
      </div>
    </main>
  )
}


