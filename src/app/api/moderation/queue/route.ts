import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  await requireAdmin()
  const items = await prisma.bounty.findMany({
    where: { reviewStatus: 'PENDING_REVIEW' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      creatorId: true,
      budgetMin: true,
      budgetMax: true,
      createdAt: true,
      contentRiskScore: true,
      autoReviewReason: true,
    }
  })
  return NextResponse.json(items)
}


