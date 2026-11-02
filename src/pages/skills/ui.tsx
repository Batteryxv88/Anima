import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import { averageRating, situations, TechniqueCard, useTechniqueStatsStore, useTechniqueStore, type Situation } from '@/entities/technique'
import { isStaffRole, useUserStore } from '@/entities/user'
import { Chip, EmptyState, NoticeLayer, PageHeader, useNotice } from '@/shared/ui'

const outlineLink =
  'inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink hover:border-sage/40'

export function SkillsPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const role = useUserStore((state) => state.role)
  const [filter, setFilter] = useState<Situation | 'all'>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortRating, setSortRating] = useState(false)
  const techniques = useTechniqueStore((state) => state.list)
  const skillPrefs = useCareStore((state) => state.skillPrefs)
  const statsById = useTechniqueStatsStore((state) => state.byId)
  const { notice, show, hide } = useNotice()
  const used = useMemo(
    () => situations.filter((item) => techniques.some((technique) => technique.situations.includes(item))),
    [techniques],
  )
  const active = filter !== 'all' && used.includes(filter) ? filter : 'all'
  const list = useMemo(() => {
    let next = active === 'all' ? techniques : techniques.filter((item) => item.situations.includes(active))
    if (favoritesOnly) {
      next = next.filter((item) => Boolean(skillPrefs[item.id]?.liked))
    }
    if (sortRating) {
      next = [...next].sort((a, b) => {
        const avgA = averageRating(statsById[a.id]) ?? 0
        const avgB = averageRating(statsById[b.id]) ?? 0
        return avgB - avgA
      })
    }
    return next
  }, [active, favoritesOnly, skillPrefs, sortRating, statsById, techniques])

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
      <div className="mb-5 flex flex-wrap gap-2">
        <Chip active={!favoritesOnly && active === 'all'} onClick={() => { setFavoritesOnly(false); setFilter('all') }}>
          {t('skills.all')}
        </Chip>
        <Chip active={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)}>
          {t('skills.favorites')}
        </Chip>
        <Chip active={sortRating} onClick={() => setSortRating((value) => !value)}>
          {t('skills.sortRating')}
        </Chip>
        {used.map((item) => (
          <Chip
            key={item}
            active={!favoritesOnly && active === item}
            onClick={() => {
              setFavoritesOnly(false)
              setFilter(item)
            }}
          >
            {t(`situation.${item}`)}
          </Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState>{favoritesOnly ? t('skills.emptyFavorites') : t('skills.empty')}</EmptyState>
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
