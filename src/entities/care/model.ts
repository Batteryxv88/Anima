import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createId, invertScaleValue, todayId } from '@/shared/lib'

export type CheckIn = {
  date: string
  mood: number
  anxiety: number
  sleep: number
}

export type AssignmentStatus = 'planned' | 'done' | 'discuss'

export type Assignment = {
  id: string
  techniqueId: string
  createdAt: string
  status: AssignmentStatus
  therapistNote: string
  patientNote: string
  answers: Record<string, string>
}

export type Practice = {
  id: string
  techniqueId: string
  at: string
  note: string
  answers: Record<string, string>
}

export type CrisisPlan = {
  firstMinutes: string
  whoToCall: string
  avoid: string
}

export type JournalKind = 'note' | 'thought'

export type JournalEntry = {
  id: string
  at: string
  kind: JournalKind
  shareWithSpecialist: boolean
  body: string
  situation: string
  feeling: string
  thought: string
  otherLook: string
}

export type SkillPref = {
  liked?: boolean
  rating?: number
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

export type CareSnapshot = {
  checkIns: CheckIn[]
  assignments: Assignment[]
  practices: Practice[]
  journal: JournalEntry[]
  dayCardEntries: DayCardEntry[]
  sessionNote: string
  crisisPlan: CrisisPlan
  skillPrefs: Record<string, SkillPref>
}

type CareState = CareSnapshot & {
  saveCheckIn: (entry: Omit<CheckIn, 'date'> & { date?: string }) => void
  addAssignment: (techniqueId: string, extra?: { therapistNote?: string; id?: string }) => boolean
  setAssignmentStatus: (id: string, status: AssignmentStatus) => void
  setAssignmentNote: (id: string, patientNote: string) => void
  setAssignmentAnswer: (id: string, fieldId: string, value: string) => void
  removeAssignment: (id: string) => void
  addPractice: (techniqueId: string, note: string, answers?: Record<string, string>) => void
  upsertPractice: (input: {
    id?: string
    techniqueId: string
    note: string
    answers?: Record<string, string>
  }) => string
  upsertDayCardEntry: (input: {
    id?: string
    dayCardId: string
    date: string
    answers: DayCardEntry['answers']
  }) => string
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'at'>) => void
  setJournalShare: (id: string, shareWithSpecialist: boolean) => void
  removeJournalEntry: (id: string) => void
  setSessionNote: (sessionNote: string) => void
  setCrisisPlan: (crisisPlan: CrisisPlan) => void
  setSkillLike: (techniqueId: string, liked: boolean) => void
  setSkillRating: (techniqueId: string, rating: number | undefined) => void
  clearSkillPrefs: () => void
  replaceCare: (payload: CareSnapshot) => void
}

const emptyPlan: CrisisPlan = { firstMinutes: '', whoToCall: '', avoid: '' }

