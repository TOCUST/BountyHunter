import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const u = await requireAuth()
  const items = await prisma.pointsWithdrawal.findMany({ where: { userId: u.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}
