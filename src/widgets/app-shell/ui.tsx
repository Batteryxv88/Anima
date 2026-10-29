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
}

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  const returned = useReturnNotice(t('common.savedNotice'), t('skill.saved'))
  const nameNotice = useNotice()
  const uid = useUserStore((state) => state.uid)
  const authReady = useUserStore((state) => state.authReady)
  const displayName = useUserStore((state) => state.displayName)
  const needName = authReady && Boolean(uid) && !displayName.trim() && location.pathname !== '/crisis'
  const isSpecialist = useShareStore((state) => state.therapistLinks.length > 0)
  const items = isSpecialist
    ? [{ to: '/cabinet', key: 'nav.cabinet', icon: 'cabinet' as const }, ...navItems]
    : navItems
  const cabinetPerson = /\/cabinet\/.+/.test(location.pathname)
  const nested =
    location.pathname.startsWith('/skills/') ||
    location.pathname === '/journal' ||
    location.pathname === '/paths' ||
    location.pathname.startsWith('/join/') ||
    location.pathname.startsWith('/staff') ||
    cabinetPerson ||
    (!isSpecialist && location.pathname.startsWith('/cabinet'))
  const backTo = location.pathname.startsWith('/skills/')
    ? practiceFrom(location.state)
    : cabinetPerson
      ? '/cabinet'
      : location.pathname.startsWith('/staff/techniques/')
        ? '/staff/techniques'
        : location.pathname.startsWith('/staff') ||
            location.pathname.startsWith('/cabinet') ||
            location.pathname.startsWith('/join/')
          ? '/profile'
          : '/today'

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <NoticeLayer notice={returned.notice} onClose={returned.hide} />
      <NoticeLayer notice={nameNotice.notice} onClose={nameNotice.hide} />
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-line bg-card/80 p-4 md:flex md:flex-col">
        <p className="px-2 pb-6 text-lg font-medium tracking-tight">{APP_NAME}</p>
        {isSpecialist ? (
          <p className="mb-4 px-2 text-xs leading-relaxed text-sage-deep">{t('invite.asSpecialist')}</p>
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
                    isActive ? 'bg-sage/15 text-sage-deep' : 'text-muted hover:bg-canvas hover:text-ink',
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

      <div className="md:pl-56">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur-sm print:hidden">
          <div className="flex min-w-0 items-center gap-2">
            {nested ? (
              <Link to={backTo} className="text-sm text-sage-deep">
                {t('nav.back')}
              </Link>
            ) : (
              <span className="truncate text-base font-medium md:hidden">{APP_NAME}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isSpecialist ? (
              <Link
                to="/cabinet"
                className="mr-1 max-w-[11rem] truncate rounded-full bg-sage/15 px-3 py-1.5 text-xs text-sage-deep md:max-w-none"
                title={t('invite.asSpecialist')}
              >
                <span className="sm:hidden">{t('invite.roleSpecialist')}</span>
                <span className="hidden sm:inline">{t('invite.asSpecialist')}</span>
              </Link>
            ) : null}
            <Link
              to="/crisis"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-terra md:hidden"
              aria-label={t('nav.crisis')}
            >
              <LifeBuoy size={20} strokeWidth={1.75} />
            </Link>
            <Link
              to="/profile"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted hover:bg-card hover:text-ink"
              aria-label={t('nav.profile')}
            >
              <CircleUserRound size={22} strokeWidth={1.75} />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-xl px-4 py-6 pb-24 md:max-w-3xl md:pb-10 lg:max-w-4xl">
          {needName ? (
            <NameStep onSaved={() => nameNotice.show(t('common.savedNotice'), t('name.saved'))} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      <nav
        className={cn(
          'fixed inset-x-0 bottom-0 z-10 grid border-t border-line bg-card/95 px-1 py-1 backdrop-blur-sm md:hidden print:hidden',
          isSpecialist ? 'grid-cols-5' : 'grid-cols-4',
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
                  isActive ? 'text-sage-deep' : 'text-muted',
                )
              }
            >
              <Icon size={20} strokeWidth={1.75} className="shrink-0" />
              <span className="w-full">{t(item.key)}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
