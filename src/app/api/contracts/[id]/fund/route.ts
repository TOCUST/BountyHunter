import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { notifyContractFunded } from '@/lib/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(_request: Request, { params }: any) {
  const u = await requireAuth()
  const c = await prisma.contract.findUnique({ where: { id: params.id }, include: { bounty: true } })
  if (!c || !c.bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (c.bounty.creatorId !== u.id && u.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (c.escrowStatus !== 'UNFUNDED') return NextResponse.json({ error: 'Already funded' }, { status: 400 })
  const funded = await prisma.$transaction(async (tx) => {
    await tx.contract.update({ where: { id: c.id }, data: { escrowStatus: 'FUNDED', status: 'FUNDED' } })
    await tx.transaction.create({
      data: {
        contractId: c.id,
        type: 'ESCROW_FUND',
        amount: c.totalAmount,
        currency: c.currency,
      },
    })
    return true
  })
  
  // Send notification to hunter
  await notifyContractFunded(c.hunterId, c.id)
  
  return NextResponse.json({ ok: funded })
}


