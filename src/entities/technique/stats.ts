import { collection, doc, getDoc, onSnapshot, runTransaction } from 'firebase/firestore'
import { getFirebaseAuth } from '@/shared/firebase'
import { create } from 'zustand'
import { getFirebaseDb } from '@/shared/firebase'

export type StatsKind = 'skill' | 'card'

export type TechniqueStats = {
  ratingSum: number
  ratingCount: number
}

type StatsState = {
  byId: Record<string, TechniqueStats>
  setById: (byId: Record<string, TechniqueStats>) => void
}

function createStatsStore() {
  return create<StatsState>()((set) => ({
    byId: {},
    setById: (byId) => set({ byId }),
  }))
}

export const useTechniqueStatsStore = createStatsStore()
export const useDayCardStatsStore = createStatsStore()

export function statsStore(kind: StatsKind) {
  return kind === 'card' ? useDayCardStatsStore : useTechniqueStatsStore
}

function statsCollection(kind: StatsKind) {
  return kind === 'card' ? 'dayCardStats' : 'techniqueStats'
}

export function normalizeSkillRating(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return undefined
  const rounded = Math.round(n)
  if (rounded < 1 || rounded > 5) return undefined
  return rounded
}

export function averageRating(stats: TechniqueStats | undefined) {
  if (!stats || stats.ratingCount <= 0) return null
  return stats.ratingSum / stats.ratingCount
}

function listenStats(kind: StatsKind) {
  const db = getFirebaseDb()
  const store = statsStore(kind)
  const name = statsCollection(kind)
  if (!db) {
    store.getState().setById({})
    return () => {}
  }
  return onSnapshot(
    collection(db, name),
    (snap) => {
      const byId: Record<string, TechniqueStats> = {}
      for (const item of snap.docs) {
        const data = item.data()
        byId[item.id] = {
          ratingSum: Number(data.ratingSum ?? 0),
          ratingCount: Number(data.ratingCount ?? 0),
        }
      }
      store.getState().setById(byId)
    },
    (error) => {
      console.error(`[${name}] listen failed`, error)
    },
  )
}

export function listenTechniqueStats() {
  return listenStats('skill')
}

export function listenDayCardStats() {
  return listenStats('card')
}

export async function commitItemRating(
  kind: StatsKind,
  itemId: string,
  previous: number | undefined,
  next: number | undefined,
) {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')
  const auth = getFirebaseAuth()
  if (!auth?.currentUser) throw new Error('Sign in required to save ratings')

  let oldR = normalizeSkillRating(previous)
  const newR = normalizeSkillRating(next)
  if (newR == null && oldR == null) return

  const statsRef = doc(db, statsCollection(kind), itemId)

  if (oldR === newR && newR != null) {
    const pre = await getDoc(statsRef)
    const count = Number(pre.data()?.ratingCount ?? 0)
    if (pre.exists() && count > 0) return
    oldR = undefined
  } else if (oldR === newR) {
    return
  }
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(statsRef)
    let sum = Number(snap.data()?.ratingSum ?? 0)
    let count = Number(snap.data()?.ratingCount ?? 0)
    if (oldR) {
      sum -= oldR
      count -= 1
    }
    if (newR) {
      sum += newR
      count += 1
    }
    if (count < 0) count = 0
    if (sum < 0) sum = 0
    tx.set(
      statsRef,
      { ratingSum: sum, ratingCount: count, updatedAt: new Date().toISOString() },
      { merge: true },
    )
  })
}

export async function commitSkillRating(
  techniqueId: string,
  previous: number | undefined,
  next: number | undefined,
) {
  await commitItemRating('skill', techniqueId, previous, next)
}

/** Push a stored user rating into the aggregate doc when it is still empty. */
export async function backfillRatingStat(kind: StatsKind, itemId: string, rating: number) {
  const next = normalizeSkillRating(rating)
  if (!next) return
  const db = getFirebaseDb()
  if (!db) return
  if (!getFirebaseAuth()?.currentUser) return
  const pre = await getDoc(doc(db, statsCollection(kind), itemId))
  const count = Number(pre.data()?.ratingCount ?? 0)
  if (pre.exists() && count > 0) return
  try {
    await commitItemRating(kind, itemId, undefined, next)
  } catch (error) {
    console.error('[rating] backfill failed', error)
  }
}

export async function backfillSkillRatingStat(techniqueId: string, rating: number) {
  await backfillRatingStat('skill', techniqueId, rating)
}
