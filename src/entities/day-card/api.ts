import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { create } from 'zustand'
import { locales, type Locale } from '@/shared/config'
import { getFirebaseDb } from '@/shared/firebase'
import { createId, translateFromRu } from '@/shared/lib'
import { defaultDistressDayCard } from './seed'
import {
  dayCardCadences,
  dayCardFieldKinds,
  dayCardSectionKinds,
  emptyDayCard as blankDayCard,
  emptyLocalized,
  schools,
  type DayCard,
  type DayCardCadence,
  type School,
  type DayCardCopy,
  type DayCardField,
  type DayCardFieldKind,
  type DayCardLocalized,
  type DayCardSection,
  type DayCardSectionKind,
} from './model'

type CloudDayCard = DayCard & { deleted?: boolean; updatedAt?: string }

export const useDayCardStore = create<{
  list: DayCard[]
  ready: boolean
  setList: (list: DayCard[]) => void
}>()((set) => ({
  list: [],
  ready: false,
  setList: (list) => set({ list, ready: true }),
}))

function asLocalized(raw: unknown): DayCardLocalized {
  if (typeof raw === 'string') return { ru: raw, en: raw, sl: raw }
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    ru: String(value.ru ?? ''),
    en: String(value.en ?? ''),
    sl: String(value.sl ?? ''),
  }
}

function asCopy(raw: unknown): DayCardCopy {
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    title: String(value.title ?? ''),
    about: String(value.about ?? ''),
  }
}

function asOptions(raw: unknown): Record<Locale, string[]> | undefined {
  if (!raw) return undefined
  if (Array.isArray(raw)) {
    const ru = raw.map((item) => String(item)).filter(Boolean)
    return { ru, en: ru, sl: ru }
  }
  if (typeof raw !== 'object') return undefined
  const value = raw as Record<string, unknown>
  const read = (locale: Locale) =>
    Array.isArray(value[locale]) ? (value[locale] as unknown[]).map((item) => String(item)).filter(Boolean) : []
  const ru = read('ru')
  if (ru.length === 0) return undefined
  return { ru, en: read('en').length > 0 ? read('en') : ru, sl: read('sl').length > 0 ? read('sl') : ru }
}

function asField(raw: unknown): DayCardField | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const kind = dayCardFieldKinds.includes(data.kind as DayCardFieldKind) ? (data.kind as DayCardFieldKind) : 'textarea'
  const label = asLocalized(data.label)
  const example = asLocalized(data.example)
  const techniqueIds = Array.isArray(data.techniqueIds)
    ? data.techniqueIds.map((item) => String(item)).filter(Boolean)
    : undefined
  const options = kind === 'choice' ? asOptions(data.options) : undefined
  const min = data.min == null ? undefined : Number(data.min)
  const max = data.max == null ? undefined : Number(data.max)
  return {
    id: String(data.id ?? createId()),
    kind,
    label,
    ...(example.ru.trim() ? { example } : {}),
    techniqueIds: techniqueIds && techniqueIds.length > 0 ? techniqueIds : undefined,
    sourceFieldId: typeof data.sourceFieldId === 'string' && data.sourceFieldId.trim() ? data.sourceFieldId : undefined,
    min: Number.isFinite(min) ? min : kind === 'scale' ? 0 : undefined,
    max: Number.isFinite(max) ? max : kind === 'scale' ? 10 : undefined,
    options,
    spotlight: data.spotlight === true ? true : undefined,
    revealWhen: data.revealWhen === 'repeaterEmpty' ? 'repeaterEmpty' : undefined,
  }
}

function asSection(raw: unknown): DayCardSection | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const kind = dayCardSectionKinds.includes(data.kind as DayCardSectionKind)
    ? (data.kind as DayCardSectionKind)
    : 'fields'
  const fields = Array.isArray(data.fields) ? data.fields.flatMap((item) => asField(item) ?? []) : []
  return {
    id: String(data.id ?? createId()),
    kind,
    title: asLocalized(data.title),
    hint: asLocalized(data.hint),
    fields,
  }
}

