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
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useShareStore } from '@/entities/care'
import { useUserStore } from '@/entities/user'
import { APP_NAME, navItems } from '@/shared/config'
import { cn, practiceFrom } from '@/shared/lib'
import { NoticeLayer, useNotice, useReturnNotice } from '@/shared/ui'
import { NameStep } from './name-step'

const icons = {
  today: Home,
  skills: BookOpen,
  homework: NotebookPen,
  session: CalendarCheck,
  cabinet: ClipboardList,
  profile: CircleUserRound,
}

function mobileNavLabel(to: string, key: string, t: (key: string) => string) {
  if (to === '/today') return t('nav.home')
  return t(key)
}

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
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
  const items = isSpecialist
    ? [{ to: '/cabinet', key: 'nav.cabinet', icon: 'cabinet' as const }, ...navItems]
    : navItems
  const cabinetPerson = /\/cabinet\/.+/.test(location.pathname)
  const nested =
    location.pathname.startsWith('/skills/') ||
    location.pathname.startsWith('/today/for-you/') ||
    location.pathname === '/journal' ||
    location.pathname.startsWith('/join/') ||
    location.pathname.startsWith('/staff') ||
    cabinetPerson ||
    (!isSpecialist && location.pathname.startsWith('/cabinet'))
  const skillEditor =
    location.pathname === '/skills/new' || /^\/skills\/[^/]+\/edit$/.test(location.pathname)
  const backTo = skillEditor
    ? location.pathname === '/skills/new'
      ? '/skills'
      : location.pathname.replace(/\/edit$/, '')
    : location.pathname.startsWith('/today/for-you/')
      ? '/today'
      : location.pathname.startsWith('/skills/')
        ? practiceFrom(location.state)
        : cabinetPerson
        ? '/cabinet'
        : location.pathname.startsWith('/staff') ||
            location.pathname.startsWith('/cabinet') ||
            location.pathname.startsWith('/join/')
          ? '/profile'
          : '/today'

  return (
    <div className="anima-shell-bg min-h-dvh text-ink">
      <NoticeLayer notice={returned.notice} onClose={returned.hide} />
      <NoticeLayer notice={nameNotice.notice} onClose={nameNotice.hide} />
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-line bg-card/80 p-4 lg:flex lg:flex-col">
        <Link to="/today" className="block px-2 pb-6 text-lg font-medium tracking-tight text-ink">
          {APP_NAME}
        </Link>
        {isSpecialist ? (
          <p className="mb-4 px-2 text-xs leading-relaxed text-plum">{t('invite.asSpecialist')}</p>
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
        <header className="sticky top-0 z-10 hidden h-14 items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur-sm lg:flex print:hidden">
          <div className="flex min-w-0 items-center gap-2">
            {nested ? (
              <Link to={backTo} className="text-sm text-plum">
                {t('nav.back')}
              </Link>
            ) : (
              <Link to="/today" className="truncate text-base font-medium text-ink">
                {APP_NAME}
              </Link>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-1">
            {isSpecialist ? (
              <Link
                to="/cabinet"
                className="mr-1 max-w-[11rem] truncate rounded-full bg-plum/12 px-3 py-1.5 text-xs text-plum lg:max-w-none"
                title={t('invite.asSpecialist')}
              >
                {t('invite.asSpecialist')}
              </Link>
            ) : null}
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-xl px-4 py-6 pb-24 lg:max-w-4xl lg:pb-10 md:max-w-3xl">
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
          isSpecialist ? 'grid-cols-6' : 'grid-cols-5',
        )}
      >
        {items.map((item) => {
          const Icon = icons[item.icon]
          const compact = isSpecialist
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-center leading-tight',
                  compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]',
                  isActive ? 'text-plum' : 'text-muted',
                )
              }
            >
              <Icon size={compact ? 18 : 20} strokeWidth={1.75} className="shrink-0" />
              <span className="w-full truncate">{mobileNavLabel(item.to, item.key, t)}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
