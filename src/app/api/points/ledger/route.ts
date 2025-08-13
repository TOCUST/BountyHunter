import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const u = await requireAuth()
  const url = new URL(req.url)
  const take = Number(url.searchParams.get('take') ?? 50)
  const cursor = url.searchParams.get('cursor') ?? undefined
  const items = await prisma.pointsLedger.findMany({
    where: { userId: u.id },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })
  return NextResponse.json({ items, nextCursor: items.length === take ? items[items.length-1].id : null })
}
