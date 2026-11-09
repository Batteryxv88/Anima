import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { create } from 'zustand'
import { createId, translateFromRu } from '@/shared/lib'
import { getFirebaseDb } from '@/shared/firebase'
import { locales, type Locale } from '@/shared/config'
import {
  emptyLocalized,
  fieldKinds,
  schools,
  situations,
  type FieldKind,
  type School,
  type Situation,
  type Technique,
  type TechniqueCopy,
  type TechniqueField,
  type TechniqueSkill,
} from './model'

export const useTechniqueStore = create<{ list: Technique[]; setList: (list: Technique[]) => void }>()((set) => ({
  list: [],
  setList: (list) => set({ list }),
}))

export type CloudTechnique = Technique & {
  deleted?: boolean
  updatedAt?: string
}

function asCopy(raw: unknown): TechniqueCopy {
  const value = raw && typeof raw === 'object' ? (raw as TechniqueCopy) : { title: '', about: '', when: '', steps: [] }
  const steps = Array.isArray(value.steps) ? value.steps.map((item) => String(item)).filter(Boolean) : []
  return {
    title: String(value.title ?? ''),
    about: String(value.about ?? ''),
    when: String(value.when ?? ''),
    steps,
  }
}

function asLocalized(raw: unknown): Record<Locale, string> {
  if (typeof raw === 'string') return { ru: raw, en: raw, sl: raw }
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    ru: String(value.ru ?? ''),
    en: String(value.en ?? ''),
    sl: String(value.sl ?? ''),
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

function asField(raw: unknown): TechniqueField | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const kind = fieldKinds.includes(data.kind as FieldKind) ? (data.kind as FieldKind) : 'textarea'
  const label = asLocalized(data.label)
  if (!label.ru.trim()) return null
  return {
    id: String(data.id ?? createId()),
    kind,
    label,
    hint: asLocalized(data.hint),
    options: kind === 'choice' ? asOptions(data.options) : undefined,
  }
}

function asSkill(raw: unknown, index = 0): TechniqueSkill | null {
  if (typeof raw === 'string') {
    const title = raw.trim()
    if (!title) return null
    return {
      id: `copy-skill-${index}`,
      kind: 'textarea',
      title: { ru: title, en: title, sl: title },
      hint: emptyLocalized(),
    }
  }
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const kind = fieldKinds.includes(data.kind as FieldKind) ? (data.kind as FieldKind) : 'textarea'
  const title = asLocalized(data.title ?? data.label)
  if (!title.ru.trim()) return null
  return {
    id: String(data.id ?? `copy-skill-${index}`),
    kind,
    title,
    hint: asLocalized(data.hint),
    options: kind === 'choice' ? asOptions(data.options) : undefined,
  }
}

function legacyCopySkills(data: Record<string, unknown>): TechniqueSkill[] {
  const rawCopy = data.copy && typeof data.copy === 'object' ? (data.copy as Record<string, unknown>).ru : undefined
  const listed =
    rawCopy && typeof rawCopy === 'object' && Array.isArray((rawCopy as { skills?: unknown }).skills)
      ? ((rawCopy as { skills: unknown[] }).skills ?? [])
      : []
  return listed.flatMap((item, index) => asSkill(item, index) ?? [])
}

function asTechnique(id: string, data: Record<string, unknown>): CloudTechnique {
  const copy = {} as Technique['copy']
  for (const locale of locales) {
    copy[locale] = asCopy(data.copy && typeof data.copy === 'object' ? (data.copy as Record<string, unknown>)[locale] : undefined)
  }
  const school = schools.includes(data.school as School) ? (data.school as School) : 'behavioral'
  const nextSituations = Array.isArray(data.situations)
    ? data.situations.filter((item): item is Situation => situations.includes(item as Situation))
    : []
  const fields = Array.isArray(data.fields) ? data.fields.flatMap((item) => asField(item) ?? []) : []
  const parsedSkills = Array.isArray(data.skills)
    ? data.skills.flatMap((item, index) => asSkill(item, index) ?? [])
    : []
  const skills = parsedSkills.length > 0 ? parsedSkills : legacyCopySkills(data)
  const coverUrl = typeof data.coverUrl === 'string' ? data.coverUrl.trim() : ''
  return {
    id,
    school,
    situations: nextSituations,
    durationMin: Number(data.durationMin ?? 3) || 3,
    coverUrl: coverUrl || undefined,
    copy,
    fields,
    skills,
    deleted: Boolean(data.deleted),
    updatedAt: String(data.updatedAt ?? ''),
  }
}

