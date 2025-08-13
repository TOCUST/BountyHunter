import { headers, cookies } from 'next/headers'
import { prisma } from './prisma'

export type AuthedUser = { id: string; role: 'MEMBER' | 'ADMIN' }

export async function requireAuth(): Promise<AuthedUser> {
  const h = await headers()
  const c = await cookies()
  const cookieUserId = c.get('dev_user_id')?.value || ''
  const cookieRole = (c.get('dev_user_role')?.value as AuthedUser['role']) || 'MEMBER'
  const headerUserId = h.get('x-user-id') || ''
  const headerRole = (h.get('x-user-role') || 'MEMBER') as AuthedUser['role']

  if (cookieUserId) {
    const u = await prisma.user.findUnique({ where: { id: cookieUserId } })
    if (u) return { id: u.id, role: (c.get('dev_user_role')?.value as AuthedUser['role']) || (u.role as AuthedUser['role']) }
  }
  if (headerUserId) return { id: headerUserId, role: headerRole }
  if (process.env.DEV_AUTOPROVISION === 'true') {
    const u = await prisma.user.create({
      data: { email: `dev-${Date.now()}@example.com`, name: 'Dev', role: cookieRole, referralCode: (globalThis.crypto?.randomUUID?.() || 'refcode').slice(0,8) },
    })
    return { id: u.id, role: cookieRole }
  }
  throw new Response('Unauthorized', { status: 401 })
}

export async function requireAdmin(): Promise<AuthedUser> {
  const u = await requireAuth()
  if (u.role !== 'ADMIN') throw new Response('Forbidden', { status: 403 })
  return u
}
