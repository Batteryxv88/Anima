import { commitSkillRating, normalizeSkillRating } from '@/entities/technique/stats'
import { isSignedIn } from '@/shared/lib'
import { useCareStore } from './model'

export function setSkillLike(techniqueId: string, liked: boolean) {
  if (!isSignedIn()) return false
  useCareStore.getState().setSkillLike(techniqueId, liked)
  return true
}

export async function setSkillRating(techniqueId: string, rating: number) {
  if (!isSignedIn()) return false
  const prev = normalizeSkillRating(useCareStore.getState().skillPrefs[techniqueId]?.rating)
  const next = normalizeSkillRating(rating)
  if (next == null) return false
  useCareStore.getState().setSkillRating(techniqueId, next)
  try {
    await commitSkillRating(techniqueId, prev, next)
  } catch (error) {
    console.error('[skillRating] techniqueStats update failed', error)
  }
  return true
}

export function isSkillLiked(techniqueId: string) {
  return Boolean(useCareStore.getState().skillPrefs[techniqueId]?.liked)
}

export function skillRating(techniqueId: string) {
  return normalizeSkillRating(useCareStore.getState().skillPrefs[techniqueId]?.rating)
}
