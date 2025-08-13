import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const u = await requireAuth()
  const me = await prisma.user.findUniqueOrThrow({ where: { id: u.id } })
  if (!me.referralCode) {
    const code = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2,10)).slice(0,8)
    await prisma.user.update({ where: { id: me.id }, data: { referralCode: code } })
    me.referralCode = code
  }
  return NextResponse.json({ referralCode: me.referralCode })
}

export async function POST(req: NextRequest) {
  const u = await requireAuth()
  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })
  const inviter = await prisma.user.findFirst({ where: { referralCode: code } })
  if (!inviter) return NextResponse.json({ error: 'invalid code' }, { status: 400 })
  if (inviter.id === u.id) return NextResponse.json({ error: 'self referral not allowed' }, { status: 400 })

  const me = await prisma.user.findUniqueOrThrow({ where: { id: u.id } })
  if (me.referredById) return NextResponse.json({ error: 'already referred' }, { status: 400 })

  const s = await prisma.platformSettings.findUnique({ where: { id: 1 } })
  const inviterPts = s?.referralInviterPts ?? 200
  const inviteePts = s?.referralInviteePts ?? 200

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: me.id }, data: { referredById: inviter.id } })
    await tx.referralClaim.upsert({
      where: { inviterId_inviteeId: { inviterId: inviter.id, inviteeId: me.id } },
      update: { status: 'REWARDED', rewardedAt: new Date() },
      create: { inviterId: inviter.id, inviteeId: me.id, status: 'REWARDED', rewardedAt: new Date() },
    })
    const invUser = await tx.user.findUniqueOrThrow({ where: { id: inviter.id } })
    const invNew = invUser.pointsBalance + inviterPts
    await tx.user.update({ where: { id: inviter.id }, data: { pointsBalance: invNew } })
    await tx.pointsLedger.create({ data: { userId: inviter.id, delta: inviterPts, balanceAfter: invNew, reason: 'REFERRAL_BONUS_INVITER', meta: { inviteeId: me.id } } })

    const meUser = await tx.user.findUniqueOrThrow({ where: { id: me.id } })
    const inwNew = meUser.pointsBalance + inviteePts
    await tx.user.update({ where: { id: me.id }, data: { pointsBalance: inwNew } })
    await tx.pointsLedger.create({ data: { userId: me.id, delta: inviteePts, balanceAfter: inwNew, reason: 'REFERRAL_BONUS_INVITEE', meta: { inviterId: inviter.id } } })
  })

  return NextResponse.json({ ok: true })
}
