import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(_request: Request, { params }: any) {
  const u = await requireAuth()
  const offer = await prisma.bountyOffer.findUnique({ where: { id: params.id }, include: { bounty: true } })
  if (!offer || offer.userId !== u.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (offer.expiresAt < new Date() || offer.status !== 'DELIVERED') return NextResponse.json({ error: 'Expired' }, { status: 400 })
  if (!offer.bounty || offer.bounty.reviewStatus !== 'APPROVED' || offer.bounty.status !== 'OPEN') return NextResponse.json({ error: 'Unavailable' }, { status: 400 })
  await prisma.$transaction(async (tx) => {
    await tx.bountyOffer.update({ where: { id: offer.id }, data: { status: 'ACCEPTED', acceptedAt: new Date() } })
    await tx.bounty.update({ where: { id: offer.bountyId }, data: { status: 'ASSIGNED' } })
  })
  return NextResponse.json({ ok: true })
}


