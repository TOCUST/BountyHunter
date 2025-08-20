import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(_request: Request, { params }: any) {
  try {
    const user = await requireAuth()
    
    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: user.id, // Ensure user can only mark their own notifications as read
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json(notification)
  } catch {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }
}
