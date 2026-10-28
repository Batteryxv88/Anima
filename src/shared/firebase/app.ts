import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

export function isFirebaseConfigured() {
  return Boolean(import.meta.env.VITE_FIREBASE_API_KEY)
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null
  if (!app) {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    })
  }
  return app
}

export function getFirebaseAuth() {
  const instance = getFirebaseApp()
  if (!instance) return null
  if (!auth) auth = getAuth(instance)
  return auth
}

export function getFirebaseDb() {
  const instance = getFirebaseApp()
  if (!instance) return null
  if (!db) db = getFirestore(instance)
  return db
}
