export type ScaleKind = 'mood' | 'anxiety' | 'sleep'

export function scaleWordKey(kind: ScaleKind, value: number) {
  const v = Math.min(10, Math.max(0, Math.round(value)))
  if (kind === 'mood') {
    if (v <= 1) return 'scale.mood.awful'
    if (v <= 3) return 'scale.mood.veryBad'
    if (v <= 5) return 'scale.mood.meh'
    if (v <= 7) return 'scale.mood.ok'
    if (v <= 9) return 'scale.mood.good'
    return 'scale.mood.super'
  }
  if (kind === 'anxiety') {
    if (v <= 1) return 'scale.anxiety.flooded'
    if (v <= 3) return 'scale.anxiety.very'
    if (v <= 5) return 'scale.anxiety.tense'
    if (v <= 7) return 'scale.anxiety.ok'
    return 'scale.anxiety.calm'
  }
  if (v <= 1) return 'scale.sleep.none'
  if (v <= 3) return 'scale.sleep.broken'
  if (v <= 5) return 'scale.sleep.meh'
  if (v <= 7) return 'scale.sleep.ok'
  return 'scale.sleep.rested'
}
