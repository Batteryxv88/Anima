import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getFirebaseDb } from '@/shared/firebase'
import { createId, isThisWeek } from '@/shared/lib'
import { useCareStore, type CareSnapshot } from './model'
import {
  defaultScope,
  useShareStore,
  type CareLink,
  type Invite,
  type PendingAssignment,
  type ShareNotes,
  type ShareScope,
  type ShareSnapshot,
  type TherapistComment,
} from './share'

const INVITE_MS = 20 * 60 * 1000

function token() {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function asScope(raw: unknown): ShareScope {
  const value = raw && typeof raw === 'object' ? (raw as ShareScope) : defaultScope()
  return {
    assignments: value.assignments !== false,
    trend: value.trend !== false,
    journal: value.journal !== false,
  }
}

function asInvite(tokenId: string, data: Record<string, unknown>): Invite {
  const status = data.status === 'claimed' || data.status === 'confirmed' ? data.status : 'open'
  return {
    token: tokenId,
    patientUid: String(data.patientUid ?? ''),
    patientEmail: String(data.patientEmail ?? ''),
    therapistUid: typeof data.therapistUid === 'string' ? data.therapistUid : null,
    therapistEmail: typeof data.therapistEmail === 'string' ? data.therapistEmail : null,
    createdAt: String(data.createdAt ?? ''),
    expiresAtMs: Number(data.expiresAtMs ?? 0),
    status,
    linkId: typeof data.linkId === 'string' ? data.linkId : undefined,
  }
}

function asLink(id: string, data: Record<string, unknown>): CareLink {
  const patientUid = String(data.patientUid ?? '')
  const therapistUid = String(data.therapistUid ?? '')
  const members = Array.isArray(data.members)
    ? data.members.map((item) => String(item))
    : [patientUid, therapistUid].filter(Boolean)
  return {
    id,
    patientUid,
    patientEmail: String(data.patientEmail ?? ''),
    therapistUid,
    therapistEmail: String(data.therapistEmail ?? ''),
    scope: asScope(data.scope),
    createdAt: String(data.createdAt ?? ''),
    revoked: Boolean(data.revoked),
    members,
  }
}

export function inviteUrl(inviteToken: string) {
  return `${window.location.origin}/join/${inviteToken}`
}

export async function createInvite(patientUid: string, patientEmail: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const id = token()
  const now = Date.now()
  const payload: Omit<Invite, 'token'> & { therapistUid: null; therapistEmail: null } = {
    patientUid,
    patientEmail,
    therapistUid: null,
    therapistEmail: null,
    createdAt: new Date(now).toISOString(),
    expiresAtMs: now + INVITE_MS,
    status: 'open',
  }
  await setDoc(doc(db, 'invites', id), payload)
  return { ...payload, token: id }
}

export function listenInvite(inviteToken: string, onValue: (invite: Invite | null) => void) {
  const db = getFirebaseDb()
  if (!db) {
    onValue(null)
    return () => {}
  }
  return onSnapshot(doc(db, 'invites', inviteToken), (snap) => {
    onValue(snap.exists() ? asInvite(snap.id, snap.data()) : null)
  })
}

export async function readInvite(inviteToken: string) {
  const db = getFirebaseDb()
  if (!db) return null
  const snap = await getDoc(doc(db, 'invites', inviteToken))
  return snap.exists() ? asInvite(snap.id, snap.data()) : null
}

export async function readLink(linkId: string) {
  const db = getFirebaseDb()
  if (!db) return null
  const snap = await getDoc(doc(db, 'links', linkId))
  if (!snap.exists()) return null
  const link = asLink(snap.id, snap.data())
  return link.revoked ? null : link
}

export function rememberTherapistLink(link: CareLink) {
  const current = useShareStore.getState().therapistLinks
  if (current.some((item) => item.id === link.id)) return
  useShareStore.getState().setTherapistLinks([...current, link])
}

export async function claimInvite(inviteToken: string, therapistUid: string, therapistEmail: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const invite = await readInvite(inviteToken)
  if (!invite || invite.status !== 'open' || invite.expiresAtMs < Date.now()) {
    throw new Error('invite.expired')
  }
  if (invite.patientUid === therapistUid) throw new Error('invite.self')
  await updateDoc(doc(db, 'invites', inviteToken), {
    therapistUid,
    therapistEmail,
    status: 'claimed',
  })
}

export async function confirmInvite(invite: Invite, scope: ShareScope) {
  const db = getFirebaseDb()
  if (!db || !invite.therapistUid) throw new Error('auth.noFirebase')
  const id = createId()
  const createdAt = new Date().toISOString()
  const link: Omit<CareLink, 'id'> = {
    patientUid: invite.patientUid,
    patientEmail: invite.patientEmail,
    therapistUid: invite.therapistUid,
    therapistEmail: invite.therapistEmail ?? '',
    scope,
    createdAt,
    revoked: false,
    members: [invite.patientUid, invite.therapistUid],
  }
  await setDoc(doc(db, 'links', id), link)
  await setDoc(doc(db, 'shareNotes', id), {
    patientUid: invite.patientUid,
    therapistUid: invite.therapistUid,
    pendingAssignments: [],
    comments: [],
  })
  await updateDoc(doc(db, 'invites', invite.token), { status: 'confirmed', linkId: id })
  return { id, ...link }
}

export async function revokeLink(linkId: string) {
  const db = getFirebaseDb()
  if (!db) return
  await updateDoc(doc(db, 'links', linkId), { revoked: true })
}

export async function updateLinkScope(linkId: string, scope: ShareScope) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  await updateDoc(doc(db, 'links', linkId), { scope })
}

