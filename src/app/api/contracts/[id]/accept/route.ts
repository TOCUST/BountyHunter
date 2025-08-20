import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { notifyWorkAccepted, notifyFundsReleased } from '@/lib/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(_request: Request, { params }: any) {
  const u = await requireAuth()
  const c = await prisma.contract.findUnique({ where: { id: params.id }, include: { bounty: true } })
  if (!c || !c.bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (c.bounty.creatorId !== u.id && u.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (c.status !== 'SUBMITTED') return NextResponse.json({ error: 'Not submitted' }, { status: 400 })
  const result = await prisma.$transaction(async (tx) => {
    await tx.contract.update({ where: { id: c.id }, data: { status: 'RELEASED', escrowStatus: 'RELEASED' } })
    await tx.transaction.create({ data: { contractId: c.id, type: 'RELEASE', amount: c.totalAmount, currency: c.currency } })
    await tx.bounty.update({ where: { id: c.bountyId }, data: { status: 'CLOSED' } })
    return true
  })
  
  // Send notifications
  await notifyWorkAccepted(c.hunterId, c.id)
  await notifyFundsReleased(c.hunterId, c.id, c.totalAmount)
  
  return NextResponse.json({ ok: result })
}


