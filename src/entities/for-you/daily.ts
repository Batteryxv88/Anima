import { todayId } from '@/shared/lib'
import type { ForYouArticle, ForYouGroup } from './model'

function stableHash(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function activeForYouArticles(articles: ForYouArticle[], groups: ForYouGroup[]) {
  const liveGroups = new Set(groups.map((g) => g.id))
  return articles
    .filter((a) => a.active && liveGroups.has(a.groupId))
    .sort((a, b) => {
      const g = a.groupId.localeCompare(b.groupId)
      if (g !== 0) return g
      if (a.order !== b.order) return a.order - b.order
      return a.id.localeCompare(b.id)
    })
}

export function pickDailyForYouArticle(
  articles: ForYouArticle[],
  groups: ForYouGroup[],
  date = new Date(),
): ForYouArticle | null {
  const pool = activeForYouArticles(articles, groups)
  if (pool.length === 0) return null
  const index = stableHash(todayId(date)) % pool.length
  return pool[index] ?? null
}
