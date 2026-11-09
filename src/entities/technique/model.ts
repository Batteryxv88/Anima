import type { Locale } from '@/shared/config'

export const schools = ['cbt', 'dbt', 'act', 'cft', 'mindfulness', 'behavioral'] as const
export type School = (typeof schools)[number]

/** Moments for skill catalog filters (order matches product copy). */
export const catalogSituations = [
  'anxiety',
  'panic',
  'rumination',
  'anger',
  'shame',
  'insomnia',
  'conflict',
  'urge',
  'numb',
] as const
export type CatalogSituation = (typeof catalogSituations)[number]

export const situations = [...catalogSituations, 'crisis'] as const
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
  hint?: Record<Locale, string>
  options?: Record<Locale, string[]>
}

export type TechniqueSkill = {
  id: string
  kind: FieldKind
  title: Record<Locale, string>
  hint: Record<Locale, string>
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
  skills: TechniqueSkill[]
}

export type FieldAnswers = Record<string, string>

export function emptyLocalized(): Record<Locale, string> {
  return { ru: '', en: '', sl: '' }
}

export function techniqueCopy(technique: Technique, locale: Locale) {
  return technique.copy[locale] ?? technique.copy.ru
}

export function skillTitle(skill: TechniqueSkill, locale: Locale) {
  return skill.title[locale]?.trim() || skill.title.ru
}

export function skillHint(skill: TechniqueSkill, locale: Locale) {
  return skill.hint[locale]?.trim() || skill.hint.ru
}

export function innerSkills(technique: Technique) {
  return technique.skills ?? []
}

export function findInnerSkill(technique: Technique, stored: string) {
  const skills = innerSkills(technique)
  const needle = stored.trim()
  if (!needle) return undefined
  const byId = skills.find((skill) => skill.id === needle)
  if (byId) return byId
  if (!/^\d+$/.test(needle)) return undefined
  const index = Number(needle)
  return skills.find((skill) => skill.id === `copy-skill-${index}`) ?? skills[index]
}

export function skillAsField(skill: TechniqueSkill): TechniqueField {
  return { id: skill.id, kind: skill.kind, label: skill.title, hint: skill.hint, options: skill.options }
}

export function techniqueMatchesSearch(
  technique: Technique,
  locale: Locale,
  query: string,
  meta: { school: string; situations: string[] },
) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const copy = techniqueCopy(technique, locale)
  const skillText = (technique.skills ?? []).flatMap((skill) => [skill.title.ru, skill.hint.ru])
  const fieldText = technique.fields.flatMap((field) => [field.label.ru, field.hint?.ru ?? ''])
  const haystack = [copy.title, copy.when, copy.about, ...skillText, ...fieldText, meta.school, ...meta.situations]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

export function fieldLabel(field: TechniqueField, locale: Locale) {
  return field.label[locale] || field.label.ru
}

export function fieldHint(field: TechniqueField, locale: Locale) {
  if (!field.hint) return ''
  return field.hint[locale]?.trim() || field.hint.ru
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
  const fromField = (field: TechniqueField) => {
    const raw = answers[field.id]?.trim()
    if (!raw) return []
    const value = field.kind === 'choice' ? choiceAnswerDisplay(field, raw, locale) : raw
    return [{ id: field.id, label: fieldLabel(field, locale), value }]
  }
  return [
    ...(technique.skills ?? []).flatMap((skill) => fromField(skillAsField(skill))),
    ...technique.fields.flatMap(fromField),
  ]
}
