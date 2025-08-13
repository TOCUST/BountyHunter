import Link from 'next/link'

async function getBounty(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/bounties/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function BountyDetail({ params }: { params: { id: string } }) {
  const b = await getBounty(params.id)
  if (!b) return <div className="p-6">Not found</div>
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="text-sm mb-4"><Link href="/bounties/mine">← 返回我的发布</Link></div>
      <h1 className="text-2xl font-semibold mb-2">{b.title}</h1>
      <div className="opacity-70 text-sm mb-4">审核：{b.reviewStatus} · 状态：{b.status}</div>
      <article className="whitespace-pre-wrap">{b.description}</article>
    </main>
  )
}


