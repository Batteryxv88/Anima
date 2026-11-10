import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/shared/firebase'
import { FOUNDER_EMAIL, type StaffRole } from '@/shared/config'
import { useCareStore } from '@/entities/care/model'
import { ifPayloadChanged, rememberPayload, withCloudLock } from '@/shared/lib'
import { pickRole, useUserStore } from './model'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export const GOOGLE_REDIRECT_FLAG = 'anima-google-redirect'

function markGoogleRedirectPending() {
  try {
    sessionStorage.setItem(GOOGLE_REDIRECT_FLAG, '1')
  } catch {
    /* ignore */
  }
}

export function clearGoogleRedirectPending() {
  try {
    sessionStorage.removeItem(GOOGLE_REDIRECT_FLAG)
  } catch {
    /* ignore */
  }
}

export function isGoogleRedirectPending() {
  try {
    return sessionStorage.getItem(GOOGLE_REDIRECT_FLAG) === '1'
  } catch {
    return false
  }
}

function errorCode(error: unknown) {
  return typeof error === 'object' && error && 'code' in error ? String((error as { code: string }).code) : ''
}

export function authErrorKey(error: unknown) {
  const code = errorCode(error)
  if (code === 'auth/email-already-in-use') return 'auth.emailInUse'
  if (code === 'auth/invalid-email') return 'auth.invalidEmail'
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'auth.badCredential'
  }
  if (code === 'auth/weak-password') return 'auth.weakPassword'
  if (code === 'auth/too-many-requests') return 'auth.tooMany'
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'auth.popupClosed'
  if (code === 'auth/popup-blocked') return 'auth.popupBlocked'
  if (code === 'auth/operation-not-allowed') return 'auth.notEnabled'
  if (code === 'auth/unauthorized-domain') return 'auth.badDomain'
  return 'auth.failed'
}

export async function signInEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('auth.noFirebase')
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signUpEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('auth.noFirebase')
  await createUserWithEmailAndPassword(auth, email, password)
}

export function isStandalonePwa() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function prefersGoogleRedirect() {
  return isStandalonePwa()
}

export type GoogleSignInOutcome = 'redirect-started' | 'signed-in'

export async function signInGoogle(): Promise<GoogleSignInOutcome> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('auth.noFirebase')
  if (prefersGoogleRedirect()) {
    markGoogleRedirectPending()
    await signInWithRedirect(auth, googleProvider)
    return 'redirect-started'
  }
  try {
    await signInWithPopup(auth, googleProvider)
    clearGoogleRedirectPending()
    return 'signed-in'
  } catch (error) {
    const code = errorCode(error)
    if (code === 'auth/popup-blocked') {
      markGoogleRedirectPending()
      await signInWithRedirect(auth, googleProvider)
      return 'redirect-started'
    }
    throw error
  }
}

async function applySignedInUser(user: User, onSignedIn: (uid: string) => Promise<void>) {
  useUserStore.getState().setSession({ uid: user.uid, email: user.email })
  await pullRole(user.uid, user.email)
  await onSignedIn(user.uid)
  clearGoogleRedirectPending()
}

export async function completeAuthRedirect(onSignedIn: (uid: string) => Promise<void>) {
  const auth = getFirebaseAuth()
  if (!auth) return null
  if (!isGoogleRedirectPending()) return null
  try {
    const result = await getRedirectResult(auth)
    const user = result?.user ?? auth.currentUser
    if (user) {
      console.info('[auth] Google redirect completed', user.uid)
      await applySignedInUser(user, onSignedIn)
      return user
    }
    console.warn('[auth] Google redirect returned without a user session')
    return null
  } catch (error) {
    console.error('[auth] getRedirectResult failed', error)
    throw error
  }
}

export async function signOutUser() {
  const auth = getFirebaseAuth()
  if (auth) await signOut(auth)
  useCareStore.getState().clearSkillPrefs()
  useUserStore.getState().setSession(null)
}

function authDisplayName() {
  return getFirebaseAuth()?.currentUser?.displayName?.trim() ?? ''
}

export async function pullProfile(uid: string) {
  const db = getFirebaseDb()
  const authName = authDisplayName()
  if (!db) {
    if (authName) useUserStore.getState().applyProfile({ displayName: authName })
    useUserStore.getState().setProfileSynced(true)
    return
  }
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) {
      if (authName) useUserStore.getState().applyProfile({ displayName: authName })
      await pushProfile(uid)
      useUserStore.getState().setProfileSynced(true)
      return
    }
    const data = snap.data()
    const fromCloud = typeof data.displayName === 'string' ? data.displayName.trim() : ''
    withCloudLock(() =>
      useUserStore.getState().applyProfile({
        ...data,
        displayName: fromCloud || authName,
      }),
    )
    rememberPayload(`users:${uid}`, profileComparable())
    useUserStore.getState().setProfileSynced(true)
  } catch (error) {
    console.error('[auth] pullProfile failed', error)
  }
}

