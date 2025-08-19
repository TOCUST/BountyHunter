import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const u = await requireAuth()
  const now = new Date()
  const items = await prisma.bountyOffer.findMany({
    where: { userId: u.id, status: { in: ['DELIVERED', 'OPENED'] }, expiresAt: { gt: now } },
    orderBy: { expiresAt: 'asc' },
    include: { bounty: true },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const u = await requireAuth()
  const { offerId } = await req.json()
  const offer = await prisma.bountyOffer.findUnique({ where: { id: offerId } })
  if (!offer || offer.userId !== u.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (offer.expiresAt < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 400 })
  await prisma.bountyOffer.update({ where: { id: offer.id }, data: { status: 'OPENED', openedAt: new Date() } })
  return NextResponse.json({ ok: true })
}


