import Link from 'next/link'
import ClientCountdown from '@/components/ClientCountdown'

type OfferItem = { id: string; bountyId: string; expiresAt: string }

async function getBounty(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/bounties/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function BountyDetail({ params }: any) {
  const b = await getBounty(params.id as string)
  if (!b) return <div className="p-6">Not found</div>
  // fetch my offers for countdown
  const offerRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/offers`, { cache: 'no-store' })
  const offersJson: unknown = offerRes.ok ? await offerRes.json() : []
  const offers = Array.isArray(offersJson) ? (offersJson as OfferItem[]) : []
  const myOffer = offers.find((o) => o.bountyId === b.id) || null
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="text-sm mb-4"><Link href="/bounties/mine">← 返回我的发布</Link></div>
      <h1 className="text-2xl font-semibold mb-2">{b.title}</h1>
      <div className="opacity-70 text-sm mb-4">审核：{b.reviewStatus} · 状态：{b.status}</div>
      <article className="whitespace-pre-wrap mb-4">{b.description}</article>
      {myOffer && (
        <div className="border rounded p-3 mb-4 bg-blue-50">
          <div className="font-medium">你获得了该任务的限时 Offer</div>
          <div className="text-sm opacity-80">倒计时：<ClientCountdown endsAt={myOffer.expiresAt} /></div>
          <form action={`/api/offers/${myOffer.id}/accept`} method="post" className="mt-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded">立即抢单</button>
          </form>
        </div>
      )}
      {b.reviewStatus === 'APPROVED' && b.status === 'OPEN' && !myOffer && (
        <form className="border rounded p-3 grid gap-2" action={`/api/bounties/${b.id}/proposals`} method="post">
          <div className="font-medium">申请接单</div>
          <label className="text-sm">说明
            <textarea name="message" className="border rounded w-full px-2 py-1 min-h-[80px]"/>
          </label>
          <label className="text-sm">报价（₩）
            <input type="number" name="proposedFee" defaultValue={b.budgetMax} className="border rounded px-2 py-1" />
          </label>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">提交申请</button>
        </form>
      )}
    </main>
  )
}


