import { collection, doc, getDoc, onSnapshot, runTransaction } from 'firebase/firestore'
import { getFirebaseAuth } from '@/shared/firebase'
import { create } from 'zustand'
import { getFirebaseDb } from '@/shared/firebase'

export type TechniqueStats = {
  ratingSum: number
  ratingCount: number
}

type StatsState = {
  byId: Record<string, TechniqueStats>
  setById: (byId: Record<string, TechniqueStats>) => void
}

export const useTechniqueStatsStore = create<StatsState>()((set) => ({
  byId: {},
  setById: (byId) => set({ byId }),
}))

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

export function listenTechniqueStats() {
  const db = getFirebaseDb()
  if (!db) {
    useTechniqueStatsStore.getState().setById({})
    return () => {}
  }
  return onSnapshot(
    collection(db, 'techniqueStats'),
    (snap) => {
      const byId: Record<string, TechniqueStats> = {}
      for (const item of snap.docs) {
        const data = item.data()
        byId[item.id] = {
          ratingSum: Number(data.ratingSum ?? 0),
          ratingCount: Number(data.ratingCount ?? 0),
        }
      }
      useTechniqueStatsStore.getState().setById(byId)
    },
    (error) => {
      console.error('[techniqueStats] listen failed', error)
    },
  )
}

export async function commitSkillRating(
  techniqueId: string,
  previous: number | undefined,
  next: number | undefined,
) {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firebase not configured')
  const auth = getFirebaseAuth()
  if (!auth?.currentUser) throw new Error('Sign in required to save skill ratings')

  let oldR = normalizeSkillRating(previous)
  const newR = normalizeSkillRating(next)
  if (newR == null && oldR == null) return

  const statsRef = doc(db, 'techniqueStats', techniqueId)

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

/** Push a stored user rating into techniqueStats when the aggregate doc is still empty. */
export async function backfillSkillRatingStat(techniqueId: string, rating: number) {
  const next = normalizeSkillRating(rating)
  if (!next) return
  const db = getFirebaseDb()
  if (!db) return
  if (!getFirebaseAuth()?.currentUser) return
  const pre = await getDoc(doc(db, 'techniqueStats', techniqueId))
  const count = Number(pre.data()?.ratingCount ?? 0)
  if (pre.exists() && count > 0) return
  try {
    await commitSkillRating(techniqueId, undefined, next)
  } catch (error) {
    console.error('[skillRating] backfill failed', error)
  }
}
