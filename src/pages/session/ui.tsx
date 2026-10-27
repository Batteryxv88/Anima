import { useTranslation } from 'react-i18next'
import { useCareStore } from '@/entities/care'
import { getTechnique, techniqueCopy } from '@/entities/technique'
import { localeTags, type Locale } from '@/shared/config'
import { isThisWeek, weekRangeLabel } from '@/shared/lib'
import { Button, Card, EmptyState, Field, PageHeader, TextArea } from '@/shared/ui'

export function SessionPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const sessionNote = useCareStore((state) => state.sessionNote)
  const setSessionNote = useCareStore((state) => state.setSessionNote)
  const checkIns = useCareStore((state) => state.checkIns)
  const practices = useCareStore((state) => state.practices)
  const weekCheckIns = checkIns.filter((item) => isThisWeek(item.date))
  const weekPractices = practices.filter((item) => isThisWeek(item.at.slice(0, 10)))

  const avg = (key: 'mood' | 'anxiety' | 'sleep') => {
    if (weekCheckIns.length === 0) return '—'
    return (weekCheckIns.reduce((sum, item) => sum + item[key], 0) / weekCheckIns.length).toFixed(1)
  }

  return (
    <>
      <PageHeader
        title={t('session.title')}
        action={
          <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
            {t('session.print')}
          </Button>
        }
      />
      <div className="grid gap-4">
        <p className="text-sm text-muted">
          {t('session.range')}: {weekRangeLabel(localeTags[locale])}
        </p>
        <Card>
          <h2 className="text-base font-medium">{t('session.trend')}</h2>
          {weekCheckIns.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t('session.none')}</p>
          ) : (
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <dt className="text-xs text-muted">{t('today.mood')}</dt>
                <dd className="text-lg tabular-nums">{avg('mood')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('today.anxiety')}</dt>
                <dd className="text-lg tabular-nums">{avg('anxiety')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('today.sleep')}</dt>
                <dd className="text-lg tabular-nums">{avg('sleep')}</dd>
              </div>
            </dl>
          )}
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('session.practiced')}</h2>
          {weekPractices.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t('session.emptyPractice')}</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {weekPractices.map((item) => {
                const technique = getTechnique(item.techniqueId)
                const title = technique ? techniqueCopy(technique, locale).title : item.techniqueId
                return (
                  <li key={item.id} className="text-sm leading-relaxed">
                    <span className="font-medium">{title}</span>
                    {item.note ? <span className="text-muted"> — {item.note}</span> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        {weekCheckIns.length === 0 && weekPractices.length === 0 ? (
          <EmptyState>{t('session.none')}</EmptyState>
        ) : null}
        <Field label={t('session.want')}>
          <p className="mb-2 text-sm text-muted">{t('session.wantHint')}</p>
          <TextArea value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} />
        </Field>
      </div>
    </>
  )
}
