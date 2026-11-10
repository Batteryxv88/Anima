import { create } from 'zustand'
import type { Assignment, CheckIn, JournalEntry, Practice } from './model'

export type ShareScope = {
  assignments: boolean
  trend: boolean
  journal: boolean
  journalNotes: boolean
  journalThoughts: boolean
}

export type ShareScopeFlag = 'assignments' | 'trend' | 'journalNotes' | 'journalThoughts'

export type Invite = {
  token: string
  patientUid: string
  patientEmail: string
  therapistUid: string | null
  therapistEmail: string | null
  createdAt: string
  expiresAtMs: number
  status: 'open' | 'claimed' | 'confirmed'
  linkId?: string
}

export type CareLink = {
  id: string
  patientUid: string
  patientEmail: string
  therapistUid: string
  therapistEmail: string
  scope: ShareScope
  createdAt: string
  revoked: boolean
  members: string[]
}

export type ShareSnapshot = {
  patientUid: string
  therapistUid: string
  patientEmail: string
  patientName?: string
  scope: ShareScope
  updatedAt: string
  checkIns: CheckIn[]
  journal: JournalEntry[]
  assignments: Assignment[]
  practices: Practice[]
  sessionNote: string
}

export type PendingAssignment = {
  id: string
  techniqueId: string
  therapistNote: string
  createdAt: string
}

export type TherapistComment = {
  id: string
  at: string
  text: string
}

export type ShareNotes = {
  patientUid: string
  therapistUid: string
  pendingAssignments: PendingAssignment[]
  comments: TherapistComment[]
}

export const defaultScope = (): ShareScope => ({
  assignments: true,
  trend: true,
  journal: false,
  journalNotes: false,
  journalThoughts: false,
})

export function setShareScope(scope: ShareScope, key: ShareScopeFlag, value: boolean): ShareScope {
  const next = { ...scope, [key]: value }
  return { ...next, journal: next.journalNotes || next.journalThoughts }
}

export function journalKindShared(scope: ShareScope, kind: JournalEntry['kind']) {
  return kind === 'thought' ? scope.journalThoughts : scope.journalNotes
}

type ShareState = {
  patientLinks: CareLink[]
  therapistLinks: CareLink[]
  comments: TherapistComment[]
  setPatientLinks: (patientLinks: CareLink[]) => void
  setTherapistLinks: (therapistLinks: CareLink[]) => void
  setComments: (comments: TherapistComment[]) => void
  clearShare: () => void
}

export const useShareStore = create<ShareState>()((set) => ({
  patientLinks: [],
  therapistLinks: [],
  comments: [],
  setPatientLinks: (patientLinks) => set({ patientLinks }),
  setTherapistLinks: (therapistLinks) => set({ therapistLinks }),
  setComments: (comments) => set({ comments }),
  clearShare: () => set({ patientLinks: [], therapistLinks: [], comments: [] }),
}))
