import { headers } from 'next/headers'
import { prisma } from './prisma'

export type AuthedUser = { id: string; role: 'MEMBER' | 'ADMIN' }

export async function requireAuth(): Promise<AuthedUser> {
  const h = await headers()
  const userId = h.get('x-user-id') || ''
  const role = (h.get('x-user-role') || 'MEMBER') as AuthedUser['role']
  if (userId) return { id: userId, role }
  if (process.env.DEV_AUTOPROVISION === 'true') {
    const u = await prisma.user.upsert({
      where: { email: 'dev@example.com' },
      update: {},
      create: { email: 'dev@example.com', name: 'Dev', role: 'ADMIN', referralCode: (globalThis.crypto?.randomUUID?.() || 'refcode').slice(0,8) },
    })
    return { id: u.id, role: u.role as AuthedUser['role'] }
  }
  throw new Response('Unauthorized', { status: 401 })
}

export async function requireAdmin(): Promise<AuthedUser> {
  const u = await requireAuth()
  if (u.role !== 'ADMIN') throw new Response('Forbidden', { status: 403 })
  return u
}

import { headers } from 'next/headers'
import { prisma } from './prisma'

export type AuthedUser = { id: string; role: 'MEMBER' | 'ADMIN' }

export async function requireAuth(): Promise<AuthedUser> {
  const h = await headers()
  const userId = h.get('x-user-id') || ''
  const role = (h.get('x-user-role') || 'MEMBER') as AuthedUser['role']
  if (userId) return { id: userId, role }
  if (process.env.DEV_AUTOPROVISION === 'true') {
    const u = await prisma.user.upsert({
      where: { email: 'dev@example.com' },
      update: {},
      create: { email: 'dev@example.com', name: 'Dev', role: 'ADMIN', referralCode: (globalThis.crypto?.randomUUID?.() || 'refcode').slice(0,8) },
    })
    return { id: u.id, role: u.role as AuthedUser['role'] }
  }
  throw new Response('Unauthorized', { status: 401 })
}

export async function requireAdmin(): Promise<AuthedUser> {
  const u = await requireAuth()
  if (u.role !== 'ADMIN') throw new Response('Forbidden', { status: 403 })
  return u
}
