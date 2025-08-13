import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const items = await prisma.bounty.findMany({
    where: { reviewStatus: 'APPROVED', status: { in: ['OPEN','ASSIGNED','IN_PROGRESS'] } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const items = await prisma.bounty.findMany({
    where: { reviewStatus: 'APPROVED', status: { in: ['OPEN','ASSIGNED','IN_PROGRESS'] } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
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
