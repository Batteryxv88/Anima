import { useEffect } from 'react'
import {
  BookOpen,
  CalendarCheck,
  CircleUserRound,
  ClipboardList,
  Home,
  LifeBuoy,
  NotebookPen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useShareStore } from '@/entities/care'
import { useUserStore } from '@/entities/user'
import { APP_NAME, navItems } from '@/shared/config'
import { cn } from '@/shared/lib'
import { NoticeLayer, useNotice, useReturnNotice } from '@/shared/ui'
import { NameStep } from './name-step'
import { shellModeForPath, useShellMode, type ShellMode } from './shell-mode'

const icons = {
  today: Home,
  skills: BookOpen,
  homework: NotebookPen,
  session: CalendarCheck,
  cabinet: ClipboardList,
  profile: CircleUserRound,
}

type NavIcon = keyof typeof icons

const practiceNavItems: { to: string; key: string; icon: NavIcon }[] = [
  { to: '/cabinet', key: 'nav.patients', icon: 'cabinet' },
  { to: '/profile', key: 'nav.profile', icon: 'profile' },
]

function ShellSwitch({ mode, onPick }: { mode: ShellMode; onPick: (mode: ShellMode) => void }) {
  const { t } = useTranslation()
  const options = [
    { id: 'self' as const, label: t('nav.forSelf') },
    { id: 'practice' as const, label: t('nav.cabinet') },
  ]

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1">
      {options.map((option) => {
        const selected = mode === option.id
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            className={cn(
              'min-h-9 rounded-lg px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/50',
              selected ? 'bg-card text-plum' : 'text-muted',
            )}
            onClick={() => onPick(option.id)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const returned = useReturnNotice(t('common.savedNotice'), t('skill.saved'))
  const nameNotice = useNotice()
  const uid = useUserStore((state) => state.uid)
  const authReady = useUserStore((state) => state.authReady)
  const profileSynced = useUserStore((state) => state.profileSynced)
  const displayName = useUserStore((state) => state.displayName)
  const needName =
    authReady &&
    profileSynced &&
    Boolean(uid) &&
    !displayName.trim() &&
    location.pathname !== '/crisis'
  const isSpecialist = useShareStore((state) => state.therapistLinks.length > 0)
  const storedMode = useShellMode((state) => state.mode)
  const setShellMode = useShellMode((state) => state.setMode)
  const pathMode = shellModeForPath(location.pathname)
  const mode: ShellMode = isSpecialist ? (pathMode ?? storedMode) : 'self'
  const items = mode === 'practice' ? practiceNavItems : navItems
  const homeTo = mode === 'practice' ? '/cabinet' : '/today'

  useEffect(() => {
    if (!isSpecialist || !pathMode) return
    setShellMode(pathMode)
  }, [isSpecialist, pathMode, setShellMode])

  const pickMode = (next: ShellMode) => {
    setShellMode(next)
    navigate(next === 'practice' ? '/cabinet' : '/today')
  }

  return (
    <div className="anima-shell-bg min-h-dvh text-ink">
      <NoticeLayer notice={returned.notice} onClose={returned.hide} />
      <NoticeLayer notice={nameNotice.notice} onClose={nameNotice.hide} />
      {isSpecialist ? (
        <div className="fixed inset-x-0 top-0 z-20 border-b border-line bg-card/95 px-4 py-2 backdrop-blur-sm lg:hidden print:hidden">
          <ShellSwitch mode={mode} onPick={pickMode} />
        </div>
      ) : null}
      <aside className="fixed inset-y-0 left-0 hidden w-56 bg-card/80 p-4 lg:flex lg:flex-col">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 translate-x-full bg-gradient-to-r from-card/50 to-transparent"
        />
        <Link
          to={homeTo}
          className={cn(
            'block px-2 text-lg font-medium tracking-tight text-ink',
            isSpecialist ? 'pb-4' : 'pb-6',
          )}
        >
          {APP_NAME}
        </Link>
        {isSpecialist ? (
          <div className="mb-4">
            <ShellSwitch mode={mode} onPick={pickMode} />
          </div>
        ) : null}
        <nav className="grid gap-1">
          {items.map((item) => {
            const Icon = icons[item.icon]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm',
                    isActive ? 'bg-plum/12 text-plum' : 'text-muted hover:bg-canvas hover:text-ink',
                  )
                }
              >
                <Icon size={18} strokeWidth={1.75} />
                {t(item.key)}
              </NavLink>
            )
          })}
        </nav>
        <Link
          to="/crisis"
          className="mt-auto flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-terra hover:bg-terra/10"
        >
          <LifeBuoy size={18} strokeWidth={1.75} />
          {t('nav.crisis')}
        </Link>
      </aside>

      <div className="lg:pl-56">
        <main
          className={cn(
            'mx-auto w-full min-w-0 max-w-xl px-4 pb-24 md:max-w-3xl lg:max-w-4xl lg:pt-6 lg:pb-10',
            isSpecialist ? 'pt-20' : 'pt-4',
          )}
        >
          {needName ? (
            <NameStep onSaved={() => nameNotice.show(t('common.savedNotice'), t('name.saved'))} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-10 grid border-t border-line bg-card/95 px-0.5 py-1 backdrop-blur-sm lg:hidden print:hidden',
          mode === 'practice' ? 'grid-cols-2' : 'grid-cols-5',
        )}
      >
        {items.map((item) => {
          const Icon = icons[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-center text-[10px] leading-tight sm:text-[11px]',
                  isActive ? 'text-plum' : 'text-muted',
                )
              }
            >
              <Icon size={20} strokeWidth={1.75} className="shrink-0" />
              <span className="w-full truncate">{t(item.key)}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
