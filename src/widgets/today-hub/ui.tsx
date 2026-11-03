import { ArrowRight, Brain, CalendarCheck, Flower2, Heart } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { activeForYouArticles, forYouText, pickDailyForYouArticle, useForYouStore } from '@/entities/for-you'
import { isStaffRole, useUserStore } from '@/entities/user'
import { APP_NAME, type Locale } from '@/shared/config'
import { cn } from '@/shared/lib'
import { SunsetHorizon } from '@/shared/ui'

const tiles = [
  {
    to: '/skills?group=mindfulness',
    icon: Flower2,
    titleKey: 'today.tileMindfulness',
    className:
      'bg-lavender/55 shadow-sm shadow-plum/5 hover:bg-lavender/65 dark:bg-lavender/28 dark:hover:bg-lavender/34',
    iconClass: 'text-plum dark:text-lavender',
  },
  {
    to: '/skills?group=cognitive',
    icon: Brain,
    titleKey: 'today.tileCognitive',
    className: 'bg-peach/55 shadow-sm shadow-plum/5 hover:bg-peach/70 dark:bg-peach/22 dark:hover:bg-peach/30',
    iconClass: 'text-coral',
  },
  {
    to: '/homework',
    icon: CalendarCheck,
    titleKey: 'today.tileHomework',
    className: 'bg-sky/50 shadow-sm shadow-plum/5 hover:bg-sky/62 dark:bg-sky/22 dark:hover:bg-sky/30',
    iconClass: 'text-plum dark:text-sky',
  },
  {
    to: '/journal',
    icon: Heart,
    titleKey: 'today.tileJournal',
    className:
      'bg-coral/22 shadow-sm shadow-plum/5 hover:bg-coral/30 dark:bg-coral/18 dark:hover:bg-coral/24',
    iconClass: 'text-coral',
  },
] as const

export function TodayHubGreeting({ dateLabel }: { dateLabel: string }) {
  const { t } = useTranslation()

  return (
    <header className="mb-4 lg:hidden">
      <p className="text-[1.85rem] font-medium leading-tight tracking-tight text-ink">{APP_NAME}</p>
      <p className="mt-1 text-base leading-snug text-muted">{t('today.greetingLead')}</p>
      <p className="mt-2 text-sm text-muted">{dateLabel}</p>
    </header>
  )
}

export function TodayForYouCard({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const groups = useForYouStore((s) => s.groups)
  const articles = useForYouStore((s) => s.articles)
  const role = useUserStore((s) => s.role)
  const daily = useMemo(() => pickDailyForYouArticle(articles, groups), [articles, groups])
  const poolEmpty = activeForYouArticles(articles, groups).length === 0

  if (!daily) {
    if (!isStaffRole(role) || !poolEmpty) return null
    return (
      <Link
        to="/staff/for-you"
        className={cn(
          'mb-4 block rounded-[1.25rem] border border-dashed border-plum/40 bg-plum/8 p-5 lg:hidden',
          className,
        )}
      >
        <p className="text-sm font-medium text-plum">{t('today.forYou.title')}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t('today.forYou.staffEmpty')}</p>
      </Link>
    )
  }

  const group = groups.find((g) => g.id === daily.groupId)
  const teaser = forYouText(daily.teaser, locale)
  const groupLabel = group ? forYouText(group.title, locale) : ''

  return (
    <Link
      to={`/today/for-you/${daily.id}`}
      className={cn(
        'relative mb-4 block min-h-[9.5rem] overflow-hidden rounded-[1.25rem] border border-peach/25 p-5 anima-sunset-gradient transition-opacity hover:opacity-95 lg:hidden',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{t('today.forYou.title')}</p>
      {groupLabel ? (
        <p className="mt-1 text-xs text-plum">{groupLabel}</p>
      ) : null}
      <p className="mt-3 pr-12 text-lg font-medium leading-snug text-ink">{teaser}</p>
      <span className="absolute bottom-5 right-5 flex size-10 items-center justify-center rounded-full bg-card/80 text-plum shadow-sm">
        <ArrowRight size={20} strokeWidth={1.75} aria-hidden />
      </span>
      <SunsetHorizon className="pointer-events-none absolute inset-x-0 bottom-0 h-16 text-coral opacity-90" />
    </Link>
  )
}

export function TodayQuickTiles({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <div className={cn('grid grid-cols-2 gap-3 lg:hidden', className)}>
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <Link
            key={tile.to}
            to={tile.to}
            className={cn(
              'flex min-h-[6.75rem] flex-col justify-between rounded-[1.15rem] p-4 transition-colors duration-150',
              tile.className,
            )}
          >
            <Icon size={22} strokeWidth={1.75} className={cn('shrink-0', tile.iconClass)} aria-hidden />
            <span className="text-sm font-medium leading-snug text-ink">{t(tile.titleKey)}</span>
          </Link>
        )
      })}
    </div>
  )
}