function asDayCard(id: string, data: Record<string, unknown>): CloudDayCard | null {
  if (data.deleted === true) return null
  const copy = {} as DayCard['copy']
  for (const locale of locales) {
    copy[locale] = asCopy(data.copy && typeof data.copy === 'object' ? (data.copy as Record<string, unknown>)[locale] : undefined)
  }
  const school = schools.includes(data.school as School) ? (data.school as School) : 'dbt'
  const cadence = dayCardCadences.includes(data.cadence as DayCardCadence)
    ? (data.cadence as DayCardCadence)
    : 'daily'
  const techniqueIds = Array.isArray(data.techniqueIds)
    ? data.techniqueIds.map((item) => String(item)).filter(Boolean)
    : []
  const sections = Array.isArray(data.sections) ? data.sections.flatMap((item) => asSection(item) ?? []) : []
  return {
    id,
    school,
    cadence,
    active: data.active === true,
    order: Number(data.order ?? 0) || 0,
    techniqueIds,
    copy,
    sections,
    updatedAt: String(data.updatedAt ?? ''),
  }
}

export function listenDayCards() {
  const db = getFirebaseDb()
  if (!db) {
    useDayCardStore.getState().setList([])
    return () => {}
  }
  return onSnapshot(
    collection(db, 'dayCards'),
    (snap) => {
      const list = snap.docs
        .map((item) => asDayCard(item.id, item.data() as Record<string, unknown>))
        .filter((item): item is DayCard => item !== null)
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
      useDayCardStore.getState().setList(list)
    },
    () => {
      const { list } = useDayCardStore.getState()
      useDayCardStore.getState().setList(list)
    },
  )
}

function cloneCopy(copy: DayCardCopy): DayCardCopy {
  return { title: copy.title, about: copy.about }
}

function cloneLocalized(block: DayCardLocalized): DayCardLocalized {
  return { ru: block.ru, en: block.en || block.ru, sl: block.sl || block.ru }
}

export function fallbackDayCardLocales(card: DayCard): DayCard {
  const ru = cloneCopy(card.copy.ru)
  return {
    ...card,
    copy: {
      ru,
      en: card.copy.en.title.trim() ? card.copy.en : cloneCopy(ru),
      sl: card.copy.sl.title.trim() ? card.copy.sl : cloneCopy(ru),
    },
    sections: card.sections.map((section) => ({
      ...section,
      title: cloneLocalized(section.title),
      hint: cloneLocalized(section.hint),
      fields: section.fields.map((field) => ({
        ...field,
        label: cloneLocalized(field.label),
        example: field.example?.ru.trim() ? cloneLocalized(field.example) : undefined,
        options:
          field.kind === 'choice' && field.options?.ru.length
            ? {
                ru: field.options.ru,
                en: field.options.en.length > 0 ? field.options.en : [...field.options.ru],
                sl: field.options.sl.length > 0 ? field.options.sl : [...field.options.ru],
              }
            : undefined,
      })),
    })),
  }
}

async function translateBlock(ru: string, locale: 'en' | 'sl') {
  const trimmed = ru.trim()
  if (!trimmed) return ''
  return translateFromRu(trimmed, locale)
}

