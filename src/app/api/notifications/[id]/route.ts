import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(_request: Request, { params }: any) {
  try {
    const user = await requireAuth()
    
    await prisma.notification.delete({
      where: {
        id: params.id,
        userId: user.id, // Ensure user can only delete their own notifications
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }
}
