import { useEffect, type ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import {
  consumeTherapistNotes,
  listenLinks,
  listenPatientNotes,
  pullCare,
  pushCare,
  pushShareSnapshots,
  useCareStore,
  useShareStore,
} from '@/entities/care'
import { listenTechniques } from '@/entities/technique'
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
  useEffect(() => listenTechniques(), [])

  useEffect(() => {
    let timer = 0
    let stopLinks = () => {}
    let stopNotes = () => {}
    const queue = () => {
      if (isCloudLocked()) return
      const uid = useUserStore.getState().uid
      if (!uid) return
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        void pushProfile(uid)
        void pushCare(uid)
        void pushShareSnapshots(uid)
        if (useShareStore.getState().patientLinks.length > 0) {
          void consumeTherapistNotes(uid)
        }
      }, 500)
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
    const stopUser = useUserStore.subscribe(queue)
    const stopCare = useCareStore.subscribe(queue)
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
