export type ScaleKind = 'mood' | 'anxiety' | 'sleep'

export const SCALE_MIN = 1
export const SCALE_MAX = 5
export const SCALE_DEFAULT = 3

export const scaleStepValues = [1, 2, 3, 4, 5] as const

const LEGACY_MAX = 10

function clampToScale(value: number) {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, value))
}

/** Legacy check-ins may hold 0–10 or 0–6. */
export function normalizeScaleValue(value: number) {
  const rounded = Math.round(value)
  if (!Number.isFinite(rounded)) return SCALE_DEFAULT
  if (rounded <= 0) return SCALE_MIN
  if (rounded <= SCALE_MAX) return clampToScale(rounded)
  if (rounded <= 6) {
    return clampToScale(Math.round((rounded / 6) * SCALE_MAX))
  }
  return clampToScale(Math.round((rounded / LEGACY_MAX) * SCALE_MAX))
}

/** 0 = low end of the tapped 1–5, 1 = high end. Anxiety 5 is flooded. */
export function scalePlotNorm(value: number) {
  const v = normalizeScaleValue(value)
  return (v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)
}

/** 1↔5, 2↔4, 3 stays. Used once when flipping anxiety from “high = calm”. */
export function invertScaleValue(value: number) {
  return SCALE_MAX + SCALE_MIN - normalizeScaleValue(value)
}

export function scaleWordKey(kind: ScaleKind, value: number) {
  const v = normalizeScaleValue(value)
  if (kind === 'mood') {
    if (v === 1) return 'scale.mood.awful'
    if (v === 2) return 'scale.mood.veryBad'
    if (v === 3) return 'scale.mood.ok'
    if (v === 4) return 'scale.mood.good'
    return 'scale.mood.super'
  }
  if (kind === 'anxiety') {
    if (v === 1) return 'scale.anxiety.calm'
    if (v === 2) return 'scale.anxiety.ok'
    if (v === 3) return 'scale.anxiety.tense'
    if (v === 4) return 'scale.anxiety.very'
    return 'scale.anxiety.flooded'
  }
  if (v === 1) return 'scale.sleep.none'
  if (v === 2) return 'scale.sleep.broken'
  if (v === 3) return 'scale.sleep.meh'
  if (v === 4) return 'scale.sleep.ok'
  return 'scale.sleep.rested'
}
