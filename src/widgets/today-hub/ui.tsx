import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { activeDayCards, dayCardCopy, lastUsedAt, recentHomeDayCards, useDayCardStore } from '@/entities/day-card'
import { activeForYouArticles, forYouText, pickDailyForYouArticle, useForYouStore } from '@/entities/for-you'
import { isStaffRole, useUserStore } from '@/entities/user'
import { APP_NAME, type Locale } from '@/shared/config'
import { cn } from '@/shared/lib'
import {
  BrainMark,
  CalendarMark,
  ForYouSunsetArt,
  HeartMark,
  LotusMark,
  SunsetHorizon,
} from '@/shared/ui'

const dayCardWash =
  'relative overflow-hidden rounded-2xl border border-peach/25 anima-sunset-gradient shadow-sm shadow-plum/5'

const tiles = [
  {
    to: '/skills?group=mindfulness',
    icon: LotusMark,
    titleKey: 'today.tileMindfulness',
    className:
      'bg-lavender/70 shadow-sm shadow-plum/5 hover:bg-lavender/80 dark:bg-lavender/32 dark:hover:bg-lavender/40',
    iconClass: '',
  },
  {
    to: '/skills?group=cognitive',
    icon: BrainMark,
    titleKey: 'today.tileCognitive',
    className: 'bg-peach/70 shadow-sm shadow-plum/5 hover:bg-peach/82 dark:bg-peach/26 dark:hover:bg-peach/34',
    iconClass: '',
  },
  {
    to: '/homework',
    icon: CalendarMark,
    titleKey: 'today.tileHomework',
    className: 'bg-sky/65 shadow-sm shadow-plum/5 hover:bg-sky/78 dark:bg-sky/26 dark:hover:bg-sky/34',
    iconClass: '',
  },
  {
    to: '/journal',
    icon: HeartMark,
    titleKey: 'today.tileJournal',
    className:
      'bg-coral/30 shadow-sm shadow-plum/5 hover:bg-coral/40 dark:bg-coral/22 dark:hover:bg-coral/30',
    iconClass: '',
  },
] as const

export function TodayHubGreeting() {
  const { t } = useTranslation()

  return (
    <header className="mb-4">
      <p className="text-[1.85rem] font-medium leading-tight tracking-tight text-ink">{APP_NAME}</p>
      <p className="mt-1 text-base leading-snug text-muted">{t('today.greetingLead')}</p>
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
          'mb-4 block rounded-[1.25rem] border border-dashed border-plum/40 bg-plum/8 p-5',
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
        'relative mb-4 block overflow-hidden rounded-[1.25rem] transition-opacity hover:opacity-95',
        className,
      )}
    >
      <ForYouSunsetArt />
      <div className="relative z-10 min-h-[9.75rem] p-5 pr-[34%]">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/70 dark:text-white/70">
          {t('today.forYou.title')}
        </p>
        {groupLabel ? <p className="mt-1 text-xs text-plum dark:text-lavender">{groupLabel}</p> : null}
        <p className="mt-3 text-lg font-medium leading-snug text-ink dark:text-white">{teaser}</p>
      </div>
    </Link>
  )
}

export function TodayQuickTiles({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
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
            <Icon className={tile.iconClass} />
            <span className="text-sm font-medium leading-snug text-ink">{t(tile.titleKey)}</span>
          </Link>
        )
      })}
    </div>
  )
}

export function TodayDayCardBanner({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const role = useUserStore((state) => state.role)
  const list = useDayCardStore((state) => state.list)
  const entries = useCareStore((state) => state.dayCardEntries)
  const recents = recentHomeDayCards(list, entries)

  if (recents.length === 0) {
    if (!isStaffRole(role) || activeDayCards(list).length > 0) return null
    return (
      <Link to="/staff/day-cards" className={cn('mb-4 block border-dashed p-5', dayCardWash, className)}>
        <p className="relative z-10 text-sm font-medium text-plum">{t('cards.title')}</p>
        <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted">{t('cards.staffEmpty')}</p>
        <SunsetHorizon className="absolute inset-x-0 bottom-0 h-12 text-coral opacity-80" />
      </Link>
    )
  }

  const unused = !lastUsedAt(recents[0], entries)

  return (
    <Link to="/cards" className={cn('mb-4 block p-5', dayCardWash, className)}>
      <p className="relative z-10 text-xs font-medium uppercase tracking-wide text-plum">{t('cards.title')}</p>
      <ul className="relative z-10 mt-1 grid gap-1">
        {recents.map((card) => (
          <li key={card.id} className="text-lg font-medium text-ink">
            {dayCardCopy(card, locale).title}
          </li>
        ))}
      </ul>
      {unused ? (
        <p className="relative z-10 mt-2 text-sm leading-relaxed text-muted">{t('cards.emptyBanner')}</p>
      ) : null}
      <SunsetHorizon className="absolute inset-x-0 bottom-0 h-14 text-coral opacity-80" />
    </Link>
  )
}
