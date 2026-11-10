import { locales, type Locale } from '@/shared/config'
import { todayId } from '@/shared/lib'

export const schools = ['cbt', 'dbt', 'act', 'cft', 'mindfulness', 'behavioral'] as const
export type School = (typeof schools)[number]

export const dayCardCadences = ['daily', 'episode'] as const
export type DayCardCadence = (typeof dayCardCadences)[number]

export const dayCardSectionKinds = ['fields', 'repeater'] as const
export type DayCardSectionKind = (typeof dayCardSectionKinds)[number]

export const dayCardFieldKinds = ['text', 'textarea', 'scale', 'choice', 'skill', 'skillStep'] as const
export type DayCardFieldKind = (typeof dayCardFieldKinds)[number]
export const dayCardStaffFieldKinds = ['text', 'textarea', 'scale', 'choice', 'skill'] as const

export function innerSkillKey(fieldId: string) {
  return `${fieldId}:skill`
}

export function innerSkillValueKey(fieldId: string) {
  return `${fieldId}:skill:value`
}

export type DayCardLocalized = Record<Locale, string>

export type DayCardCopy = {
  title: string
  about: string
}

export type DayCardField = {
  id: string
  kind: DayCardFieldKind
  label: DayCardLocalized
  example?: DayCardLocalized
  techniqueIds?: string[]
  sourceFieldId?: string
  min?: number
  max?: number
  options?: Record<Locale, string[]>
  spotlight?: boolean
  revealWhen?: 'repeaterEmpty'
}

export type DayCardSection = {
  id: string
  kind: DayCardSectionKind
  title: DayCardLocalized
  hint: DayCardLocalized
  fields: DayCardField[]
}

export type DayCard = {
  id: string
  school: School
  cadence: DayCardCadence
  active: boolean
  order: number
  techniqueIds: string[]
  copy: Record<Locale, DayCardCopy>
  sections: DayCardSection[]
}

export type DayCardRow = {
  id: string
  practiceId?: string
  values: Record<string, string>
}

export type DayCardSectionAnswers = {
  values: Record<string, string>
  rows: DayCardRow[]
}

export type DayCardEntry = {
  id: string
  dayCardId: string
  date: string
  answers: Record<string, DayCardSectionAnswers>
  createdAt: string
  updatedAt: string
}

export function emptyLocalized(): DayCardLocalized {
  return { ru: '', en: '', sl: '' }
}

export function dayCardText(block: DayCardLocalized, locale: Locale) {
  const value = block[locale]?.trim()
  if (value) return value
  return block.ru.trim()
}

export function dayCardCopy(card: DayCard, locale: Locale): DayCardCopy {
  const copy = card.copy[locale]
  if (copy?.title.trim()) return copy
  return card.copy.ru
}

export function fieldLabel(field: DayCardField, locale: Locale) {
  return dayCardText(field.label, locale)
}

export function fieldExample(field: DayCardField, locale: Locale) {
  if (!field.example) return ''
  return dayCardText(field.example, locale)
}

export function fieldOptions(field: DayCardField, locale: Locale) {
  return field.options?.[locale]?.filter((item) => item.trim()) ?? field.options?.ru ?? []
}

export function emptySectionAnswers(): DayCardSectionAnswers {
  return { values: {}, rows: [] }
}

export function emptyDayCardField(kind: DayCardFieldKind = 'textarea'): DayCardField {
  return {
    id: '',
    kind,
    label: emptyLocalized(),
    ...(kind === 'scale' ? { min: 0, max: 10 } : {}),
    ...(kind === 'choice' ? { options: { ru: [''], en: [], sl: [] } } : {}),
  }
}

export function emptyDayCardSection(kind: DayCardSectionKind = 'fields'): DayCardSection {
  return {
    id: '',
    kind,
    title: emptyLocalized(),
    hint: emptyLocalized(),
    fields: [],
  }
}

export function emptyDayCard(order = 0): DayCard {
  const copy = {} as Record<Locale, DayCardCopy>
  for (const locale of locales) {
    copy[locale] = { title: '', about: '' }
  }
  return {
    id: '',
    school: 'dbt',
    cadence: 'daily',
    active: false,
    order,
    techniqueIds: [],
    copy,
    sections: [],
  }
}

export function activeDayCards(cards: DayCard[]) {
  return cards
    .filter((item) => item.active && item.techniqueIds.length > 0)
    .slice()
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}

export function lastUsedAt(card: DayCard, entries: DayCardEntry[]) {
  let at = ''
  for (const entry of entries) {
    if (entry.dayCardId !== card.id || !entryHasContent(card, entry)) continue
    const stamp = entry.updatedAt || entry.date
    if (stamp.localeCompare(at) > 0) at = stamp
  }
  return at
}

