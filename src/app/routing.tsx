import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
import { AuthPage } from '@/pages/auth'
import { CabinetPage } from '@/pages/cabinet'
import { CrisisPage } from '@/pages/crisis'
import { HomeworkPage } from '@/pages/homework'
import { JoinPage } from '@/pages/join'
import { JournalPage } from '@/pages/journal'
import { OnboardingPage } from '@/pages/onboarding'
import { PathsPage } from '@/pages/paths'
import { ProfilePage } from '@/pages/profile'
import { SessionPage } from '@/pages/session'
import { SkillPage } from '@/pages/skill'
import { SkillsPage } from '@/pages/skills'
import { StaffCatalogPage, StaffHome, StaffLayout, StaffRolesPage, StaffTechniquePage } from '@/pages/staff'
import { TodayPage } from '@/pages/today'
import { AppShell } from '@/widgets/app-shell'

function RequireOnboarding() {
  const done = useUserStore((state) => state.onboardingComplete)
  if (!done) return <Navigate to="/onboarding" replace />
  return <AppShell />
}

function AuthGate() {
  const done = useUserStore((state) => state.onboardingComplete)
  if (!done) return <Navigate to="/onboarding" replace />
  return <AuthPage />
}

function SkipIfDone() {
  const done = useUserStore((state) => state.onboardingComplete)
  if (done) return <Navigate to="/today" replace />
  return <OnboardingPage />
}

export const router = createBrowserRouter([
  { path: '/onboarding', element: <SkipIfDone /> },
  { path: '/auth', element: <AuthGate /> },
  {
    element: <RequireOnboarding />,
    children: [
      { path: '/', element: <Navigate to="/today" replace /> },
      { path: '/today', element: <TodayPage /> },
      { path: '/skills', element: <SkillsPage /> },
      { path: '/skills/:id', element: <SkillPage /> },
      { path: '/homework', element: <HomeworkPage /> },
      { path: '/journal', element: <JournalPage /> },
      { path: '/session', element: <SessionPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/crisis', element: <CrisisPage /> },
      { path: '/paths', element: <PathsPage /> },
      { path: '/join/:token', element: <JoinPage /> },
      { path: '/cabinet', element: <CabinetPage /> },
      { path: '/cabinet/:linkId', element: <CabinetPage /> },
      {
        path: '/staff',
        element: <StaffLayout />,
        children: [
          { index: true, element: <StaffHome /> },
          { path: 'roles', element: <StaffRolesPage /> },
          { path: 'techniques', element: <StaffCatalogPage /> },
          { path: 'techniques/new', element: <StaffTechniquePage /> },
          { path: 'techniques/:id', element: <StaffTechniquePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/today" replace /> },
])
