import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const u = await requireAuth()
  const me = await prisma.user.findUniqueOrThrow({ where: { id: u.id } })
  return NextResponse.json({ pointsBalance: me.pointsBalance })
}
