import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { notifyFundsRefunded } from '@/lib/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(_request: Request, { params }: any) {
  const u = await requireAuth()
  const c = await prisma.contract.findUnique({ where: { id: params.id }, include: { bounty: true } })
  if (!c || !c.bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (c.bounty.creatorId !== u.id && u.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (c.escrowStatus !== 'FUNDED') return NextResponse.json({ error: 'Not funded' }, { status: 400 })
  const result = await prisma.$transaction(async (tx) => {
    await tx.contract.update({ where: { id: c.id }, data: { status: 'REFUNDED', escrowStatus: 'REFUNDED' } })
    await tx.transaction.create({ data: { contractId: c.id, type: 'REFUND', amount: c.totalAmount, currency: c.currency } })
    await tx.bounty.update({ where: { id: c.bountyId }, data: { status: 'OPEN' } })
    return true
  })
  
  // Send notification to poster (they get their money back)
  await notifyFundsRefunded(c.bounty.creatorId, c.id, c.totalAmount)
  
  return NextResponse.json({ ok: result })
}


