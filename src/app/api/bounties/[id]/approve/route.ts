import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { notifyBountyApproved } from '@/lib/notifications'
import { createOffersForBounty } from '@/lib/offers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(_request: Request, { params }: any) {
  const admin = await requireAdmin()
  const bounty = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (bounty.reviewStatus !== 'PENDING_REVIEW') return NextResponse.json({ error: 'Not pending' }, { status: 400 })
  const updated = await prisma.bounty.update({
    where: { id: bounty.id },
    data: { reviewStatus: 'APPROVED', reviewerId: admin.id, reviewedAt: new Date(), status: 'OPEN' },
  })
  await prisma.moderationLog.create({ data: { bountyId: bounty.id, moderatorId: admin.id, action: 'APPROVE' } })
  
  // Send notification
  await notifyBountyApproved(bounty.creatorId, bounty.id, bounty.title)
  
  // trigger offers in background (best-effort)
  createOffersForBounty(bounty.id).catch(()=>{})
  return NextResponse.json(updated)
}

