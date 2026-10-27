import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type CareMode,
  type Country,
  type Locale,
  type Theme,
} from '@/shared/config'

type UserState = {
  onboardingComplete: boolean
  language: Locale
  theme: Theme
  largeText: boolean
  country: Country
  mode: CareMode
  displayName: string
  completeOnboarding: () => void
  setLanguage: (language: Locale) => void
  setTheme: (theme: Theme) => void
  setLargeText: (largeText: boolean) => void
  setCountry: (country: Country) => void
  setMode: (mode: CareMode) => void
}

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
      completeOnboarding: () => set({ onboardingComplete: true }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setLargeText: (largeText) => set({ largeText }),
      setCountry: (country) => set({ country }),
      setMode: (mode) => set({ mode }),
    }),
    { name: 'anima-user' },
  ),
)