function fromCloud(cloud: CloudTechnique[]): Technique[] {
  return cloud
    .filter((item) => !item.deleted)
    .map((item) => ({
      id: item.id,
      school: item.school,
      situations: item.situations,
      durationMin: item.durationMin,
      coverUrl: item.coverUrl,
      copy: item.copy,
      fields: item.fields,
      skills: item.skills,
    }))
}

export function listenTechniques() {
  const db = getFirebaseDb()
  if (!db) {
    useTechniqueStore.getState().setList([])
    return () => {}
  }
  return onSnapshot(collection(db, 'techniques'), (snap) => {
    const cloud = snap.docs.map((item) => asTechnique(item.id, item.data() as Record<string, unknown>))
    useTechniqueStore.getState().setList(fromCloud(cloud))
  })
}

function cloneRu(technique: Technique): TechniqueCopy {
  const ru = technique.copy.ru
  return { title: ru.title, about: ru.about, when: ru.when, steps: [...ru.steps] }
}

export function fallbackLocales(technique: Technique): Technique {
  const ruCopy = cloneRu(technique)
  return {
    ...technique,
    copy: {
      ru: ruCopy,
      en: technique.copy.en.title.trim() ? technique.copy.en : cloneRu(technique),
      sl: technique.copy.sl.title.trim() ? technique.copy.sl : cloneRu(technique),
    },
    fields: technique.fields.map((field) => ({
      ...field,
      label: {
        ru: field.label.ru,
        en: field.label.en.trim() || field.label.ru,
        sl: field.label.sl.trim() || field.label.ru,
      },
      hint: {
        ru: field.hint?.ru ?? '',
        en: field.hint?.en?.trim() || field.hint?.ru || '',
        sl: field.hint?.sl?.trim() || field.hint?.ru || '',
      },
      options:
        field.kind === 'choice' && field.options?.ru.length
          ? {
              ru: field.options.ru,
              en: field.options.en.length > 0 ? field.options.en : [...field.options.ru],
              sl: field.options.sl.length > 0 ? field.options.sl : [...field.options.ru],
            }
          : undefined,
    })),
    skills: (technique.skills ?? []).map((skill) => ({
      ...skill,
      title: {
        ru: skill.title.ru,
        en: skill.title.en.trim() || skill.title.ru,
        sl: skill.title.sl.trim() || skill.title.ru,
      },
      hint: {
        ru: skill.hint.ru,
        en: skill.hint.en.trim() || skill.hint.ru,
        sl: skill.hint.sl.trim() || skill.hint.ru,
      },
      options:
        skill.kind === 'choice' && skill.options?.ru.length
          ? {
              ru: skill.options.ru,
              en: skill.options.en.length > 0 ? skill.options.en : [...skill.options.ru],
              sl: skill.options.sl.length > 0 ? skill.options.sl : [...skill.options.ru],
            }
          : undefined,
    })),
  }
}

