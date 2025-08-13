import { NextResponse } from 'next/server'

export async function GET() {
  const v = process.env.NEXT_PUBLIC_LAUNCH_AT || process.env.LAUNCH_AT
  const iso = v ? new Date(v).toISOString() : new Date(Date.now() + 7*24*3600*1000).toISOString()
  return NextResponse.json({ launchAt: iso })
}


