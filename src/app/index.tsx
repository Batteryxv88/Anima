import { useEffect, type ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import {
  listenLinks,
  listenPatientNotes,
  pullCare,
  pushCare,
  pushShareSnapshots,
  useCareStore,
  useShareStore,
} from '@/entities/care'
import { listenDayCards } from '@/entities/day-card'
import { listenForYou } from '@/entities/for-you'
import { listenTechniqueStats, listenTechniques } from '@/entities/technique'
import { listenAuth, pullProfile, pushProfile, useUserStore } from '@/entities/user'
import { isCloudLocked } from '@/shared/lib'
import { i18n } from '@/shared/i18n'
import { router } from './routing'

function DocumentSync({ children }: { children: ReactNode }) {
  const language = useUserStore((state) => state.language)
  const theme = useUserStore((state) => state.theme)
  const largeText = useUserStore((state) => state.largeText)

  useEffect(() => {
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.text = largeText ? 'large' : 'normal'
  }, [largeText])

  return children
}

function CloudSync({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stopTechniques = listenTechniques()
    const stopStats = listenTechniqueStats()
    const stopForYou = listenForYou()
    const stopDayCards = listenDayCards()
    return () => {
      stopTechniques()
      stopStats()
      stopForYou()
      stopDayCards()
    }
  }, [])

  useEffect(() => {
    let timer = 0
    let stopLinks = () => {}
    let stopNotes = () => {}
    let wantProfile = false
    let wantCare = false
    const flush = () => {
      if (isCloudLocked()) return
      const { uid, profileSynced, displayName } = useUserStore.getState()
      if (!uid || !profileSynced) return
      const doProfile = wantProfile
      const doCare = wantCare
      wantProfile = false
      wantCare = false
      if (doProfile) void pushProfile(uid)
      if (doCare) {
        void pushCare(uid)
        if (useShareStore.getState().patientLinks.length > 0) {
          void pushShareSnapshots(uid, displayName.trim())
        }
      }
    }
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(flush, 500)
    }
    const stopAuth = listenAuth(
      async (uid) => {
        stopLinks()
        stopNotes()
        await pullProfile(uid)
        await pullCare(uid)
        stopLinks = listenLinks(uid)
        stopNotes = listenPatientNotes()
      },
      () => {
        stopLinks()
        stopNotes()
        stopLinks = () => {}
        stopNotes = () => {}
        useShareStore.getState().clearShare()
      },
    )
    const stopUser = useUserStore.subscribe((state, prev) => {
      if (isCloudLocked()) return
      if (!state.uid || !state.profileSynced) return
      if (
        state.language !== prev.language ||
        state.theme !== prev.theme ||
        state.largeText !== prev.largeText ||
        state.country !== prev.country ||
        state.mode !== prev.mode ||
        state.displayName !== prev.displayName ||
        state.onboardingComplete !== prev.onboardingComplete ||
        state.email !== prev.email
      ) {
        wantProfile = true
        schedule()
      }
    })
    const stopCare = useCareStore.subscribe(() => {
      if (isCloudLocked()) return
      const { uid, profileSynced } = useUserStore.getState()
      if (!uid || !profileSynced) return
      wantCare = true
      schedule()
    })
    return () => {
      stopAuth()
      stopLinks()
      stopNotes()
      stopUser()
      stopCare()
      window.clearTimeout(timer)
    }
  }, [])

  return children
}

export function App() {
  return (
    <DocumentSync>
      <CloudSync>
        <RouterProvider router={router} />
      </CloudSync>
    </DocumentSync>
  )
}
