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
}

export type Practice = {
  id: string
  techniqueId: string
  at: string
  note: string
}

export type CrisisPlan = {
  firstMinutes: string
  whoToCall: string
  avoid: string
}

type CareState = {
  checkIns: CheckIn[]
  assignments: Assignment[]
  practices: Practice[]
  sessionNote: string
  crisisPlan: CrisisPlan
  saveCheckIn: (entry: Omit<CheckIn, 'date'> & { date?: string }) => void
  addAssignment: (techniqueId: string) => void
  setAssignmentStatus: (id: string, status: AssignmentStatus) => void
  removeAssignment: (id: string) => void
  addPractice: (techniqueId: string, note: string) => void
  setSessionNote: (sessionNote: string) => void
  setCrisisPlan: (crisisPlan: CrisisPlan) => void
}

const emptyPlan: CrisisPlan = { firstMinutes: '', whoToCall: '', avoid: '' }

export const useCareStore = create<CareState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      assignments: [],
      practices: [],
      sessionNote: '',
      crisisPlan: emptyPlan,
      saveCheckIn: (entry) => {
        const date = entry.date ?? todayId()
        const next = get().checkIns.filter((item) => item.date !== date)
        set({
          checkIns: [...next, { date, mood: entry.mood, anxiety: entry.anxiety, sleep: entry.sleep }],
        })
      },
      addAssignment: (techniqueId) => {
        const exists = get().assignments.some(
          (item) => item.techniqueId === techniqueId && item.status !== 'done',
        )
        if (exists) return
        set({
          assignments: [
            ...get().assignments,
            {
              id: createId(),
              techniqueId,
              createdAt: new Date().toISOString(),
              status: 'planned',
              therapistNote: '',
              patientNote: '',
            },
          ],
        })
      },
      setAssignmentStatus: (id, status) =>
        set({
          assignments: get().assignments.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        }),
      removeAssignment: (id) =>
        set({ assignments: get().assignments.filter((item) => item.id !== id) }),
      addPractice: (techniqueId, note) =>
        set({
          practices: [
            ...get().practices,
            {
              id: createId(),
              techniqueId,
              at: new Date().toISOString(),
              note,
            },
          ],
        }),
      setSessionNote: (sessionNote) => set({ sessionNote }),
      setCrisisPlan: (crisisPlan) => set({ crisisPlan }),
    }),
    { name: 'anima-care' },
  ),
)
