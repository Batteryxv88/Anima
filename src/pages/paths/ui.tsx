import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { pathGroups, TechniqueCard, useTechniqueStore, type Technique } from '@/entities/technique'
import { EmptyState, PageHeader } from '@/shared/ui'

function inGroup(technique: Technique, key: keyof typeof pathGroups) {
  const tags = pathGroups[key]
  return technique.situations.some((item) => (tags as readonly string[]).includes(item))
}

export function PathsPage() {
  const { t } = useTranslation()
  const techniques = useTechniqueStore((state) => state.list)
  const groups = useMemo(
    () => ({
      now: techniques.filter((item) => inGroup(item, 'now')),
      low: techniques.filter((item) => inGroup(item, 'low')),
    }),
    [techniques],
  )

  return (
    <>
      <PageHeader title={t('paths.title')} text={t('paths.text')} />
      <div className="grid gap-8">
        {(['now', 'low'] as const).map((key) => (
          <section key={key}>
            <h2 className="mb-3 text-base font-medium">{t(`paths.${key}`)}</h2>
            <p className="mb-4 text-sm leading-relaxed text-muted">{t(`paths.${key}Text`)}</p>
            {groups[key].length === 0 ? (
              <EmptyState>{t('skills.empty')}</EmptyState>
            ) : (
              <div className="grid gap-3">
                {groups[key].map((item) => (
                  <TechniqueCard key={item.id} technique={item} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  )
}