function profileComparable() {
  const state = useUserStore.getState()
  const payload: Record<string, unknown> = {
    language: state.language,
    theme: state.theme,
    largeText: state.largeText,
    country: state.country,
    mode: state.mode,
    onboardingComplete: state.onboardingComplete,
    email: (state.email ?? '').trim().toLowerCase(),
  }
  const name = state.displayName.trim()
  if (name) payload.displayName = name
  return payload
}

export async function pushProfile(uid: string) {
  const db = getFirebaseDb()
  if (!db) return
  const comparable = profileComparable()
  const name = typeof comparable.displayName === 'string' ? comparable.displayName : ''
  if (name) {
    const user = getFirebaseAuth()?.currentUser
    if (user && user.uid === uid && user.displayName !== name) {
      await updateProfile(user, { displayName: name })
    }
  }
  await ifPayloadChanged(`users:${uid}`, comparable, () =>
    setDoc(doc(db, 'users', uid), { ...comparable, updatedAt: new Date().toISOString() }, { merge: true }),
  )
}

export async function pullRole(uid: string, email: string | null) {
  const db = getFirebaseDb()
  const founder = (email ?? '').trim().toLowerCase() === FOUNDER_EMAIL
  if (founder) {
    useUserStore.getState().setRole('superadmin')
    if (db) {
      await setDoc(
        doc(db, 'roles', uid),
        { role: 'superadmin', email: FOUNDER_EMAIL, updatedAt: new Date().toISOString() },
        { merge: true },
      )
    }
    return
  }
  if (!db) {
    useUserStore.getState().setRole('user')
    return
  }
  const snap = await getDoc(doc(db, 'roles', uid))
  useUserStore.getState().setRole(snap.exists() ? pickRole(snap.data().role) : 'user')
}

export type StaffRecord = {
  uid: string
  email: string
  role: StaffRole
}

export async function listStaff(): Promise<StaffRecord[]> {
  const db = getFirebaseDb()
  if (!db) return []
  const snap = await getDocs(collection(db, 'roles'))
  return snap.docs.map((item) => {
    const data = item.data()
    return {
      uid: item.id,
      email: String(data.email ?? ''),
      role: pickRole(data.role),
    }
  })
}

export async function findUserByEmail(email: string) {
  const db = getFirebaseDb()
  if (!db) return null
  const needle = email.trim().toLowerCase()
  if (!needle) return null
  const snap = await getDocs(query(collection(db, 'users'), where('email', '==', needle)))
  const first = snap.docs[0]
  if (!first) return null
  return { uid: first.id, email: String(first.data().email ?? needle) }
}

export async function setStaffRole(uid: string, email: string, role: StaffRole) {
  const db = getFirebaseDb()
  if (!db) throw new Error('auth.noFirebase')
  if ((email ?? '').trim().toLowerCase() === FOUNDER_EMAIL && role !== 'superadmin') {
    throw new Error('staff.founderLocked')
  }
  if (role === 'user') {
    await deleteDoc(doc(db, 'roles', uid))
    return
  }
  await setDoc(doc(db, 'roles', uid), {
    role,
    email: email.trim().toLowerCase(),
    updatedAt: new Date().toISOString(),
  })
}

export function listenAuth(onSignedIn: (uid: string) => Promise<void>, onSignedOut?: () => void) {
  const auth = getFirebaseAuth()
  if (!auth) {
    useUserStore.getState().setAuthReady(true)
    return () => {}
  }

  let stop = () => {}
  let redirectHandled = false

  void (async () => {
    useUserStore.getState().setAuthReady(false)
    try {
      const user = await completeAuthRedirect(onSignedIn)
      redirectHandled = Boolean(user)
    } catch {
      // logged in completeAuthRedirect
    }

    stop = onAuthStateChanged(auth, (user) => {
      void (async () => {
        try {
          if (!user) {
            useUserStore.getState().setSession(null)
            onSignedOut?.()
            return
          }
          if (redirectHandled && useUserStore.getState().uid === user.uid) {
            return
          }
          await applySignedInUser(user, onSignedIn)
        } finally {
          useUserStore.getState().setAuthReady(true)
        }
      })()
    })
  })()

  return () => stop()
}
