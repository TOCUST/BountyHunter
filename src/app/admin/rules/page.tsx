'use client'
import { useEffect, useState } from 'react'

type Rule = {
  id: string
  type: 'BLOCK'|'REVIEW'|'ALLOW'
  pattern: string
  isRegex: boolean
  locale: string | null
  severity: number
  score: number
  tags: unknown
  createdAt: string
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'x-user-role': 'ADMIN', 'content-type': 'application/json' } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function RulesAdminPage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [form, setForm] = useState({ type: 'BLOCK', pattern: '', isRegex: false, locale: '', score: 10 })

  const load = async () => {
    const list = await api<Rule[]>('/api/moderation/rules')
    setRules(list)
  }
  useEffect(()=>{ load() },[])

  const create = async () => {
    if (!form.pattern) return
    await api('/api/moderation/rules', { method: 'POST', body: JSON.stringify({
      type: form.type,
      pattern: form.pattern,
      isRegex: form.isRegex,
      locale: form.locale || null,
      score: Number(form.score) || 10,
    }) })
    setForm({ type: 'BLOCK', pattern: '', isRegex: false, locale: '', score: 10 })
    await load()
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">规则管理</h1>
      <div className="border rounded p-4 mb-6 flex flex-wrap gap-2 items-end">
        <label className="flex flex-col text-sm">类别
          <select value={form.type} onChange={e=>setForm(f=>({...f, type: e.target.value }))} className="border px-2 py-1 rounded">
            <option value="BLOCK">BLOCK</option>
            <option value="REVIEW">REVIEW</option>
            <option value="ALLOW">ALLOW</option>
          </select>
        </label>
        <label className="flex flex-col text-sm">模式/词
          <input value={form.pattern} onChange={e=>setForm(f=>({...f, pattern: e.target.value }))} className="border px-2 py-1 rounded" placeholder="词或正则" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isRegex} onChange={e=>setForm(f=>({...f, isRegex: e.target.checked }))} /> 正则
        </label>
        <label className="flex flex-col text-sm">语言
          <input value={form.locale} onChange={e=>setForm(f=>({...f, locale: e.target.value }))} className="border px-2 py-1 rounded" placeholder="ko-KR/zh-CN/en-US 或留空" />
        </label>
        <label className="flex flex-col text-sm">分值
          <input type="number" value={form.score} onChange={e=>setForm(f=>({...f, score: Number(e.target.value) }))} className="border px-2 py-1 rounded w-24" />
        </label>
        <button onClick={create} className="px-3 py-1 bg-black text-white rounded">新增规则</button>
      </div>

      <div className="grid gap-3">
        {rules.map(r => (
          <div key={r.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">[{r.type}] {r.pattern} {r.isRegex ? '(regex)' : ''}</div>
              <div className="text-sm opacity-75">locale: {r.locale || 'all'} · score: {r.score}</div>
            </div>
            <div className="text-xs opacity-60">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </main>
  )
}