function activeLinks(docs: { id: string; data: () => object }[]) {
  return docs.map((item) => asLink(item.id, item.data() as Record<string, unknown>)).filter((item) => !item.revoked)
}

async function listLinks(field: 'patientUid' | 'therapistUid' | 'members', uid: string) {
  const db = getFirebaseDb()
  if (!db) return []
  const filter = field === 'members' ? where('members', 'array-contains', uid) : where(field, '==', uid)
  const snap = await getDocs(query(collection(db, 'links'), filter))
  return activeLinks(snap.docs)
}

function hasMembers(link: CareLink) {
  return link.members.includes(link.patientUid) && link.members.includes(link.therapistUid)
}

async function patchLinkMembers(link: CareLink) {
  const db = getFirebaseDb()
  if (!db || hasMembers(link)) return
  await updateDoc(doc(db, 'links', link.id), { members: [link.patientUid, link.therapistUid] })
}

function publishLinks(uid: string, groups: CareLink[][]) {
  const byId = new Map<string, CareLink>()
  for (const item of groups.flat()) byId.set(item.id, item)
  const all = [...byId.values()]
  const patientLinks = all.filter((item) => item.patientUid === uid)
  useShareStore.getState().setPatientLinks(patientLinks)
  useShareStore.getState().setTherapistLinks(all.filter((item) => item.therapistUid === uid))
  for (const link of patientLinks) {
    if (!hasMembers(link)) void patchLinkMembers(link)
  }
}

export async function refreshLinks(uid: string) {
  const groups = await Promise.all([
    listLinks('patientUid', uid).catch(() => []),
    listLinks('therapistUid', uid).catch(() => []),
    listLinks('members', uid).catch(() => []),
  ])
  publishLinks(uid, groups)
  return {
    patientLinks: useShareStore.getState().patientLinks,
    therapistLinks: useShareStore.getState().therapistLinks,
  }
}

export function listenLinks(uid: string) {
  const db = getFirebaseDb()
  if (!db || !uid) {
    useShareStore.getState().clearShare()
    return () => {}
  }
  const groups: CareLink[][] = [[], [], []]
  const publish = () => {
    publishLinks(uid, groups)
    if (useShareStore.getState().patientLinks.length > 0) {
      void consumeTherapistNotes(uid).then(() => pushShareSnapshots(uid))
    }
  }
  const watch = (index: number, filter: ReturnType<typeof where>) =>
    onSnapshot(
      query(collection(db, 'links'), filter),
      (snap) => {
        groups[index] = activeLinks(snap.docs)
        publish()
      },
      () => publish(),
    )
  const stop = [
    watch(0, where('patientUid', '==', uid)),
    watch(1, where('therapistUid', '==', uid)),
    watch(2, where('members', 'array-contains', uid)),
  ]
  return () => stop.forEach((item) => item())
}

function snapshotFromCare(link: CareLink, care: CareSnapshot, patientName?: string): ShareSnapshot {
  return {
    patientUid: link.patientUid,
    therapistUid: link.therapistUid,
    patientEmail: link.patientEmail,
    scope: link.scope,
    updatedAt: new Date().toISOString(),
    checkIns: link.scope.trend ? care.checkIns.filter((item) => isThisWeek(item.date)) : [],
    journal: link.scope.journal
      ? care.journal.filter((item) => item.shareWithSpecialist && isThisWeek(item.at.slice(0, 10)))
      : [],
    assignments: link.scope.assignments ? care.assignments.filter((item) => isThisWeek(item.createdAt.slice(0, 10))) : [],
    practices: care.practices.filter((item) => isThisWeek(item.at.slice(0, 10))),
    sessionNote: care.sessionNote,
    ...(patientName !== undefined ? { patientName } : {}),
  }
}

