import { prisma } from '@/lib/prisma'

export async function getOrCreatePlatformSettings() {
  let s = await prisma.platformSettings.findUnique({ where: { id: 1 } })
  if (!s) {
    s = await prisma.platformSettings.create({ data: {
      id: 1,
      launchAt: new Date(Date.now() + 7*24*3600*1000),
    }})
  }
  return s
}

export async function isPlatformFeeActive(now: Date = new Date()) {
  const s = await getOrCreatePlatformSettings()
  if (s.platformFeeManualOverride) return s.platformFeeActiveOverride
  if (s.platformFeeActiveFrom) return true
  const users = await prisma.user.count()
  if (users >= s.platformFeeEnableAtUserCount) {
    await prisma.platformSettings.update({
      where: { id: 1 },
      data: { platformFeeActiveFrom: now },
    })
    return true
  }
  return false
}
