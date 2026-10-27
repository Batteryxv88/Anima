import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { techniqueCopy, type Technique } from './model'
import type { Locale } from '@/shared/config'
import { Card } from '@/shared/ui'

export function TechniqueCard({ technique }: { technique: Technique }) {
  const { t, i18n } = useTranslation()
  const copy = techniqueCopy(technique, i18n.language as Locale)

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-sand">{t(`school.${technique.school}`)}</p>
          <h2 className="mt-1 text-lg font-medium text-ink">{copy.title}</h2>
          <p className="mt-1 text-sm text-muted">{t('skills.duration', { count: technique.durationMin })}</p>
        </div>
        <Link
          to={`/skills/${technique.id}`}
          className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm text-sage-deep hover:bg-sage/10"
        >
          {t('skills.open')}
        </Link>
      </div>
    </Card>
  )
}
