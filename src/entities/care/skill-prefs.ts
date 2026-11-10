import { commitItemRating, normalizeSkillRating, type StatsKind } from '@/entities/technique/stats'
import { isSignedIn } from '@/shared/lib'
import { useUserStore } from '@/entities/user'
import { pushCare } from './api'
import { useCareStore } from './model'

function prefsOf(kind: StatsKind) {
  const state = useCareStore.getState()
  return kind === 'card' ? state.cardPrefs : state.skillPrefs
}

async function flushCare() {
  const uid = useUserStore.getState().uid
  if (!uid) return
  await pushCare(uid)
}

export function setSkillLike(techniqueId: string, liked: boolean) {
  if (!isSignedIn()) return false
  useCareStore.getState().setSkillLike(techniqueId, liked)
  return true
}

export async function setCardLike(cardId: string, liked: boolean) {
  if (!isSignedIn()) return false
  useCareStore.getState().setCardLike(cardId, liked)
  await flushCare()
  return true
}

async function setItemRating(kind: StatsKind, itemId: string, rating: number) {
  if (!isSignedIn()) return false
  const prev = normalizeSkillRating(prefsOf(kind)[itemId]?.rating)
  const next = normalizeSkillRating(rating)
  if (next == null) return false
  if (kind === 'card') useCareStore.getState().setCardRating(itemId, next)
  else useCareStore.getState().setSkillRating(itemId, next)
  try {
    await commitItemRating(kind, itemId, prev, next)
  } catch (error) {
    console.error(`[${kind}Rating] stats update failed`, error)
  }
  if (kind === 'card') await flushCare()
  return true
}

export async function setSkillRating(techniqueId: string, rating: number) {
  return setItemRating('skill', techniqueId, rating)
}

export async function setCardRating(cardId: string, rating: number) {
  return setItemRating('card', cardId, rating)
}

export function isSkillLiked(techniqueId: string) {
  return Boolean(useCareStore.getState().skillPrefs[techniqueId]?.liked)
}

export function skillRating(techniqueId: string) {
  return normalizeSkillRating(useCareStore.getState().skillPrefs[techniqueId]?.rating)
}
