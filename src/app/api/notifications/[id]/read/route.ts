import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    
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
  } catch (error) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }
}
