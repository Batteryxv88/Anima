import { useEffect, type ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
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

export function App() {
  return (
    <DocumentSync>
      <RouterProvider router={router} />
    </DocumentSync>
  )
}
