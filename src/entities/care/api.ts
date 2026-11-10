import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/shared/firebase'
import { ifPayloadChanged, invertScaleValue, normalizeScaleValue, rememberPayload, withCloudLock } from '@/shared/lib'
import { normalizeSkillRating } from '@/entities/technique/stats'
import {
  useCareStore,
  type CheckIn,
  type DayCardEntry,
  type DayCardRow,
  type DayCardSectionAnswers,
  type JournalEntry,
  type JournalKind,
  type SkillPref,
} from './model'

function asSkillPrefs(raw: unknown): Record<string, SkillPref> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, SkillPref> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue
    const item = value as Record<string, unknown>
    const liked = item.liked === true ? true : undefined
    const rating = normalizeSkillRating(item.rating)
    if (liked || rating) out[key] = { ...(liked ? { liked: true } : {}), ...(rating ? { rating } : {}) }
  }
  return out
}

function asRows(raw: unknown): DayCardRow[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    if (typeof row.id !== 'string') return []
    const values =
      row.values && typeof row.values === 'object' && !Array.isArray(row.values)
        ? Object.fromEntries(
            Object.entries(row.values as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '')]),
          )
        : {}
    return [
      {
        id: row.id,
        practiceId: typeof row.practiceId === 'string' && row.practiceId.trim() ? row.practiceId : undefined,
        values,
      },
    ]
  })
}

function asSectionAnswers(raw: unknown): DayCardSectionAnswers {
  if (!raw || typeof raw !== 'object') return { values: {}, rows: [] }
  const data = raw as Record<string, unknown>
  const values =
    data.values && typeof data.values === 'object' && !Array.isArray(data.values)
      ? Object.fromEntries(
          Object.entries(data.values as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '')]),
        )
      : {}
  return { values, rows: asRows(data.rows) }
}

function asDayCardEntries(raw: unknown): DayCardEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const entry = item as Record<string, unknown>
    if (typeof entry.id !== 'string' || typeof entry.dayCardId !== 'string' || typeof entry.date !== 'string') {
      return []
    }
    const answersRaw = entry.answers && typeof entry.answers === 'object' ? (entry.answers as Record<string, unknown>) : {}
    const answers: DayCardEntry['answers'] = {}
    for (const [key, value] of Object.entries(answersRaw)) {
      answers[key] = asSectionAnswers(value)
    }
    return [
      {
        id: entry.id,
        dayCardId: entry.dayCardId,
        date: entry.date,
        answers,
        createdAt: String(entry.createdAt ?? ''),
        updatedAt: String(entry.updatedAt ?? ''),
      },
    ]
  })
}

function asCheckIns(raw: unknown, invertAnxiety: boolean): CheckIn[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    if (typeof row.date !== 'string' || !row.date) return []
    const anxiety = Number(row.anxiety)
    return [
      {
        date: row.date,
        mood: normalizeScaleValue(Number(row.mood)),
        anxiety: invertAnxiety ? invertScaleValue(anxiety) : normalizeScaleValue(anxiety),
        sleep: normalizeScaleValue(Number(row.sleep)),
      },
    ]
  })
}

function asJournal(raw: unknown): JournalEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const entry = item as Record<string, unknown>
    if (typeof entry.id !== 'string' || typeof entry.at !== 'string') return []
    const kind: JournalKind = entry.kind === 'thought' ? 'thought' : 'note'
    return [
      {
        id: entry.id,
        at: entry.at,
        kind,
        shareWithSpecialist: Boolean(entry.shareWithSpecialist),
        body: String(entry.body ?? ''),
        situation: String(entry.situation ?? ''),
        feeling: String(entry.feeling ?? ''),
        thought: String(entry.thought ?? ''),
        otherLook: String(entry.otherLook ?? ''),
      },
    ]
  })
}

export async function pullCare(uid: string) {
  const db = getFirebaseDb()
  if (!db) return
  const snap = await getDoc(doc(db, 'userCare', uid))
  if (!snap.exists()) {
    await pushCare(uid)
    return
  }
  const data = snap.data()
  withCloudLock(() =>
    useCareStore.getState().replaceCare({
      checkIns: asCheckIns(data.checkIns, data.anxietyHighIsWorse !== true),
      assignments: Array.isArray(data.assignments) ? data.assignments : [],
      practices: Array.isArray(data.practices) ? data.practices : [],
      journal: asJournal(data.journal),
      dayCardEntries: asDayCardEntries(data.dayCardEntries),
      sessionNote: typeof data.sessionNote === 'string' ? data.sessionNote : '',
      crisisPlan: {
        firstMinutes: String(data.crisisPlan?.firstMinutes ?? ''),
        whoToCall: String(data.crisisPlan?.whoToCall ?? ''),
        avoid: String(data.crisisPlan?.avoid ?? ''),
      },
      skillPrefs: asSkillPrefs(data.skillPrefs),
    }),
  )
  rememberPayload(`userCare:${uid}`, careComparable())
}

function careComparable() {
  const state = useCareStore.getState()
  return {
    checkIns: state.checkIns,
    anxietyHighIsWorse: true,
    assignments: state.assignments,
    practices: state.practices,
    journal: state.journal,
    dayCardEntries: state.dayCardEntries,
    sessionNote: state.sessionNote,
    crisisPlan: state.crisisPlan,
    skillPrefs: state.skillPrefs,
  }
}

export async function pushCare(uid: string) {
  const db = getFirebaseDb()
  if (!db) return
  const comparable = careComparable()
  await ifPayloadChanged(`userCare:${uid}`, comparable, () =>
    setDoc(doc(db, 'userCare', uid), { ...comparable, updatedAt: new Date().toISOString() }, { merge: true }),
  )
}
