import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// List proposals for a bounty (creator or admin only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_request: Request, { params }: any) {
  const user = await requireAuth()
  const bounty = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (bounty.creatorId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const list = await prisma.proposal.findMany({ where: { bountyId: bounty.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(list)
}

// Create a proposal by hunter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(request: Request, { params }: any) {
  const user = await requireAuth()
  const bounty = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (bounty.creatorId === user.id) return NextResponse.json({ error: 'Creator cannot propose' }, { status: 400 })
  if (bounty.reviewStatus !== 'APPROVED' || bounty.status !== 'OPEN') {
    return NextResponse.json({ error: 'Bounty not open' }, { status: 400 })
  }
  let proposedFee: number
  let message: string
  const ct = request.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const body = await request.json()
    proposedFee = Number(body.proposedFee ?? bounty.budgetMax)
    message = String(body.message ?? '')
  } else {
    const fd = await request.formData()
    proposedFee = Number((fd.get('proposedFee') as string) ?? bounty.budgetMax)
    message = String((fd.get('message') as string) ?? '')
  }
  const p = await prisma.proposal.create({
    data: { bountyId: bounty.id, hunterId: user.id, message, proposedFee, status: 'PENDING' },
  })
  return NextResponse.json(p)
}


