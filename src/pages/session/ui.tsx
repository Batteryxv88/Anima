import { useTranslation } from 'react-i18next'
import { useCareStore, useShareStore } from '@/entities/care'
import { AnswerList, getTechnique, techniqueCopy, useTechniqueStore } from '@/entities/technique'
import { localeTags, type Locale } from '@/shared/config'
import { formatStamp, isThisWeek, scaleWordKey, weekRangeLabel } from '@/shared/lib'
import { Button, Card, Field, PageHeader, TextArea } from '@/shared/ui'

export function SessionPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  useTechniqueStore((state) => state.list)
  const sessionNote = useCareStore((state) => state.sessionNote)
  const setSessionNote = useCareStore((state) => state.setSessionNote)
  const checkIns = useCareStore((state) => state.checkIns)
  const practices = useCareStore((state) => state.practices)
  const journal = useCareStore((state) => state.journal)
  const comments = useShareStore((state) => state.comments)
  const weekCheckIns = checkIns.filter((item) => isThisWeek(item.date))
  const weekPractices = practices.filter((item) => isThisWeek(item.at.slice(0, 10)))
  const weekShared = journal.filter(
    (item) => item.shareWithSpecialist && isThisWeek(item.at.slice(0, 10)),
  )

  const avgWord = (key: 'mood' | 'anxiety' | 'sleep') => {
    if (weekCheckIns.length === 0) return '—'
    const mean = weekCheckIns.reduce((sum, item) => sum + item[key], 0) / weekCheckIns.length
    return t(scaleWordKey(key, mean))
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
                <dd className="text-base font-medium">{avgWord('mood')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('today.anxiety')}</dt>
                <dd className="text-base font-medium">{avgWord('anxiety')}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">{t('today.sleep')}</dt>
                <dd className="text-base font-medium">{avgWord('sleep')}</dd>
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
                    <p>
                      <span className="font-medium">{title}</span>
                      {item.note ? <span className="text-muted"> — {item.note}</span> : null}
                    </p>
                    {technique ? <AnswerList technique={technique} answers={item.answers} /> : null}
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('journal.thisWeek')}</h2>
          {weekShared.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t('journal.noneShared')}</p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {weekShared.map((item) => (
                <li key={item.id} className="text-sm leading-relaxed">
                  <p className="text-xs text-muted">{formatStamp(item.at, localeTags[locale])}</p>
                  <p className="mt-1">
                    {item.kind === 'thought' ? item.thought || item.situation : item.body}
                  </p>
                  {item.kind === 'thought' && item.otherLook ? (
                    <p className="mt-1 text-muted">{item.otherLook}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
        {comments.length > 0 ? (
          <Card>
            <h2 className="text-base font-medium">{t('cabinet.comments')}</h2>
            <ul className="mt-3 grid gap-2">
              {comments.map((item) => (
                <li key={item.id} className="text-sm leading-relaxed">
                  <span className="text-xs text-muted">{formatStamp(item.at, localeTags[locale])}</span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        <Field label={t('session.want')}>
          <p className="mb-2 text-sm text-muted">{t('session.wantHint')}</p>
          <TextArea value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} />
        </Field>
      </div>
    </>
  )
}
