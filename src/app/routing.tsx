import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
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
import { StaffHome, StaffLayout, StaffRolesPage, StaffTechniquePage } from '@/pages/staff'
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

function LegacyTechniqueEdit() {
  const { id } = useParams()
  return <Navigate to={id ? `/skills/${id}/edit` : '/skills'} replace />
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
      { path: '/skills/new', element: <StaffTechniquePage /> },
      { path: '/skills/:id/edit', element: <StaffTechniquePage /> },
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
          { path: 'techniques', element: <Navigate to="/skills" replace /> },
          { path: 'techniques/new', element: <Navigate to="/skills/new" replace /> },
          { path: 'techniques/:id', element: <LegacyTechniqueEdit /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/today" replace /> },
])
