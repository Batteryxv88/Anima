import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createId, todayId } from '@/shared/lib'

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

export type CareSnapshot = {
  checkIns: CheckIn[]
  assignments: Assignment[]
  practices: Practice[]
  journal: JournalEntry[]
  sessionNote: string
  crisisPlan: CrisisPlan
}

type CareState = CareSnapshot & {
  saveCheckIn: (entry: Omit<CheckIn, 'date'> & { date?: string }) => void
  addAssignment: (techniqueId: string, extra?: { therapistNote?: string; id?: string }) => boolean
  setAssignmentStatus: (id: string, status: AssignmentStatus) => void
  setAssignmentNote: (id: string, patientNote: string) => void
  setAssignmentAnswer: (id: string, fieldId: string, value: string) => void
  removeAssignment: (id: string) => void
  addPractice: (techniqueId: string, note: string, answers?: Record<string, string>) => void
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'at'>) => void
  setJournalShare: (id: string, shareWithSpecialist: boolean) => void
  removeJournalEntry: (id: string) => void
  setSessionNote: (sessionNote: string) => void
  setCrisisPlan: (crisisPlan: CrisisPlan) => void
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
      sessionNote: '',
      crisisPlan: emptyPlan,
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
      addPractice: (techniqueId, note, answers = {}) =>
        set({
          practices: [
            ...get().practices,
            {
              id: createId(),
              techniqueId,
              at: new Date().toISOString(),
              note,
              answers,
            },
          ],
        }),
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
      replaceCare: (payload) => set(payload),
    }),
    { name: 'anima-care' },
  ),
)
