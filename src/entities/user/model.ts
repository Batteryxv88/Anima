import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  careModes,
  countries,
  locales,
  staffRoles,
  themes,
  type CareMode,
  type Country,
  type Locale,
  type StaffRole,
  type Theme,
} from '@/shared/config'

export type Session = {
  uid: string
  email: string | null
}

type UserState = {
  onboardingComplete: boolean
  language: Locale
  theme: Theme
  largeText: boolean
  country: Country
  mode: CareMode
  displayName: string
  displayNameUid: string | null
  uid: string | null
  email: string | null
  role: StaffRole
  authReady: boolean
  profileSynced: boolean
  completeOnboarding: () => void
  setLanguage: (language: Locale) => void
  setTheme: (theme: Theme) => void
  setLargeText: (largeText: boolean) => void
  setCountry: (country: Country) => void
  setMode: (mode: CareMode) => void
  setDisplayName: (displayName: string) => void
  setSession: (session: Session | null) => void
  setRole: (role: StaffRole) => void
  setAuthReady: (authReady: boolean) => void
  setProfileSynced: (profileSynced: boolean) => void
  applyProfile: (data: Partial<UserState>) => void
}

function pickLocale(value: unknown, fallback: Locale): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : fallback
}

function pickTheme(value: unknown, fallback: Theme): Theme {
  return themes.includes(value as Theme) ? (value as Theme) : fallback
}

function pickCountry(value: unknown, fallback: Country): Country {
  return countries.includes(value as Country) ? (value as Country) : fallback
}

function pickMode(value: unknown, fallback: CareMode): CareMode {
  return careModes.includes(value as CareMode) ? (value as CareMode) : fallback
}

export function pickRole(value: unknown, fallback: StaffRole = 'user'): StaffRole {
  return staffRoles.includes(value as StaffRole) ? (value as StaffRole) : fallback
}

export function isStaffRole(role: StaffRole) {
  return role === 'admin' || role === 'superadmin'
}

const persistName = 'anima-user'

function readPersistedSession(): { uid: string | null; email: string | null } {
  if (typeof window === 'undefined') return { uid: null, email: null }
  try {
    const raw = localStorage.getItem(persistName)
    if (!raw) return { uid: null, email: null }
    const parsed = JSON.parse(raw) as { state?: { uid?: unknown; email?: unknown } }
    const uid = typeof parsed.state?.uid === 'string' && parsed.state.uid ? parsed.state.uid : null
    const email = typeof parsed.state?.email === 'string' ? parsed.state.email : null
    return { uid, email }
  } catch {
    return { uid: null, email: null }
  }
}

const cachedSession = readPersistedSession()

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      language: 'ru',
      theme: 'system',
      largeText: false,
      country: 'si',
      mode: 'self',
      displayName: '',
      displayNameUid: null,
      uid: cachedSession.uid,
      email: cachedSession.email,
      role: 'user',
      authReady: false,
      profileSynced: false,
      completeOnboarding: () => set({ onboardingComplete: true }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setLargeText: (largeText) => set({ largeText }),
      setCountry: (country) => set({ country }),
      setMode: (mode) => set({ mode }),
      setDisplayName: (displayName) =>
        set((state) => ({
          displayName: displayName.trim(),
          displayNameUid: state.uid,
        })),
      setSession: (session) =>
        set(() => {
          if (!session) {
            return {
              uid: null,
              email: null,
              role: 'user',
              profileSynced: false,
            }
          }
          return {
            uid: session.uid,
            email: session.email,
            role: 'user',
            profileSynced: false,
          }
        }),
      setRole: (role) => set({ role }),
      setAuthReady: (authReady) => set({ authReady }),
      setProfileSynced: (profileSynced) => set({ profileSynced }),
      applyProfile: (data) =>
        set((state) => {
          const fromCloud =
            typeof data.displayName === 'string' ? data.displayName.trim() : ''
          const displayName = fromCloud || (state.displayNameUid === state.uid ? state.displayName.trim() : '')
          return {
            language: pickLocale(data.language, state.language),
            theme: pickTheme(data.theme, state.theme),
            largeText: typeof data.largeText === 'boolean' ? data.largeText : state.largeText,
            country: pickCountry(data.country, state.country),
            mode: pickMode(data.mode, state.mode),
            displayName,
            displayNameUid: displayName.trim() ? state.uid : null,
            onboardingComplete:
              typeof data.onboardingComplete === 'boolean'
                ? data.onboardingComplete
                : state.onboardingComplete,
          }
        }),
    }),
    {
      name: persistName,
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        language: state.language,
        theme: state.theme,
        largeText: state.largeText,
        country: state.country,
        mode: state.mode,
        displayName: state.displayName,
        displayNameUid: state.displayNameUid,
        uid: state.uid,
        email: state.email,
      }),
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<UserState>) }),
    },
  ),
)
