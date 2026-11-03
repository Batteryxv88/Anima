import type { Locale } from '@/shared/config'

export type ForYouLocalized = Record<Locale, string>

export type ForYouGroup = {
  id: string
  title: ForYouLocalized
  order: number
}

export type ForYouArticle = {
  id: string
  groupId: string
  title: ForYouLocalized
  teaser: ForYouLocalized
  body: ForYouLocalized
  order: number
  active: boolean
}

export function emptyForYouLocalized(): ForYouLocalized {
  return { ru: '', en: '', sl: '' }
}

export function forYouText(block: ForYouLocalized, locale: Locale): string {
  const value = block[locale]?.trim()
  if (value) return value
  return block.ru.trim()
}

export function emptyForYouGroup(order = 0): ForYouGroup {
  return { id: '', title: emptyForYouLocalized(), order }
}

export function emptyForYouArticle(groupId: string, order = 0): ForYouArticle {
  return {
    id: '',
    groupId,
    title: emptyForYouLocalized(),
    teaser: emptyForYouLocalized(),
    body: emptyForYouLocalized(),
    order,
    active: true,
  }
}
