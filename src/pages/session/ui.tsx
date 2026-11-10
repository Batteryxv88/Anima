import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { journalKindShared, useCareStore, useShareStore, type Practice } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { cn, formatStamp, isThisWeek, startOfWeek, todayId, weekRangeLabel } from '@/shared/lib'
import { Button, Card, PageHeader, TextArea } from '@/shared/ui'
import { WeekMarks } from '@/widgets/week-marks'
import { WeekWork } from '@/widgets/week-work'

function pastPracticeWeeks(practices: Practice[]) {
  const groups = new Map<string, Practice[]>()
  for (const item of practices) {
    const day = item.at.slice(0, 10)
    if (!day || isThisWeek(day)) continue
    const start = todayId(startOfWeek(new Date(`${day}T12:00:00`)))
    const list = groups.get(start) ?? []
    list.push(item)
    groups.set(start, list)
  }
  return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
}

function EarlierWeeks({ practices }: { practices: Practice[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const weeks = pastPracticeWeeks(practices)
  const [openWeek, setOpenWeek] = useState<string | null>(null)
  if (weeks.length === 0) return null

  return (
    <Card className="print:hidden">
      <h2 className="text-xs tracking-wide text-gold">{t('session.earlier')}</h2>
      <ul className="mt-3 min-w-0">
        {weeks.map(([start, items]) => {
          const open = openWeek === start
          return (
            <li key={start} className="min-w-0 border-b border-line/80 last:border-b-0">
              <button
                type="button"
                className="flex min-h-11 w-full min-w-0 items-center gap-3 py-2 text-left"
                aria-expanded={open}
                onClick={() => setOpenWeek(open ? null : start)}
              >
                <span className="min-w-0 flex-1 break-words text-sm font-medium">
                  {weekRangeLabel(localeTags[locale], new Date(`${start}T12:00:00`))}
                </span>
                <span className="shrink-0 text-sm text-muted">{items.length}</span>
                <ChevronDown
                  size={16}
                  strokeWidth={1.75}
                  className={cn('shrink-0 text-muted transition-transform duration-300', open && 'rotate-180')}
                />
              </button>
              {open ? <WeekWork assignments={[]} practices={items} /> : null}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

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
  const patientLinks = useShareStore((state) => state.patientLinks)
  const weekCheckIns = checkIns.filter((item) => isThisWeek(item.date))
  const weekPractices = practices.filter((item) => isThisWeek(item.at.slice(0, 10)))
  const weekAssignments = assignments.filter((item) => isThisWeek(item.createdAt.slice(0, 10)))
  const weekShared = journal.filter((item) => {
    if (!isThisWeek(item.at.slice(0, 10))) return false
    return patientLinks.some((link) => !link.revoked && journalKindShared(link.scope, item.kind))
  })
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
        <p className="text-sm text-muted">{weekRangeLabel(localeTags[locale])}</p>
        <Card>
          <h2 className="text-xs tracking-wide text-gold">{t('session.want')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('session.wantHint')}</p>
          <div className="mt-3">
            <TextArea value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} />
          </div>
        </Card>
        {weekCheckIns.length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-gold">{t('session.week')}</h2>
            <WeekMarks checkIns={weekCheckIns} />
          </Card>
        ) : null}
        {weekPractices.length > 0 || weekAssignments.length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-gold">{t('session.practiced')}</h2>
            <WeekWork assignments={weekAssignments} practices={weekPractices} />
          </Card>
        ) : null}
        {weekShared.length > 0 ? (
          <Card>
            <h2 className="text-xs tracking-wide text-gold">{t('session.journal')}</h2>
            <ul className="mt-4 grid gap-5">
              {weekShared.map((item) => (
                <li key={item.id}>
                  <p className="text-xs tracking-wide text-gold">
                    {item.kind === 'thought' ? t('journal.kindThought') : t('journal.kindNote')}
                  </p>
                  <p className="mt-1 text-xs text-muted">{formatStamp(item.at, localeTags[locale])}</p>
                  <p className="mt-2 text-sm leading-relaxed">
                    {item.kind === 'thought' ? item.thought || item.situation : item.body}
                  </p>
                  {item.kind === 'thought' && item.otherLook ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      <span className="text-xs tracking-wide text-gold">{t('journal.otherLook')}</span>
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
            <h2 className="text-xs tracking-wide text-gold">{t('session.fromSpecialist')}</h2>
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
        <EarlierWeeks practices={practices} />
      </div>
    </>
  )
}
