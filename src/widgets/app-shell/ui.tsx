import {
  BookOpen,
  CalendarCheck,
  CircleUserRound,
  Home,
  LifeBuoy,
  NotebookPen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { APP_NAME, navItems } from '@/shared/config'
import { cn } from '@/shared/lib'

const icons = {
  today: Home,
  skills: BookOpen,
  homework: NotebookPen,
  session: CalendarCheck,
}

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  const showBack = location.pathname.startsWith('/skills/')

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-line bg-card/80 p-4 md:flex md:flex-col">
        <p className="px-2 pb-6 text-lg font-medium tracking-tight">{APP_NAME}</p>
        <nav className="grid gap-1">
          {navItems.map((item) => {
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
            {showBack ? (
              <Link to="/skills" className="text-sm text-sage-deep">
                {t('nav.back')}
              </Link>
            ) : (
              <span className="truncate text-base font-medium md:hidden">{APP_NAME}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
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

        <main className="mx-auto w-full max-w-xl px-4 py-6 pb-24 md:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-card/95 px-1 py-1 backdrop-blur-sm md:hidden print:hidden">
        {navItems.map((item) => {
          const Icon = icons[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px]',
                  isActive ? 'text-sage-deep' : 'text-muted',
                )
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              {t(item.key)}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