export async function fillTranslations(technique: Technique): Promise<Technique> {
  try {
    const ru = technique.copy.ru
    const copy = { ...technique.copy }
    for (const locale of ['en', 'sl'] as const) {
      copy[locale] = {
        title: await translateFromRu(ru.title, locale),
        about: await translateFromRu(ru.about, locale),
        when: await translateFromRu(ru.when, locale),
        steps: await Promise.all(ru.steps.map((step) => translateFromRu(step, locale))),
      }
    }
    const fields = await Promise.all(
      technique.fields.map(async (field) => {
        const label = { ...field.label }
        for (const locale of ['en', 'sl'] as const) {
          label[locale] = await translateFromRu(field.label.ru, locale)
        }
        const hint = { ...(field.hint ?? emptyLocalized()) }
        for (const locale of ['en', 'sl'] as const) {
          hint[locale] = (field.hint?.ru ?? '').trim() ? await translateFromRu(field.hint!.ru, locale) : ''
        }
        if (field.kind !== 'choice' || !field.options?.ru.length) {
          return { ...field, label, hint, options: undefined }
        }
        return {
          ...field,
          label,
          hint,
          options: {
            ru: field.options.ru,
            en: await Promise.all(field.options.ru.map((item) => translateFromRu(item, 'en'))),
            sl: await Promise.all(field.options.ru.map((item) => translateFromRu(item, 'sl'))),
          },
        }
      }),
    )
    const skills = await Promise.all(
      (technique.skills ?? []).map(async (skill) => {
        const title = { ...skill.title }
        const hint = { ...skill.hint }
        for (const locale of ['en', 'sl'] as const) {
          title[locale] = await translateFromRu(skill.title.ru, locale)
          hint[locale] = skill.hint.ru.trim() ? await translateFromRu(skill.hint.ru, locale) : ''
        }
        if (skill.kind !== 'choice' || !skill.options?.ru.length) {
          return { ...skill, title, hint, options: undefined }
        }
        return {
          ...skill,
          title,
          hint,
          options: {
            ru: skill.options.ru,
            en: await Promise.all(skill.options.ru.map((item) => translateFromRu(item, 'en'))),
            sl: await Promise.all(skill.options.ru.map((item) => translateFromRu(item, 'sl'))),
          },
        }
      }),
    )
    return { ...technique, copy, fields, skills }
  } catch {
    return fallbackLocales(technique)
  }
}

export async function saveTechnique(technique: Technique) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const id = technique.id.trim() || createId()
  const payload = {
    id,
    school: technique.school,
    situations: technique.situations,
    durationMin: technique.durationMin,
    ...(technique.coverUrl?.trim() ? { coverUrl: technique.coverUrl.trim() } : {}),
    copy: {
      ru: {
        title: technique.copy.ru.title.trim(),
        about: technique.copy.ru.about.trim(),
        when: technique.copy.ru.when.trim(),
        steps: technique.copy.ru.steps.map((item) => item.trim()).filter(Boolean),
      },
      en: {
        title: technique.copy.en.title.trim(),
        about: technique.copy.en.about.trim(),
        when: technique.copy.en.when.trim(),
        steps: technique.copy.en.steps.map((item) => item.trim()).filter(Boolean),
      },
      sl: {
        title: technique.copy.sl.title.trim(),
        about: technique.copy.sl.about.trim(),
        when: technique.copy.sl.when.trim(),
        steps: technique.copy.sl.steps.map((item) => item.trim()).filter(Boolean),
      },
    },
    fields: technique.fields.map((field) => {
      const hint = field.hint?.ru.trim()
        ? {
            ru: field.hint.ru.trim(),
            en: field.hint.en.trim(),
            sl: field.hint.sl.trim(),
          }
        : undefined
      const base = {
        id: field.id,
        kind: field.kind,
        label: field.label,
        ...(hint ? { hint } : {}),
      }
      return field.kind === 'choice' && field.options ? { ...base, options: field.options } : base
    }),
    skills: (technique.skills ?? [])
      .filter((skill) => skill.title.ru.trim())
      .map((skill) =>
        skill.kind === 'choice' && skill.options
          ? { id: skill.id, kind: skill.kind, title: skill.title, hint: skill.hint, options: skill.options }
          : { id: skill.id, kind: skill.kind, title: skill.title, hint: skill.hint },
      ),
    updatedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, 'techniques', id), payload)
  return id
}

export async function deleteTechnique(id: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  await deleteDoc(doc(db, 'techniques', id))
}

export function emptyField(): TechniqueField {
  return { id: createId(), kind: 'textarea', label: emptyLocalized(), hint: emptyLocalized() }
}

export function emptySkill(): TechniqueSkill {
  return { id: createId(), kind: 'textarea', title: emptyLocalized(), hint: emptyLocalized() }
}

export function emptyTechnique(): Technique {
  const copy = {} as Technique['copy']
  for (const locale of locales) {
    copy[locale] = { title: '', about: '', when: '', steps: [] }
  }
  return {
    id: '',
    school: 'behavioral',
    situations: [],
    durationMin: 3,
    copy,
    fields: [],
    skills: [],
  }
}

export function getTechnique(id: string) {
  return useTechniqueStore.getState().list.find((item) => item.id === id)
}
