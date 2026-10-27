import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
import { CrisisPage } from '@/pages/crisis'
import { HomeworkPage } from '@/pages/homework'
import { OnboardingPage } from '@/pages/onboarding'
import { ProfilePage } from '@/pages/profile'
import { SessionPage } from '@/pages/session'
import { SkillPage } from '@/pages/skill'
import { SkillsPage } from '@/pages/skills'
import { TodayPage } from '@/pages/today'
import { AppShell } from '@/widgets/app-shell'

function RequireOnboarding() {
  const done = useUserStore((state) => state.onboardingComplete)
  if (!done) return <Navigate to="/onboarding" replace />
  return <AppShell />
}

function SkipIfDone() {
  const done = useUserStore((state) => state.onboardingComplete)
  if (done) return <Navigate to="/today" replace />
  return <OnboardingPage />
}

export const router = createBrowserRouter([
  { path: '/onboarding', element: <SkipIfDone /> },
  {
    element: <RequireOnboarding />,
    children: [
      { path: '/', element: <Navigate to="/today" replace /> },
      { path: '/today', element: <TodayPage /> },
      { path: '/skills', element: <SkillsPage /> },
      { path: '/skills/:id', element: <SkillPage /> },
      { path: '/homework', element: <HomeworkPage /> },
      { path: '/session', element: <SessionPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/crisis', element: <CrisisPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/today" replace /> },
])