export const useCareStore = create<CareState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      assignments: [],
      practices: [],
      journal: [],
      dayCardEntries: [],
      sessionNote: '',
      crisisPlan: emptyPlan,
      skillPrefs: {},
      saveCheckIn: (entry) => {
        const date = entry.date ?? todayId()
        const next = get().checkIns.filter((item) => item.date !== date)
        set({
          checkIns: [...next, { date, mood: entry.mood, anxiety: entry.anxiety, sleep: entry.sleep }],
        })
      },
      addAssignment: (techniqueId, extra) => {
        const current = get().assignments
        const exists = current.some(
          (item) => item.id === extra?.id || (item.techniqueId === techniqueId && item.status !== 'done'),
        )
        if (exists) return true
        set({
          assignments: [
            ...current,
            {
              id: extra?.id ?? createId(),
              techniqueId,
              createdAt: new Date().toISOString(),
              status: 'planned',
              therapistNote: extra?.therapistNote ?? '',
              patientNote: '',
              answers: {},
            },
          ],
        })
        return true
      },
      setAssignmentStatus: (id, status) =>
        set({
          assignments: get().assignments.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        }),
      setAssignmentNote: (id, patientNote) =>
        set({
          assignments: get().assignments.map((item) =>
            item.id === id ? { ...item, patientNote } : item,
          ),
        }),
      setAssignmentAnswer: (id, fieldId, value) =>
        set({
          assignments: get().assignments.map((item) =>
            item.id === id ? { ...item, answers: { ...item.answers, [fieldId]: value } } : item,
          ),
        }),
      removeAssignment: (id) =>
        set({ assignments: get().assignments.filter((item) => item.id !== id) }),
      addPractice: (techniqueId, note, answers = {}) => {
        get().upsertPractice({ techniqueId, note, answers })
      },
      upsertPractice: ({ id, techniqueId, note, answers = {} }) => {
        const nextId = id?.trim() || createId()
        const at = new Date().toISOString()
        const current = get().practices
        const index = current.findIndex((item) => item.id === nextId)
        if (index >= 0) {
          set({
            practices: current.map((item) =>
              item.id === nextId ? { ...item, techniqueId, note, answers } : item,
            ),
          })
          return nextId
        }
        set({
          practices: [...current, { id: nextId, techniqueId, at, note, answers }],
        })
        return nextId
      },
      upsertDayCardEntry: ({ id, dayCardId, date, answers }) => {
        const now = new Date().toISOString()
        const current = get().dayCardEntries
        const existing =
          (id ? current.find((item) => item.id === id) : undefined) ??
          current.find((item) => item.dayCardId === dayCardId && item.date === date)
        const nextId = existing?.id ?? id?.trim() ?? createId()
        const next: DayCardEntry = {
          id: nextId,
          dayCardId,
          date,
          answers,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        }
        const rest = current.filter((item) => item.id !== nextId)
        set({
          dayCardEntries: [next, ...rest]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 60),
        })
        return nextId
      },
      addJournalEntry: (entry) =>
        set({
          journal: [
            {
              ...entry,
              id: createId(),
              at: new Date().toISOString(),
            },
            ...get().journal,
          ].slice(0, 80),
        }),
      setJournalShare: (id, shareWithSpecialist) =>
        set({
          journal: get().journal.map((item) =>
            item.id === id ? { ...item, shareWithSpecialist } : item,
          ),
        }),
      removeJournalEntry: (id) =>
        set({ journal: get().journal.filter((item) => item.id !== id) }),
      setSessionNote: (sessionNote) => set({ sessionNote }),
      setCrisisPlan: (crisisPlan) => set({ crisisPlan }),
      setSkillLike: (techniqueId, liked) =>
        set((state) => {
          const current = state.skillPrefs[techniqueId] ?? {}
          const next: SkillPref = { ...current, ...(liked ? { liked: true } : {}) }
          if (!liked) delete next.liked
          if (!next.liked && next.rating == null) {
            const { [techniqueId]: _drop, ...rest } = state.skillPrefs
            return { skillPrefs: rest }
          }
          return { skillPrefs: { ...state.skillPrefs, [techniqueId]: next } }
        }),
      setSkillRating: (techniqueId, rating) =>
        set((state) => {
          const current = state.skillPrefs[techniqueId] ?? {}
          const nextRating = rating != null && rating >= 1 && rating <= 5 ? rating : undefined
          const next: SkillPref = { ...current, ...(nextRating ? { rating: nextRating } : {}) }
          if (!nextRating) delete next.rating
          if (!next.liked && next.rating == null) {
            const { [techniqueId]: _drop, ...rest } = state.skillPrefs
            return { skillPrefs: rest }
          }
          return { skillPrefs: { ...state.skillPrefs, [techniqueId]: next } }
        }),
      clearSkillPrefs: () => set({ skillPrefs: {} }),
      replaceCare: (payload) =>
        set({
          ...payload,
          skillPrefs: payload.skillPrefs ?? {},
          dayCardEntries: payload.dayCardEntries ?? [],
        }),
    }),
    {
      name: 'anima-care',
      version: 1,
      migrate: (persisted, version) => {
        const data = (persisted ?? {}) as Partial<CareSnapshot>
        if (version >= 1) return data
        return {
          ...data,
          checkIns: (data.checkIns ?? []).map((item) => ({
            ...item,
            anxiety: invertScaleValue(item.anxiety),
          })),
        }
      },
      merge: (persisted, current) => {
        const data = persisted as Partial<CareSnapshot> | undefined
        return {
          ...current,
          ...data,
          dayCardEntries: Array.isArray(data?.dayCardEntries) ? data.dayCardEntries : [],
          skillPrefs: data?.skillPrefs ?? current.skillPrefs,
        }
      },
    },
  ),
)
