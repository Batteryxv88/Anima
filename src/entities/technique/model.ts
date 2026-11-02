import type { Locale } from '@/shared/config'

export const schools = ['cbt', 'dbt', 'act', 'cft', 'mindfulness', 'behavioral'] as const
export type School = (typeof schools)[number]

export const situations = [
  'panic',
  'rumination',
  'anger',
  'shame',
  'insomnia',
  'conflict',
  'urge',
  'numb',
  'crisis',
] as const
export type Situation = (typeof situations)[number]

export const fieldKinds = ['text', 'textarea', 'scale', 'choice'] as const
export type FieldKind = (typeof fieldKinds)[number]

export type TechniqueCopy = {
  title: string
  about: string
  when: string
  steps: string[]
}

export type TechniqueField = {
  id: string
  kind: FieldKind
  label: Record<Locale, string>
  options?: Record<Locale, string[]>
}

export type Technique = {
  id: string
  school: School
  situations: Situation[]
  durationMin: number
  coverUrl?: string
  copy: Record<Locale, TechniqueCopy>
  fields: TechniqueField[]
}

export type FieldAnswers = Record<string, string>

export function emptyLocalized(): Record<Locale, string> {
  return { ru: '', en: '', sl: '' }
}

export function techniqueCopy(technique: Technique, locale: Locale) {
  return technique.copy[locale] ?? technique.copy.ru
}

export function fieldLabel(field: TechniqueField, locale: Locale) {
  return field.label[locale] || field.label.ru
}

export function fieldOptions(field: TechniqueField, locale: Locale) {
  return field.options?.[locale] ?? field.options?.ru ?? []
}

export function choiceLabel(field: TechniqueField, value: string, locale: Locale) {
  const ruOptions = field.options?.ru ?? []
  const index = ruOptions.indexOf(value)
  if (index < 0) return value
  return fieldOptions(field, locale)[index] ?? value
}

export function parseChoiceValues(raw: string): string[] {
  if (!raw.trim()) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed.filter((item) => item.trim())
    }
  } catch {
    /* legacy single value */
  }
  return [raw]
}

export function serializeChoiceValues(selected: string[]): string {
  if (selected.length === 0) return ''
  return JSON.stringify(selected)
}

export function choiceAnswerDisplay(field: TechniqueField, raw: string, locale: Locale) {
  return parseChoiceValues(raw)
    .map((item) => choiceLabel(field, item, locale))
    .join(', ')
}

export function filledAnswers(technique: Technique, answers: FieldAnswers | undefined, locale: Locale) {
  if (!answers) return []
  return technique.fields.flatMap((field) => {
    const raw = answers[field.id]?.trim()
    if (!raw) return []
    const value = field.kind === 'choice' ? choiceAnswerDisplay(field, raw, locale) : raw
    return [{ id: field.id, label: fieldLabel(field, locale), value }]
  })
}
