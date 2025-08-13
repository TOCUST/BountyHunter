import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_request: Request, { params }: any) {
  const user = await requireAuth().catch(()=>null)
  const b = await prisma.bounty.findUnique({ where: { id: params.id } })
  if (!b) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const isOwner = user && user.id === b.creatorId
  const isAdmin = user && user.role === 'ADMIN'
  if (!isOwner && !isAdmin && b.reviewStatus !== 'APPROVED') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(b)
}


