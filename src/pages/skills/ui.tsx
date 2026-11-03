import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import {
  averageRating,
  catalogSituations,
  TechniqueCard,
  techniqueMatchesSearch,
  useTechniqueStatsStore,
  useTechniqueStore,
  type CatalogSituation,
  type School,
} from '@/entities/technique'
import { isStaffRole, useUserStore } from '@/entities/user'
import { type Locale } from '@/shared/config'
import { Chip, EmptyState, FilterMenu, NoticeLayer, PageHeader, TextField, useNotice } from '@/shared/ui'

type SortMode = 'default' | 'rating'
type SchoolGroup = 'all' | 'mindfulness' | 'cognitive'

const cognitiveSchools: School[] = ['cbt', 'act']

function schoolGroupFromParam(value: string | null): SchoolGroup {
  if (value === 'mindfulness' || value === 'cognitive') return value
  return 'all'
}

const outlineLink =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink hover:border-plum/35'

export function SkillsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const schoolGroup = schoolGroupFromParam(searchParams.get('group'))
  const role = useUserStore((state) => state.role)
  const [filter, setFilter] = useState<CatalogSituation | 'all'>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [query, setQuery] = useState('')
  const techniques = useTechniqueStore((state) => state.list)
  const skillPrefs = useCareStore((state) => state.skillPrefs)
  const statsById = useTechniqueStatsStore((state) => state.byId)
  const { notice, show, hide } = useNotice()
  const situationOptions = useMemo(
    () => [
      { id: 'all', label: t('skills.anySituation') },
      ...catalogSituations.map((item) => ({ id: item, label: t(`situation.${item}`) })),
    ],
    [t],
  )
  const sortOptions = useMemo(
    () => [
      { id: 'default', label: t('skills.sortDefault') },
      { id: 'rating', label: t('skills.sortByRating') },
    ],
    [t],
  )
  const active =
    filter !== 'all' && (catalogSituations as readonly string[]).includes(filter) ? filter : 'all'
  const list = useMemo(() => {
    let next = active === 'all' ? techniques : techniques.filter((item) => item.situations.includes(active))
    if (schoolGroup === 'mindfulness') {
      next = next.filter((item) => item.school === 'mindfulness' || item.school === 'behavioral')
    } else if (schoolGroup === 'cognitive') {
      next = next.filter((item) => cognitiveSchools.includes(item.school))
    }
    if (favoritesOnly) {
      next = next.filter((item) => Boolean(skillPrefs[item.id]?.liked))
    }
    const needle = query.trim()
    if (needle) {
      next = next.filter((item) =>
        techniqueMatchesSearch(item, locale, needle, {
          school: t(`school.${item.school}`),
          situations: item.situations.map((situation) => t(`situation.${situation}`)),
        }),
      )
    }
    if (sortMode === 'rating') {
      next = [...next].sort((a, b) => {
        const avgA = averageRating(statsById[a.id]) ?? 0
        const avgB = averageRating(statsById[b.id]) ?? 0
        return avgB - avgA
      })
    }
    return next
  }, [active, favoritesOnly, locale, query, schoolGroup, skillPrefs, sortMode, statsById, t, techniques])

  useEffect(() => {
    const flash = location.state as { saved?: boolean; deleted?: boolean } | null
    if (flash?.saved) show(t('staff.savedNotice'), t('staff.savedHint'))
    else if (flash?.deleted) show(t('staff.deletedNotice'))
    else return
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate, show, t])

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <PageHeader
        title={t('skills.title')}
        action={
          isStaffRole(role) ? (
            <Link to="/skills/new" className={outlineLink}>
              {t('staff.addSkill')}
            </Link>
          ) : null
        }
      />
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
          label={t('skills.situationFilter')}
          active={active !== 'all'}
          value={active}
          options={situationOptions}
          onChange={(id) => setFilter(id === 'all' ? 'all' : (id as CatalogSituation))}
        />
        <FilterMenu
          label={t('skills.sortLabel')}
          active={sortMode === 'rating'}
          value={sortMode}
          options={sortOptions}
          onChange={(id) => setSortMode(id as SortMode)}
        />
      </div>
      {list.length === 0 ? (
        <EmptyState>
          {query.trim()
            ? t('skills.emptySearch')
            : favoritesOnly
              ? t('skills.emptyFavorites')
              : t('skills.empty')}
        </EmptyState>
      ) : (
        <div className="grid gap-3">
          {list.map((item) => (
            <TechniqueCard key={item.id} technique={item} />
          ))}
        </div>
      )}
    </>
  )
}
