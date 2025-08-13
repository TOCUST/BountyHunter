import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const u = await requireAuth()
  const body = await req.json()
  const feeKrw = Number(body.feeKrw)
  const feeType = (body.feeType || 'POST_FEE') as 'POST_FEE'|'PLATFORM_FEE'
  const commit = !!body.commit
  if (!feeKrw || feeKrw < 0) return NextResponse.json({ error: 'invalid fee' }, { status: 400 })
  const s = await prisma.platformSettings.findUnique({ where: { id: 1 } })
  const allowPlatform = !!s?.allowPointsForPlatformFee
  if (feeType === 'PLATFORM_FEE' && !allowPlatform) {
    return NextResponse.json({ usedPoints: 0, payKrw: feeKrw })
  }
  const rate = s?.pointsPerKrw ?? 0.1
  const maxPoints = Math.floor(feeKrw * rate)
  const me = await prisma.user.findUniqueOrThrow({ where: { id: u.id } })
  const usePoints = Math.min(me.pointsBalance, maxPoints)
  const payKrw = Math.max(0, feeKrw - Math.floor(usePoints / rate))
  if (!commit || usePoints === 0) {
    return NextResponse.json({ usedPoints: usePoints, payKrw })
  }
  const result = await prisma.$transaction(async (tx) => {
    const fresh = await tx.user.findUniqueOrThrow({ where: { id: u.id } })
    const realUse = Math.min(fresh.pointsBalance, usePoints)
    const newBal = fresh.pointsBalance - realUse
    await tx.user.update({ where: { id: fresh.id }, data: { pointsBalance: newBal } })
    await tx.pointsLedger.create({ data: { userId: fresh.id, delta: -realUse, balanceAfter: newBal, reason: 'POST_FEE_OFFSET', meta: { feeKrw, feeType } } })
    return { usedPoints: realUse, payKrw: Math.max(0, feeKrw - Math.floor(realUse / rate)) }
  })
  return NextResponse.json(result)
}
