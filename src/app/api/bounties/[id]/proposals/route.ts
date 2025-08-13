import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'

// List proposals for a bounty (creator or admin only)
export async function GET(_request: Request, { params }: { params: { id: string } }) {
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
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAuth()
  const bounty = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!bounty) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (bounty.creatorId === user.id) return NextResponse.json({ error: 'Creator cannot propose' }, { status: 400 })
  if (bounty.reviewStatus !== 'APPROVED' || bounty.status !== 'OPEN') {
    return NextResponse.json({ error: 'Bounty not open' }, { status: 400 })
  }
  const body = await request.json()
  const proposedFee = Number(body.proposedFee ?? bounty.budgetMax)
  const message = String(body.message ?? '')
  const p = await prisma.proposal.create({
    data: { bountyId: bounty.id, hunterId: user.id, message, proposedFee, status: 'PENDING' },
  })
  return NextResponse.json(p)
}


