import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/shared/firebase'
import { withCloudLock } from '@/shared/lib'
import { normalizeSkillRating } from '@/entities/technique/stats'
import { useCareStore, type JournalEntry, type JournalKind, type SkillPref } from './model'

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
      checkIns: Array.isArray(data.checkIns) ? data.checkIns : [],
      assignments: Array.isArray(data.assignments) ? data.assignments : [],
      practices: Array.isArray(data.practices) ? data.practices : [],
      journal: asJournal(data.journal),
      sessionNote: typeof data.sessionNote === 'string' ? data.sessionNote : '',
      crisisPlan: {
        firstMinutes: String(data.crisisPlan?.firstMinutes ?? ''),
        whoToCall: String(data.crisisPlan?.whoToCall ?? ''),
        avoid: String(data.crisisPlan?.avoid ?? ''),
      },
      skillPrefs: asSkillPrefs(data.skillPrefs),
    }),
  )
}

export async function pushCare(uid: string) {
  const db = getFirebaseDb()
  if (!db) return
  const state = useCareStore.getState()
  await setDoc(
    doc(db, 'userCare', uid),
    {
      checkIns: state.checkIns,
      assignments: state.assignments,
      practices: state.practices,
      journal: state.journal,
      sessionNote: state.sessionNote,
      crisisPlan: state.crisisPlan,
      skillPrefs: state.skillPrefs,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}
