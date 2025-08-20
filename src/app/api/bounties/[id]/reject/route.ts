import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { notifyBountyRejected } from '@/lib/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  
  // Send notification
  await notifyBountyRejected(bounty.creatorId, bounty.id, bounty.title, reason ?? '不符合发布规范')
  
  return NextResponse.json(updated)
}

