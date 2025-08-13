import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { runAutoModeration } from '@/lib/moderation'

export async function POST(_request: Request, { params }) {
  const user = await requireAuth()
  const bounty = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (bounty.creatorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!['DRAFT','REJECTED'].includes(bounty.reviewStatus)) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
  }
  const scan = await runAutoModeration([bounty.title, bounty.description], bounty?.currency === 'KRW' ? 'ko-KR' : undefined)
  if (scan.hits.some(h => h.type === 'BLOCK')) {
    await prisma.$transaction(async (tx) => {
      await tx.bounty.update({
        where: { id: bounty.id },
        data: { reviewStatus: 'REJECTED', rejectionReason: '包含禁止词，请修改后再提交。', contentRiskScore: scan.score, autoReviewReason: 'BLOCK' },
      })
      await tx.moderationLog.create({ data: { bountyId: bounty.id, moderatorId: user.id, action: 'AUTO_REJECT', reason: 'BLOCK' } })
      for (const h of scan.hits) {
        await tx.moderationViolation.create({ data: { bountyId: bounty.id, ruleId: h.ruleId, excerpt: h.excerpt, normalized: '' } })
      }
    })
    return NextResponse.json({ error: 'Rejected by auto moderation' }, { status: 400 })
  }
  const updated = await prisma.bounty.update({
    where: { id: bounty.id },
    data: { reviewStatus: 'PENDING_REVIEW', rejectionReason: null, contentRiskScore: scan.score, autoReviewReason: scan.hits.length ? 'AUTO_FLAG' : null },
  })
  await prisma.moderationLog.create({ data: { bountyId: bounty.id, moderatorId: user.id, action: scan.hits.length ? 'AUTO_FLAG' : 'SUBMIT' } })
  for (const h of scan.hits) {
    await prisma.moderationViolation.create({ data: { bountyId: bounty.id, ruleId: h.ruleId, excerpt: h.excerpt, normalized: '' } })
  }
  return NextResponse.json(updated)
}
