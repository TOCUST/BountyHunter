import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  const bounty = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (bounty.reviewStatus !== 'PENDING_REVIEW') return NextResponse.json({ error: 'Not pending' }, { status: 400 })
  const updated = await prisma.bounty.update({
    where: { id: bounty.id },
    data: { reviewStatus: 'APPROVED', reviewerId: admin.id, reviewedAt: new Date(), status: 'OPEN' },
  })
  await prisma.moderationLog.create({ data: { bountyId: bounty.id, moderatorId: admin.id, action: 'APPROVE' } })
  return NextResponse.json(updated)
}

