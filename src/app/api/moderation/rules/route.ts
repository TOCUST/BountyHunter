import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const list = await prisma.moderationRule.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  const body = await req.json()
  const rule = await prisma.moderationRule.create({ data: {
    type: body.type,
    pattern: body.pattern,
    isRegex: !!body.isRegex,
    locale: body.locale ?? null,
    severity: body.severity ?? 1,
    score: body.score ?? 10,
    tags: body.tags ?? null,
    createdBy: admin.id,
  } })
  return NextResponse.json(rule)
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const list = await prisma.moderationRule.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  const body = await req.json()
  const rule = await prisma.moderationRule.create({ data: {
    type: body.type,
    pattern: body.pattern,
    isRegex: !!body.isRegex,
    locale: body.locale ?? null,
    severity: body.severity ?? 1,
    score: body.score ?? 10,
    tags: body.tags ?? null,
    createdBy: admin.id,
  } })
  return NextResponse.json(rule)
}