export async function fillDayCardTranslations(card: DayCard): Promise<DayCard> {
  try {
    const copy = { ...card.copy }
    for (const locale of ['en', 'sl'] as const) {
      copy[locale] = {
        title: await translateBlock(card.copy.ru.title, locale),
        about: await translateBlock(card.copy.ru.about, locale),
      }
    }
    const sections = await Promise.all(
      card.sections.map(async (section) => {
        const title = { ...section.title }
        const hint = { ...section.hint }
        for (const locale of ['en', 'sl'] as const) {
          title[locale] = await translateBlock(section.title.ru, locale)
          hint[locale] = await translateBlock(section.hint.ru, locale)
        }
        const fields = await Promise.all(
          section.fields.map(async (field) => {
            const label = { ...field.label }
            const example = field.example ? { ...field.example } : emptyLocalized()
            for (const locale of ['en', 'sl'] as const) {
              label[locale] = await translateBlock(field.label.ru, locale)
              if (field.example?.ru.trim()) {
                example[locale] = await translateBlock(field.example.ru, locale)
              }
            }
            const next = {
              ...field,
              label,
              example: field.example?.ru.trim() ? example : undefined,
            }
            if (field.kind !== 'choice' || !field.options?.ru.length) {
              return { ...next, options: undefined }
            }
            return {
              ...next,
              options: {
                ru: field.options.ru,
                en: await Promise.all(field.options.ru.map((item) => translateBlock(item, 'en'))),
                sl: await Promise.all(field.options.ru.map((item) => translateBlock(item, 'sl'))),
              },
            }
          }),
        )
        return { ...section, title, hint, fields }
      }),
    )
    return { ...card, copy, sections }
  } catch {
    return fallbackDayCardLocales(card)
  }
}

function fieldPayload(field: DayCardField) {
  return {
    id: field.id.trim() || createId(),
    kind: field.kind,
    label: field.label,
    ...(field.example?.ru.trim() ? { example: field.example } : {}),
    ...(field.techniqueIds && field.techniqueIds.length > 0 ? { techniqueIds: field.techniqueIds } : {}),
    ...(field.sourceFieldId ? { sourceFieldId: field.sourceFieldId } : {}),
    ...(field.kind === 'scale' ? { min: field.min ?? 0, max: field.max ?? 10 } : {}),
    ...(field.kind === 'choice' && field.options ? { options: field.options } : {}),
    ...(field.spotlight ? { spotlight: true } : {}),
    ...(field.revealWhen ? { revealWhen: field.revealWhen } : {}),
  }
}

export async function saveDayCard(card: DayCard) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const id = card.id.trim() || createId()
  await setDoc(doc(db, 'dayCards', id), {
    school: card.school,
    cadence: card.cadence,
    active: card.active,
    order: card.order,
    techniqueIds: card.techniqueIds,
    copy: {
      ...card.copy,
      ru: {
        title: card.copy.ru.title.trim(),
        about: card.copy.ru.about.trim(),
      },
    },
    sections: card.sections.map((section) => ({
      id: section.id.trim() || createId(),
      kind: section.kind,
      title: section.title,
      hint: section.hint,
      fields: section.fields.map(fieldPayload),
    })),
    updatedAt: new Date().toISOString(),
  })
  return id
}

export async function deleteDayCard(id: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  await setDoc(
    doc(db, 'dayCards', id),
    { deleted: true, updatedAt: new Date().toISOString() },
    { merge: true },
  )
}

export async function seedDefaultDayCards() {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const seeded = fallbackDayCardLocales(defaultDistressDayCard())
  const filled = await fillDayCardTranslations(seeded)
  await saveDayCard({ ...filled, id: filled.id || 'distressTolerance' })
}

export function emptyDayCardField(kind: DayCardFieldKind = 'textarea'): DayCardField {
  return {
    id: createId(),
    kind,
    label: emptyLocalized(),
    ...(kind === 'scale' ? { min: 0, max: 10 } : {}),
    ...(kind === 'choice' ? { options: { ru: [''], en: [], sl: [] } } : {}),
  }
}

export function emptyDayCardSection(kind: DayCardSectionKind = 'fields'): DayCardSection {
  return {
    id: createId(),
    kind,
    title: emptyLocalized(),
    hint: emptyLocalized(),
    fields: [],
  }
}

export function emptyDayCard(order = 0): DayCard {
  return { ...blankDayCard(order), id: '' }
}

export function getDayCard(id: string) {
  return useDayCardStore.getState().list.find((item) => item.id === id)
}
