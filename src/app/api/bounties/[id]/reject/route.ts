import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request, { params }: any) {
  const admin = await requireAdmin()
  const { reason } = await request.json()
  const bounty = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (bounty.reviewStatus !== 'PENDING_REVIEW') return NextResponse.json({ error: 'Not pending' }, { status: 400 })
  const updated = await prisma.bounty.update({
    where: { id: bounty.id },
    data: { reviewStatus: 'REJECTED', reviewerId: admin.id, reviewedAt: new Date(), rejectionReason: reason ?? '不符合发布规范' },
  })
  await prisma.moderationLog.create({ data: { bountyId: bounty.id, moderatorId: admin.id, action: 'REJECT', reason: reason ?? '' } })
  return NextResponse.json(updated)
}

