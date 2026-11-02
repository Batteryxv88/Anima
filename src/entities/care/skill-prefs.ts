import { commitSkillRating, normalizeSkillRating } from '@/entities/technique/stats'
import { useCareStore } from './model'

export function setSkillLike(techniqueId: string, liked: boolean) {
  useCareStore.getState().setSkillLike(techniqueId, liked)
}

export async function setSkillRating(techniqueId: string, rating: number) {
  const prev = normalizeSkillRating(useCareStore.getState().skillPrefs[techniqueId]?.rating)
  const next = normalizeSkillRating(rating)
  if (next == null) return
  useCareStore.getState().setSkillRating(techniqueId, next)
  try {
    await commitSkillRating(techniqueId, prev, next)
  } catch (error) {
    console.error('[skillRating] techniqueStats update failed', error)
  }
}

export function isSkillLiked(techniqueId: string) {
  return Boolean(useCareStore.getState().skillPrefs[techniqueId]?.liked)
}

export function skillRating(techniqueId: string) {
  return normalizeSkillRating(useCareStore.getState().skillPrefs[techniqueId]?.rating)
}
