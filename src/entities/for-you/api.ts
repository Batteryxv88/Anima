import { collection, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { create } from 'zustand'
import { createId, translateFromRu } from '@/shared/lib'
import { getFirebaseDb } from '@/shared/firebase'
import { defaultForYouSeed } from './seed'
import {
  emptyForYouArticle,
  emptyForYouGroup,
  emptyForYouLocalized,
  type ForYouArticle,
  type ForYouGroup,
  type ForYouLocalized,
} from './model'

type CloudGroup = ForYouGroup & { deleted?: boolean; updatedAt?: string }
type CloudArticle = ForYouArticle & { deleted?: boolean; updatedAt?: string }

export const useForYouStore = create<{
  groups: ForYouGroup[]
  articles: ForYouArticle[]
  setGroups: (groups: ForYouGroup[]) => void
  setArticles: (articles: ForYouArticle[]) => void
}>()((set) => ({
  groups: [],
  articles: [],
  setGroups: (groups) => set({ groups }),
  setArticles: (articles) => set({ articles }),
}))

function asLocalized(raw: unknown): ForYouLocalized {
  if (typeof raw === 'string') return { ru: raw, en: raw, sl: raw }
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    ru: String(value.ru ?? ''),
    en: String(value.en ?? ''),
    sl: String(value.sl ?? ''),
  }
}

function asGroup(id: string, data: Record<string, unknown>): CloudGroup | null {
  if (data.deleted === true) return null
  return {
    id,
    title: asLocalized(data.title),
    order: Number(data.order ?? 0),
  }
}

function asArticle(id: string, data: Record<string, unknown>): CloudArticle | null {
  if (data.deleted === true) return null
  const groupId = String(data.groupId ?? '')
  if (!groupId) return null
  return {
    id,
    groupId,
    title: asLocalized(data.title),
    teaser: asLocalized(data.teaser),
    body: asLocalized(data.body),
    order: Number(data.order ?? 0),
    active: data.active !== false,
  }
}

export function listenForYouGroups() {
  const db = getFirebaseDb()
  if (!db) {
    useForYouStore.getState().setGroups([])
    return () => {}
  }
  return onSnapshot(collection(db, 'forYouGroups'), (snap) => {
    const groups = snap.docs
      .map((item) => asGroup(item.id, item.data() as Record<string, unknown>))
      .filter((item): item is ForYouGroup => item !== null)
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    useForYouStore.getState().setGroups(groups)
  })
}

export function listenForYouArticles() {
  const db = getFirebaseDb()
  if (!db) {
    useForYouStore.getState().setArticles([])
    return () => {}
  }
  return onSnapshot(collection(db, 'forYouArticles'), (snap) => {
    const articles = snap.docs
      .map((item) => asArticle(item.id, item.data() as Record<string, unknown>))
      .filter((item): item is ForYouArticle => item !== null)
    useForYouStore.getState().setArticles(articles)
  })
}

export function listenForYou() {
  const stopGroups = listenForYouGroups()
  const stopArticles = listenForYouArticles()
  return () => {
    stopGroups()
    stopArticles()
  }
}

export async function saveForYouGroup(group: ForYouGroup) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const id = group.id.trim() || createId()
  await setDoc(doc(db, 'forYouGroups', id), {
    title: group.title,
    order: group.order,
    updatedAt: new Date().toISOString(),
  })
  return id
}

export async function deleteForYouGroup(groupId: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const articles = useForYouStore.getState().articles.filter((a) => a.groupId === groupId)
  const batch = writeBatch(db)
  batch.set(
    doc(db, 'forYouGroups', groupId),
    { deleted: true, updatedAt: new Date().toISOString() },
    { merge: true },
  )
  for (const article of articles) {
    batch.set(
      doc(db, 'forYouArticles', article.id),
      { deleted: true, updatedAt: new Date().toISOString() },
      { merge: true },
    )
  }
  await batch.commit()
}

export async function saveForYouArticle(article: ForYouArticle) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const id = article.id.trim() || createId()
  await setDoc(doc(db, 'forYouArticles', id), {
    groupId: article.groupId,
    title: article.title,
    teaser: article.teaser,
    body: article.body,
    order: article.order,
    active: article.active,
    updatedAt: new Date().toISOString(),
  })
  return id
}

export async function deleteForYouArticle(articleId: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  await setDoc(
    doc(db, 'forYouArticles', articleId),
    { deleted: true, updatedAt: new Date().toISOString() },
    { merge: true },
  )
}

async function translateBlock(ru: string, locale: 'en' | 'sl') {
  const trimmed = ru.trim()
  if (!trimmed) return ''
  return translateFromRu(trimmed, locale)
}

export async function fillForYouTranslations(article: ForYouArticle): Promise<ForYouArticle> {
  try {
    const next = { ...article, title: { ...article.title }, teaser: { ...article.teaser }, body: { ...article.body } }
    for (const locale of ['en', 'sl'] as const) {
      next.title[locale] = await translateBlock(next.title.ru, locale)
      next.teaser[locale] = await translateBlock(next.teaser.ru, locale)
      next.body[locale] = await translateBlock(next.body.ru, locale)
    }
    return next
  } catch {
    return article
  }
}

export async function fillForYouGroupTranslations(group: ForYouGroup): Promise<ForYouGroup> {
  try {
    const title = { ...group.title }
    for (const locale of ['en', 'sl'] as const) {
      title[locale] = await translateBlock(title.ru, locale)
    }
    return { ...group, title }
  } catch {
    return group
  }
}

export async function seedDefaultForYouContent() {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const { groups, articles } = defaultForYouSeed()
  const stamp = new Date().toISOString()
  const groupBatch = writeBatch(db)
  for (const group of groups) {
    groupBatch.set(doc(db, 'forYouGroups', group.id), {
      title: group.title,
      order: group.order,
      updatedAt: stamp,
    })
  }
  await groupBatch.commit()

  const articleBatch = writeBatch(db)
  for (const article of articles) {
    articleBatch.set(doc(db, 'forYouArticles', article.id), {
      groupId: article.groupId,
      title: article.title,
      teaser: article.teaser,
      body: article.body,
      order: article.order,
      active: article.active,
      updatedAt: stamp,
    })
  }
  await articleBatch.commit()
}

export { emptyForYouArticle, emptyForYouGroup, emptyForYouLocalized }

export function getForYouGroup(id: string) {
  return useForYouStore.getState().groups.find((g) => g.id === id)
}

export function getForYouArticle(id: string) {
  return useForYouStore.getState().articles.find((a) => a.id === id)
}
