'use client'
import { useState } from 'react'

export default function NewBountyPage() {
  const [form, setForm] = useState({ title: '', description: '', budgetMin: 0, budgetMax: 0, deadline: '' })
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const create = async () => {
    setMessage(null)
    const res = await fetch('/api/bounties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        deadline: form.deadline || null,
      }),
    })
    if (!res.ok) { setMessage('创建失败'); return }
    const b = await res.json()
    setCreatedId(b.id)
    setMessage('已创建草稿')
  }

  const submitForReview = async () => {
    if (!createdId) return
    const r = await fetch(`/api/bounties/${createdId}/submit`, { method: 'POST' })
    if (!r.ok) { setMessage('提交审核失败'); return }
    setMessage('已提交审核')
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">发布赏金</h1>
      <div className="grid gap-3">
        <label className="flex flex-col">标题
          <input className="border rounded px-2 py-1" value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} />
        </label>
        <label className="flex flex-col">描述
          <textarea className="border rounded px-2 py-1 min-h-[120px]" value={form.description} onChange={e=>setForm(f=>({...f, description: e.target.value}))} />
        </label>
        <div className="flex gap-3">
          <label className="flex flex-col">最低预算
            <input type="number" className="border rounded px-2 py-1" value={form.budgetMin} onChange={e=>setForm(f=>({...f, budgetMin: Number(e.target.value)}))} />
          </label>
          <label className="flex flex-col">最高预算
            <input type="number" className="border rounded px-2 py-1" value={form.budgetMax} onChange={e=>setForm(f=>({...f, budgetMax: Number(e.target.value)}))} />
          </label>
          <label className="flex flex-col">截止日期
            <input type="date" className="border rounded px-2 py-1" value={form.deadline} onChange={e=>setForm(f=>({...f, deadline: e.target.value}))} />
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={create} className="px-3 py-1 bg-black text-white rounded">保存草稿</button>
          <button onClick={submitForReview} disabled={!createdId} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">提交审核</button>
        </div>
        {message && <div className="text-sm opacity-80">{message}</div>}
      </div>
    </main>
  )
}


