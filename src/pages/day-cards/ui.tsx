import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import {
  DayCardTile,
  activeDayCards,
  dayCardMatchesSearch,
  latestDayCardEntry,
  sortDayCardsByUse,
  useDayCardStore,
} from '@/entities/day-card'
import { averageRating, useDayCardStatsStore } from '@/entities/technique'
import { isStaffRole, useUserStore } from '@/entities/user'
import { type Locale } from '@/shared/config'
import { todayId } from '@/shared/lib'
import { Chip, EmptyState, FilterMenu, PageHeader, TextField } from '@/shared/ui'

type SortMode = 'usage' | 'rating'

export function DayCardsListPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const role = useUserStore((state) => state.role)
  const list = useDayCardStore((state) => state.list)
  const entries = useCareStore((state) => state.dayCardEntries)
  const cardPrefs = useCareStore((state) => state.cardPrefs)
  const statsById = useDayCardStatsStore((state) => state.byId)
  const catalog = isStaffRole(role) ? list : activeDayCards(list)
  const today = todayId()
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('usage')
  const [query, setQuery] = useState('')
  const sortOptions = useMemo(
    () => [
      { id: 'usage', label: t('cards.sortByUse') },
      { id: 'rating', label: t('skills.sortByRating') },
    ],
    [t],
  )
  const cards = useMemo(() => {
    let next = catalog
    if (favoritesOnly) {
      next = next.filter((item) => Boolean(cardPrefs[item.id]?.liked))
    }
    const needle = query.trim()
    if (needle) {
      next = next.filter((item) => dayCardMatchesSearch(item, locale, needle, t(`school.${item.school}`)))
    }
    if (sortMode === 'rating') {
      next = [...next].sort((a, b) => {
        const avgA = averageRating(statsById[a.id]) ?? 0
        const avgB = averageRating(statsById[b.id]) ?? 0
        return avgB - avgA
      })
    } else {
      next = sortDayCardsByUse(next, entries)
    }
    return next
  }, [cardPrefs, catalog, entries, favoritesOnly, locale, query, sortMode, statsById, t])

  return (
    <>
      <Link to="/today" className="mb-3 inline-flex min-h-11 items-center text-sm text-plum">
        {t('nav.back')}
      </Link>
      <PageHeader title={t('cards.title')} text={t('cards.text')} />
      {catalog.length === 0 ? (
        <EmptyState>
          {isStaffRole(role) ? (
            <Link to="/staff/day-cards" className="text-plum">
              {t('cards.staffEmpty')}
            </Link>
          ) : (
            t('empty.generic')
          )}
        </EmptyState>
      ) : (
        <>
          <div className="mb-4">
            <TextField
              type="search"
              value={query}
              placeholder={t('skills.searchPlaceholder')}
              autoComplete="off"
              enterKeyHint="search"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="mb-5 flex flex-wrap items-center gap-1.5">
            <Chip size="compact" active={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)}>
              {t('skills.favorites')}
            </Chip>
            <FilterMenu
              label={t('skills.sortLabel')}
              active={sortMode === 'rating'}
              value={sortMode}
              options={sortOptions}
              onChange={(id) => setSortMode(id as SortMode)}
            />
          </div>
          {cards.length === 0 ? (
            <EmptyState>
              {query.trim() ? t('skills.emptySearch') : favoritesOnly ? t('skills.emptyFavorites') : t('empty.generic')}
            </EmptyState>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {cards.map((card) => {
                const latest = latestDayCardEntry(card, entries)
                const hint = !latest
                  ? t('cards.todayEmpty')
                  : latest.date === today
                    ? t('cards.todayHas')
                    : t('cards.hasEntry')
                return (
                  <DayCardTile
                    key={card.id}
                    card={card}
                    hint={`${t(`school.${card.school}`)} · ${hint}`}
                    to={`/cards/${card.id}?from=list`}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}
