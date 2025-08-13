import Link from 'next/link'

async function getBounty(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/bounties/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function BountyDetail({ params }: any) {
  const b = await getBounty(params.id as string)
  if (!b) return <div className="p-6">Not found</div>
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="text-sm mb-4"><Link href="/bounties/mine">← 返回我的发布</Link></div>
      <h1 className="text-2xl font-semibold mb-2">{b.title}</h1>
      <div className="opacity-70 text-sm mb-4">审核：{b.reviewStatus} · 状态：{b.status}</div>
      <article className="whitespace-pre-wrap mb-4">{b.description}</article>
      {b.reviewStatus === 'APPROVED' && b.status === 'OPEN' && (
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


