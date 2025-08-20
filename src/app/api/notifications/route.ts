import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const take = parseInt(searchParams.get('take') || '20')
    const cursor = searchParams.get('cursor')

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      take,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        bounty: { select: { id: true, title: true } },
        contract: { select: { id: true } },
      }
    })

    return NextResponse.json(notifications)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { type, title, message, bountyId, contractId } = await request.json()

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        bountyId,
        contractId,
      }
    })

    return NextResponse.json(notification)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