export function latestDayCardEntry(card: DayCard, entries: DayCardEntry[]) {
  let best: DayCardEntry | undefined
  for (const entry of entries) {
    if (entry.dayCardId !== card.id || !entryHasContent(card, entry)) continue
    const stamp = entry.updatedAt || entry.date
    const bestStamp = best ? best.updatedAt || best.date : ''
    if (!best || stamp.localeCompare(bestStamp) > 0) best = entry
  }
  return best
}

export function sortDayCardsByUse(cards: DayCard[], entries: DayCardEntry[]) {
  return cards.slice().sort((a, b) => {
    const atA = lastUsedAt(a, entries)
    const atB = lastUsedAt(b, entries)
    if (atA && atB) return atB.localeCompare(atA) || a.order - b.order || a.id.localeCompare(b.id)
    if (atA) return -1
    if (atB) return 1
    return a.order - b.order || a.id.localeCompare(b.id)
  })
}

export function recentHomeDayCards(cards: DayCard[], entries: DayCardEntry[], limit = 3) {
  const sorted = sortDayCardsByUse(activeDayCards(cards), entries)
  const used = sorted.filter((card) => lastUsedAt(card, entries))
  if (used.length > 0) return used.slice(0, limit)
  return sorted.slice(0, 1)
}

export function dayCardMatchesSearch(card: DayCard, locale: Locale, needle: string, schoolLabel: string) {
  const copy = dayCardCopy(card, locale)
  const hay = `${copy.title} ${copy.about} ${schoolLabel}`.toLowerCase()
  return hay.includes(needle.trim().toLowerCase())
}

export function firstRepeaterSection(card: DayCard) {
  return card.sections.find((item) => item.kind === 'repeater')
}

export function scaleRange(field: DayCardField) {
  const min = Number.isFinite(field.min) ? Number(field.min) : 0
  const max = Number.isFinite(field.max) ? Number(field.max) : 10
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return { min: lo, max: hi }
}

export function scaleSteps(field: DayCardField) {
  const { min, max } = scaleRange(field)
  return Array.from({ length: max - min + 1 }, (_, index) => min + index)
}

export function linkedIdsForField(card: DayCard, field: DayCardField) {
  const listed = (field.techniqueIds ?? []).filter(Boolean)
  if (listed.length > 0) return listed.filter((id) => card.techniqueIds.includes(id))
  return card.techniqueIds
}

export function valuesHaveContent(values: Record<string, string> | undefined) {
  if (!values) return false
  return Object.values(values).some((item) => item.trim())
}

export function sectionHasContent(answers: DayCardSectionAnswers | undefined) {
  if (!answers) return false
  if (valuesHaveContent(answers.values)) return true
  return answers.rows.some((row) => valuesHaveContent(row.values))
}

export function entryHasContent(card: DayCard, entry: DayCardEntry | undefined) {
  if (!entry) return false
  return card.sections.some((section) => sectionHasContent(entry.answers[section.id]))
}

export function repeaterRowCount(card: DayCard, entry: DayCardEntry | undefined) {
  if (!entry) return 0
  return card.sections
    .filter((section) => section.kind === 'repeater')
    .reduce((sum, section) => sum + (entry.answers[section.id]?.rows.length ?? 0), 0)
}

export function eveningIsEmpty(card: DayCard, entry: DayCardEntry | undefined) {
  const lastFields = [...card.sections].reverse().find((item) => item.kind === 'fields')
  if (!lastFields) return true
  return !sectionHasContent(entry?.answers[lastFields.id])
}

export function visibleFields(section: DayCardSection, siblingRepeaterEmpty: boolean) {
  return section.fields.filter((field) => {
    if (field.revealWhen === 'repeaterEmpty') return siblingRepeaterEmpty
    return true
  })
}

export function spotlightFields(section: DayCardSection) {
  const marked = section.fields.filter((field) => field.spotlight)
  if (marked.length > 0) return marked
  if (section.kind !== 'repeater') return section.fields
  return section.fields.filter((field) => field.kind === 'scale' || field.kind === 'skill' || field.kind === 'textarea').slice(0, 4)
}

export function extraFields(section: DayCardSection) {
  const quick = new Set(spotlightFields(section).map((item) => item.id))
  return section.fields.filter((item) => !quick.has(item.id) && item.revealWhen !== 'repeaterEmpty')
}

export function skillFieldInSection(section: DayCardSection) {
  return section.fields.find((item) => item.kind === 'skill')
}

export function practiceNoteFromRow(section: DayCardSection, row: DayCardRow) {
  return section.fields
    .filter((field) => field.kind === 'text' || field.kind === 'textarea')
    .map((field) => row.values[field.id]?.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(' · ')
}

export function techniqueIdFromRow(section: DayCardSection, row: DayCardRow) {
  const field = skillFieldInSection(section)
  return field ? row.values[field.id]?.trim() ?? '' : ''
}

export function recentDateIds(count = 7, date = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(date)
    day.setDate(date.getDate() - (count - 1 - index))
    return todayId(day)
  })
}

export function emptyRow(): DayCardRow {
  return { id: '', values: {} }
}