export async function pushShareSnapshots(uid: string, patientName?: string) {
  const db = getFirebaseDb()
  if (!db) return
  const links = useShareStore.getState().patientLinks.filter((item) => item.patientUid === uid && !item.revoked)
  const care = useCareStore.getState()
  await Promise.all(
    links.map((link) => setDoc(doc(db, 'shares', link.id), snapshotFromCare(link, care, patientName), { merge: true })),
  )
}

async function applyShareNotes(linkId: string, data: ShareNotes) {
  const db = getFirebaseDb()
  if (!db) return
  const comments = Array.isArray(data.comments) ? data.comments : []
  const merged = new Map(useShareStore.getState().comments.map((item) => [item.id, item]))
  for (const item of comments) merged.set(item.id, item)
  useShareStore.getState().setComments([...merged.values()])
  const pending = Array.isArray(data.pendingAssignments) ? data.pendingAssignments : []
  if (pending.length === 0) return
  const leftover: PendingAssignment[] = []
  for (const item of pending) {
    const ok = useCareStore.getState().addAssignment(item.techniqueId, {
      id: item.id,
      therapistNote: item.therapistNote,
    })
    if (!ok) leftover.push(item)
  }
  if (leftover.length !== pending.length) {
    await setDoc(doc(db, 'shareNotes', linkId), { ...data, pendingAssignments: leftover })
  }
}

export async function consumeTherapistNotes(uid: string) {
  const db = getFirebaseDb()
  if (!db) return
  const links = useShareStore.getState().patientLinks.filter((item) => item.patientUid === uid && !item.revoked)
  for (const link of links) {
    const snap = await getDoc(doc(db, 'shareNotes', link.id))
    if (!snap.exists()) continue
    await applyShareNotes(link.id, snap.data() as ShareNotes)
  }
}

export function listenPatientNotes() {
  const stops = new Map<string, () => void>()
  const attach = () => {
    const links = useShareStore.getState().patientLinks.filter((item) => !item.revoked)
    const ids = new Set(links.map((item) => item.id))
    for (const [id, stop] of stops) {
      if (ids.has(id)) continue
      stop()
      stops.delete(id)
    }
    for (const link of links) {
      if (stops.has(link.id)) continue
      stops.set(
        link.id,
        listenNotes(link.id, (notes) => {
          if (notes) void applyShareNotes(link.id, notes)
        }),
      )
    }
  }
  const unsub = useShareStore.subscribe((state, prev) => {
    if (state.patientLinks === prev.patientLinks) return
    attach()
  })
  attach()
  return () => {
    unsub()
    for (const stop of stops.values()) stop()
    stops.clear()
  }
}

export function listenShare(linkId: string, onValue: (share: ShareSnapshot | null) => void) {
  const db = getFirebaseDb()
  if (!db) {
    onValue(null)
    return () => {}
  }
  return onSnapshot(doc(db, 'shares', linkId), (snap) => {
    onValue(snap.exists() ? (snap.data() as ShareSnapshot) : null)
  })
}

export function listenNotes(linkId: string, onValue: (notes: ShareNotes | null) => void) {
  const db = getFirebaseDb()
  if (!db) {
    onValue(null)
    return () => {}
  }
  return onSnapshot(doc(db, 'shareNotes', linkId), (snap) => {
    onValue(snap.exists() ? (snap.data() as ShareNotes) : null)
  })
}

export async function addPendingAssignment(link: CareLink, techniqueId: string, therapistNote: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const snap = await getDoc(doc(db, 'shareNotes', link.id))
  const current = snap.exists() ? (snap.data() as ShareNotes) : null
  const next: PendingAssignment = {
    id: createId(),
    techniqueId,
    therapistNote,
    createdAt: new Date().toISOString(),
  }
  await setDoc(doc(db, 'shareNotes', link.id), {
    patientUid: link.patientUid,
    therapistUid: link.therapistUid,
    comments: current?.comments ?? [],
    pendingAssignments: [...(current?.pendingAssignments ?? []), next],
  })
}

export async function addTherapistComment(link: CareLink, text: string) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  const snap = await getDoc(doc(db, 'shareNotes', link.id))
  const current = snap.exists() ? (snap.data() as ShareNotes) : null
  const next: TherapistComment = { id: createId(), at: new Date().toISOString(), text }
  await setDoc(doc(db, 'shareNotes', link.id), {
    patientUid: link.patientUid,
    therapistUid: link.therapistUid,
    pendingAssignments: current?.pendingAssignments ?? [],
    comments: [...(current?.comments ?? []), next],
  })
}

export async function syncPatientShares(uid: string, patientName?: string) {
  await refreshLinks(uid)
  await consumeTherapistNotes(uid)
  await pushShareSnapshots(uid, patientName)
}
