import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { situations, TechniqueCard, useTechniqueStore, type Situation } from '@/entities/technique'
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
  const techniques = useTechniqueStore((state) => state.list)
  const { notice, show, hide } = useNotice()
  const used = useMemo(
    () => situations.filter((item) => techniques.some((technique) => technique.situations.includes(item))),
    [techniques],
  )
  const active = filter !== 'all' && used.includes(filter) ? filter : 'all'
  const list = useMemo(
    () => (active === 'all' ? techniques : techniques.filter((item) => item.situations.includes(active))),
    [active, techniques],
  )

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
      <Link to="/paths" className="mb-5 block rounded-2xl border border-line bg-card px-5 py-4 text-sm text-sage-deep">
        {t('paths.open')}
      </Link>
      {used.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          <Chip active={active === 'all'} onClick={() => setFilter('all')}>
            {t('skills.all')}
          </Chip>
          {used.map((item) => (
            <Chip key={item} active={active === item} onClick={() => setFilter(item)}>
              {t(`situation.${item}`)}
            </Chip>
          ))}
        </div>
      ) : null}
      {list.length === 0 ? (
        <EmptyState>{t('skills.empty')}</EmptyState>
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
