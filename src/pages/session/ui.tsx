import { useTranslation } from 'react-i18next'
import { useCareStore, useShareStore } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { formatStamp, isThisWeek, weekRangeLabel } from '@/shared/lib'
import { Button, Card, PageHeader, TextArea } from '@/shared/ui'
import { WeekMarks } from '@/widgets/week-marks'
import { WeekWork } from '@/widgets/week-work'

export function SessionPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const sessionNote = useCareStore((state) => state.sessionNote)
  const setSessionNote = useCareStore((state) => state.setSessionNote)
  const checkIns = useCareStore((state) => state.checkIns)
  const practices = useCareStore((state) => state.practices)
  const assignments = useCareStore((state) => state.assignments)
  const journal = useCareStore((state) => state.journal)
  const comments = useShareStore((state) => state.comments)
  const weekCheckIns = checkIns.filter((item) => isThisWeek(item.date))
  const weekPractices = practices.filter((item) => isThisWeek(item.at.slice(0, 10)))
  const weekAssignments = assignments.filter((item) => isThisWeek(item.createdAt.slice(0, 10)))
  const weekShared = journal.filter(
    (item) => item.shareWithSpecialist && isThisWeek(item.at.slice(0, 10)),
  )
  const weekEmpty =
    weekCheckIns.length === 0 &&
    weekPractices.length === 0 &&
    weekAssignments.length === 0 &&
    weekShared.length === 0 &&
    comments.length === 0

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
          <h2 className="text-xs tracking-wide text-sand">{t('session.want')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('session.wantHint')}</p>
          <div className="mt-3">
            <TextArea value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} />
          </div>
        </Card>
        {weekCheckIns.length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-sand">{t('session.week')}</h2>
            <WeekMarks checkIns={weekCheckIns} />
          </Card>
        ) : null}
        {weekPractices.length > 0 || weekAssignments.length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-sand">{t('session.practiced')}</h2>
            <WeekWork assignments={weekAssignments} practices={weekPractices} />
          </Card>
        ) : null}
        {weekShared.length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-sand">{t('session.journal')}</h2>
            <ul className="mt-4 grid gap-5">
              {weekShared.map((item) => (
                <li key={item.id}>
                  <p className="text-xs tracking-wide text-sand">
                    {item.kind === 'thought' ? t('journal.kindThought') : t('journal.kindNote')}
                  </p>
                  <p className="mt-1 text-xs text-muted">{formatStamp(item.at, localeTags[locale])}</p>
                  <p className="mt-2 text-sm leading-relaxed">
                    {item.kind === 'thought' ? item.thought || item.situation : item.body}
                  </p>
                  {item.kind === 'thought' && item.otherLook ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      <span className="text-xs tracking-wide text-sand">{t('journal.otherLook')}</span>
                      <span className="mt-1 block">{item.otherLook}</span>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        {comments.length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-sand">{t('session.fromSpecialist')}</h2>
            <ul className="mt-4 grid gap-4">
              {comments.map((item) => (
                <li key={item.id}>
                  <p className="text-xs text-muted">{formatStamp(item.at, localeTags[locale])}</p>
                  <p className="mt-1 text-sm leading-relaxed">{item.text}</p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        {weekEmpty ? <p className="text-sm leading-relaxed text-muted">{t('session.empty')}</p> : null}
      </div>
    </>
  )
}
