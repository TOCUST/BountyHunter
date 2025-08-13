import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const u = await requireAuth()
  const body = await req.json()
  const points = Number(body.points)
  if (!points || points <= 0) return NextResponse.json({ error: 'invalid points' }, { status: 400 })
  const s = await prisma.platformSettings.findUnique({ where: { id: 1 } })
  const minPts = s?.minWithdrawPoints ?? 3000
  if (points < minPts) return NextResponse.json({ error: 'below minimum' }, { status: 400 })

  const w = await prisma.$transaction(async (tx) => {
    const me = await tx.user.findUniqueOrThrow({ where: { id: u.id } })
    if (me.pointsBalance < points) throw new Error('insufficient')
    const newBal = me.pointsBalance - points
    const krw = Math.floor(points / (s?.pointsPerKrw ?? 0.1))
    await tx.user.update({ where: { id: me.id }, data: { pointsBalance: newBal } })
    await tx.pointsLedger.create({ data: { userId: me.id, delta: -points, balanceAfter: newBal, reason: 'WITHDRAW_REQUEST', meta: { krwAmount: krw } } })
    return await tx.pointsWithdrawal.create({ data: { userId: me.id, points, krwAmount: krw } })
  })
  return NextResponse.json(w)
}
