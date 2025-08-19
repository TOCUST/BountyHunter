'use client'
import { useEffect, useState } from 'react'
import ClientCountdown from '@/components/ClientCountdown'

type Offer = {
  id: string
  bountyId: string
  expiresAt: string
  status: 'DELIVERED'|'OPENED'|'ACCEPTED'|'EXPIRED'|'CANCELED'
  bounty: { id: string; title: string }
}

export default function MyOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/offers', { cache: 'no-store' })
      const data = await res.json()
      setOffers(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const accept = async (id: string) => {
    const r = await fetch(`/api/offers/${id}/accept`, { method: 'POST' })
    if (r.ok) { await load() }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">我的 Offer</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid gap-3">
        {offers.map(o => (
          <div key={o.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <a href={`/bounties/${o.bountyId}`} className="font-medium hover:underline">{o.bounty?.title ?? 'Bounty'}</a>
              <div className="text-sm opacity-70">倒计时：<ClientCountdown endsAt={o.expiresAt} /></div>
            </div>
            <div className="flex gap-2">
              <a href={`/bounties/${o.bountyId}`} className="px-3 py-1 border rounded">查看</a>
              <button onClick={()=>accept(o.id)} className="px-3 py-1 bg-green-600 text-white rounded">抢单</button>
            </div>
          </div>
        ))}
        {!loading && offers.length === 0 && <div className="opacity-70">暂无有效 Offer</div>}
      </div>
    </main>
  )
}


