import { prisma } from './prisma'

export function normalizeForModeration(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\s\p{P}\p{S}]+/gu, '')
    .replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0) - 0xFF10 + 0x30))
    .replace(/[ａ-ｚ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFF41 + 0x61))
}

export async function runAutoModeration(texts: string[], locale?: string) {
  const source = normalizeForModeration(texts.join(' '))
  const rules = await prisma.moderationRule.findMany({ where: { OR: [{ locale }, { locale: null }] } })
  const hits: { ruleId: string; type: 'BLOCK' | 'REVIEW'; excerpt: string }[] = []
  let score = 0
  for (const r of rules) {
    const matched = r.isRegex
      ? new RegExp(r.pattern, 'iu').test(source)
      : source.includes(normalizeForModeration(r.pattern))
    if (matched) {
      hits.push({ ruleId: r.id, type: r.type as any, excerpt: r.pattern })
      if (r.type !== 'ALLOW') score += r.score
    }
  }
  return { hits, score }
}
