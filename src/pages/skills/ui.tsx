import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { situations, TechniqueCard, techniques, type Situation } from '@/entities/technique'
import { Chip, PageHeader } from '@/shared/ui'

export function SkillsPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<Situation | 'all'>('all')
  const list = useMemo(
    () => (filter === 'all' ? techniques : techniques.filter((item) => item.situations.includes(filter))),
    [filter],
  )

  return (
    <>
      <PageHeader title={t('skills.title')} text={t('skills.text')} />
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          {t('skills.all')}
        </Chip>
        {situations.map((item) => (
          <Chip key={item} active={filter === item} onClick={() => setFilter(item)}>
            {t(`situation.${item}`)}
          </Chip>
        ))}
      </div>
      <div className="grid gap-3">
        {list.map((item) => (
          <TechniqueCard key={item.id} technique={item} />
        ))}
      </div>
    </>
  )
}
