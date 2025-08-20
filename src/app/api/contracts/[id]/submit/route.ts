import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { notifyWorkSubmitted } from '@/lib/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: Request, { params }: any) {
  const u = await requireAuth()
  const c = await prisma.contract.findUnique({ where: { id: params.id } })
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (c.hunterId !== u.id && u.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(()=>({ message: '', attachments: [] as string[] }))
  const sub = await prisma.submission.create({ data: { contractId: c.id, message: body.message ?? '', attachments: body.attachments ?? [] } })
  await prisma.contract.update({ where: { id: c.id }, data: { status: 'SUBMITTED' } })
  
  // Get bounty info to find creator for notification
  const bounty = await prisma.bounty.findUnique({ where: { id: c.bountyId } })
  if (bounty) {
    await notifyWorkSubmitted(bounty.creatorId, c.id)
  }
  
  return NextResponse.json(sub)
}


