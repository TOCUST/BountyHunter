import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: Request) {
  const u = await requireAuth()
  const body = await request.json()
  const lat = Number(body.lat)
  const lng = Number(body.lng)
  if (!isFinite(lat) || !isFinite(lng)) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  await prisma.user.update({ where: { id: u.id }, data: { lastLat: lat, lastLng: lng, lastGeoHash: null, lastLocatedAt: new Date() } })
  return NextResponse.json({ ok: true })
}


