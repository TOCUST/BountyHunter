import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { isPlatformFeeActive } from '@/lib/platform'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  const proposal = await prisma.proposal.findUnique({ where: { id: params.id } })
  if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const bounty = await prisma.bounty.findUniqueOrThrow({ where: { id: proposal.bountyId } })
  if (bounty.creatorId !== user.id && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (bounty.status !== 'OPEN') return NextResponse.json({ error: 'Not open' }, { status: 400 })

  const active = await isPlatformFeeActive()
  const platformFeeBps = (await prisma.platformSettings.findUnique({ where: { id: 1 } }))?.platformFeeBps ?? 500
  const totalAmount = proposal.proposedFee
  const platformFeeAmount = active ? Math.floor(totalAmount * platformFeeBps / 10000) : 0

  const result = await prisma.$transaction(async (tx) => {
    await tx.proposal.update({ where: { id: proposal.id }, data: { status: 'ACCEPTED' } })
    const contract = await tx.contract.create({
      data: {
        bountyId: bounty.id,
        hunterId: proposal.hunterId,
        status: 'PROPOSED',
        totalAmount,
        platformFeeAmount,
        currency: bounty.currency,
      },
    })
    await tx.bounty.update({ where: { id: bounty.id }, data: { status: 'ASSIGNED' } })
    return { contract }
  })
  return NextResponse.json(result)
}


