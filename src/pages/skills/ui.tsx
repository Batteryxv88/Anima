import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { situations, TechniqueCard, useTechniqueStore, type Situation } from '@/entities/technique'
import { Chip, EmptyState, PageHeader } from '@/shared/ui'

export function SkillsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<Situation | 'all'>('all')
  const techniques = useTechniqueStore((state) => state.list)
  const used = useMemo(
    () => situations.filter((item) => techniques.some((technique) => technique.situations.includes(item))),
    [techniques],
  )
  const active = filter !== 'all' && used.includes(filter) ? filter : 'all'
  const list = useMemo(
    () => (active === 'all' ? techniques : techniques.filter((item) => item.situations.includes(active))),
    [active, techniques],
  )

  return (
    <>
      <PageHeader title={t('skills.title')} />
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
