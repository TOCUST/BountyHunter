import { prisma } from '@/lib/prisma'
import { notifyOfferReceived } from './notifications'

export async function createOffersForBounty(bountyId: string, minutes = 15) {
  const bounty = await prisma.bounty.findUnique({ where: { id: bountyId } })
  if (!bounty) return []
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000)
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: bounty.creatorId },
      lastLocatedAt: { gte: since },
    },
    take: 200,
  })
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000)
  if (candidates.length === 0) return []
  const offers = await prisma.$transaction(
    candidates.map((u) =>
      prisma.bountyOffer.create({
        data: {
          userId: u.id,
          bountyId: bounty.id,
          expiresAt,
          locale: (u as unknown as { locale?: string } | null)?.locale ?? 'ko-KR',
        },
      })
    )
  )
  
  // Send notifications to all users who received offers
  for (const candidate of candidates) {
    try {
      await notifyOfferReceived(candidate.id, bounty.id, bounty.title)
    } catch (error) {
      console.error('Failed to send offer notification:', error)
    }
  }
  
  return offers
}


