import { NextRequest, NextResponse } from 'next/server'

const launchAtStr = process.env.NEXT_PUBLIC_LAUNCH_AT || process.env.LAUNCH_AT
const defaultLaunch = Date.now() + 7 * 24 * 3600 * 1000
const launchAt = launchAtStr ? new Date(launchAtStr).getTime() : defaultLaunch

export function middleware(req: NextRequest) {
  const url = new URL(req.url)
  const path = url.pathname
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/favicon') ||
    path.startsWith('/static')
  ) {
    return NextResponse.next()
  }
  const isAdmin = false
  if (Date.now() < launchAt && !isAdmin && !path.startsWith('/launch')) {
    url.pathname = '/launch'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}


