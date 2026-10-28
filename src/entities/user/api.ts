import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/shared/firebase'
import { FOUNDER_EMAIL, type StaffRole } from '@/shared/config'
import { withCloudLock } from '@/shared/lib'
import { pickRole, useUserStore } from './model'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

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

export async function signInGoogle() {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('auth.noFirebase')
  try {
    await signInWithPopup(auth, googleProvider)
  } catch (error) {
    const code = errorCode(error)
    if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, googleProvider)
      return
    }
    throw error
  }
}

export async function signOutUser() {
  const auth = getFirebaseAuth()
  if (auth) await signOut(auth)
  useUserStore.getState().setSession(null)
}

export async function pullProfile(uid: string) {
  const db = getFirebaseDb()
  if (!db) return
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) {
    await pushProfile(uid)
    return
  }
  withCloudLock(() => useUserStore.getState().applyProfile(snap.data()))
}

export async function pushProfile(uid: string) {
  const db = getFirebaseDb()
  if (!db) return
  const state = useUserStore.getState()
  await setDoc(
    doc(db, 'users', uid),
    {
      language: state.language,
      theme: state.theme,
      largeText: state.largeText,
      country: state.country,
      mode: state.mode,
      displayName: state.displayName,
      onboardingComplete: state.onboardingComplete,
      email: (state.email ?? '').trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
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
  void getRedirectResult(auth).catch(() => undefined)
  return onAuthStateChanged(auth, (user) => {
    void (async () => {
      try {
        if (!user) {
          useUserStore.getState().setSession(null)
          onSignedOut?.()
          return
        }
        useUserStore.getState().setSession({ uid: user.uid, email: user.email })
        await pullRole(user.uid, user.email)
        await onSignedIn(user.uid)
      } finally {
        useUserStore.getState().setAuthReady(true)
      }
    })()
  })
}
