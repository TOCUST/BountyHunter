import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() || ''
  const min = Number(url.searchParams.get('min') || '0') || 0
  const max = Number(url.searchParams.get('max') || '0') || 0
  const take = Math.min(Number(url.searchParams.get('take') || '20') || 20, 50)
  const cursor = url.searchParams.get('cursor') || undefined

  const where: Prisma.BountyWhereInput = {
    reviewStatus: 'APPROVED',
    status: { in: ['OPEN','ASSIGNED','IN_PROGRESS'] },
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ]
  }
  if (min > 0) where.budgetMin = { gte: min }
  if (max > 0) where.budgetMax = { lte: max }

  const items = await prisma.bounty.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })
  return NextResponse.json({ items, nextCursor: items.length === take ? items[items.length - 1].id : null })
}

export async function POST(req: NextRequest) {
  const user = await requireAuth()
  const body = await req.json()
  const b = await prisma.bounty.create({
    data: {
      creatorId: user.id,
      title: body.title,
      description: body.description,
      currency: body.currency ?? 'KRW',
      budgetMin: body.budgetMin ?? 0,
      budgetMax: body.budgetMax ?? 0,
      deadline: body.deadline ? new Date(body.deadline) : null,
      visibility: body.visibility ?? 'PUBLIC',
      reviewStatus: 'DRAFT',
      status: 'DRAFT',
    },
  })
  return NextResponse.json(b)
}
