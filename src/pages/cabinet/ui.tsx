import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  addPendingAssignment,
  addTherapistComment,
  listenNotes,
  listenShare,
  useShareStore,
  type CareLink,
  type ShareNotes,
  type ShareSnapshot,
} from '@/entities/care'
import { AnswerList, getTechnique, techniqueCopy, useTechniqueStore } from '@/entities/technique'
import { localeTags, type Locale } from '@/shared/config'
import { formatStamp, isThisWeek, scaleWordKey } from '@/shared/lib'
import { Button, Card, EmptyState, Field, NoticeLayer, PageHeader, SearchSelect, TextArea, TextField, useNotice } from '@/shared/ui'

function Notebook({ link }: { link: CareLink }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const techniques = useTechniqueStore((state) => state.list)
  const [share, setShare] = useState<ShareSnapshot | null>(null)
  const [notes, setNotes] = useState<ShareNotes | null>(null)
  const [techniqueId, setTechniqueId] = useState(techniques[0]?.id ?? '')
  const [homeworkNote, setHomeworkNote] = useState('')
  const [comment, setComment] = useState('')
  const [sendState, setSendState] = useState<'idle' | 'busy'>('idle')
  const { notice, show, hide } = useNotice()
  const weekCheckIns = share?.checkIns.filter((item) => isThisWeek(item.date)) ?? []
  const skillOptions = useMemo(
    () =>
      techniques.map((item) => {
        const copy = techniqueCopy(item, locale)
        return {
          id: item.id,
          label: copy.title,
          hint: `${t(`school.${item.school}`)} · ${copy.when}`,
        }
      }),
    [locale, t],
  )

  useEffect(() => {
    const stopShare = listenShare(link.id, setShare)
    const stopNotes = listenNotes(link.id, setNotes)
    return () => {
      stopShare()
      stopNotes()
    }
  }, [link.id])

  const avgWord = (key: 'mood' | 'anxiety' | 'sleep') => {
    if (weekCheckIns.length === 0) return '—'
    const mean = weekCheckIns.reduce((sum, item) => sum + item[key], 0) / weekCheckIns.length
    return t(scaleWordKey(key, mean))
  }

  return (
    <div className="grid gap-4">
      <NoticeLayer notice={notice} onClose={hide} />
      <p className="text-sm text-muted">{link.patientEmail || t('cabinet.patient')}</p>
      {link.scope.trend ? (
        <Card>
          <h2 className="text-base font-medium">{t('session.trend')}</h2>
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
        </Card>
      ) : null}
      {link.scope.assignments ? (
        <Card>
          <h2 className="text-base font-medium">{t('homework.title')}</h2>
          <ul className="mt-3 grid gap-2">
            {(share?.assignments ?? []).map((item) => {
              const technique = getTechnique(item.techniqueId)
              const title = technique ? techniqueCopy(technique, locale).title : item.techniqueId
              return (
                <li key={item.id} className="text-sm">
                  <p>
                    {title}
                    {item.patientNote ? <span className="text-muted"> — {item.patientNote}</span> : null}
                  </p>
                  {technique ? <AnswerList technique={technique} answers={item.answers} /> : null}
                </li>
              )
            })}
            {(notes?.pendingAssignments ?? []).map((item) => {
              const technique = getTechnique(item.techniqueId)
              const title = technique ? techniqueCopy(technique, locale).title : item.techniqueId
              return (
                <li key={item.id} className="text-sm">
                  {title}
                  <span className="text-muted"> — {t('cabinet.queued')}</span>
                </li>
              )
            })}
          </ul>
          <div className="mt-3">
            <SearchSelect
              label={t('cabinet.assign')}
              value={techniqueId}
              onChange={setTechniqueId}
              options={skillOptions}
              placeholder={t('cabinet.searchSkill')}
              empty={t('cabinet.noSkill')}
            />
          </div>
          <Field label={t('cabinet.assignNote')}>
            <TextArea rows={2} value={homeworkNote} onChange={(event) => setHomeworkNote(event.target.value)} />
          </Field>
          <Button
            className="mt-2"
            disabled={sendState === 'busy' || !techniqueId}
            onClick={() => {
              if (!techniqueId || sendState === 'busy') return
              setSendState('busy')
              void addPendingAssignment(link, techniqueId, homeworkNote.trim())
                .then(() => {
                  setHomeworkNote('')
                  setSendState('idle')
                  show(t('cabinet.sentNotice'))
                })
                .catch(() => setSendState('idle'))
            }}
          >
            {t(sendState === 'busy' ? 'cabinet.sending' : 'cabinet.sendTask')}
          </Button>
        </Card>
      ) : null}
      {link.scope.journal ? (
        <Card>
          <h2 className="text-base font-medium">{t('journal.thisWeek')}</h2>
          {(share?.journal ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t('journal.noneShared')}</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {share?.journal.map((item) => (
                <li key={item.id} className="text-sm leading-relaxed">
                  {item.kind === 'thought' ? item.thought || item.situation : item.body}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
      <Card>
        <h2 className="text-base font-medium">{t('cabinet.comments')}</h2>
        <ul className="mt-3 grid gap-2">
          {(notes?.comments ?? []).map((item) => (
            <li key={item.id} className="text-sm leading-relaxed">
              <span className="text-xs text-muted">{formatStamp(item.at, localeTags[locale])}</span>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
        <Field label={t('cabinet.comment')}>
          <TextArea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} />
        </Field>
        <Button
          className="mt-2"
          disabled={!comment.trim()}
          onClick={() => {
            void addTherapistComment(link, comment.trim()).then(() => {
              setComment('')
              show(t('cabinet.commentNotice'))
            })
          }}
        >
          {t('common.save')}
        </Button>
      </Card>
    </div>
  )
}

function PatientList({ links }: { links: CareLink[] }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const list = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = needle
      ? links.filter((item) => (item.patientEmail || '').toLowerCase().includes(needle))
      : links
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [links, query])

  return (
    <div className="grid gap-3">
      <TextField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('cabinet.findPatient')}
        aria-label={t('cabinet.findPatient')}
      />
      {list.length === 0 ? (
        <EmptyState>{t('cabinet.noPatient')}</EmptyState>
      ) : (
        list.map((item) => (
          <Link
            key={item.id}
            to={`/cabinet/${item.id}`}
            className="rounded-2xl border border-line bg-card px-5 py-4 text-sm"
          >
            {item.patientEmail || t('cabinet.patient')}
          </Link>
        ))
      )}
    </div>
  )
}

export function CabinetPage() {
  const { t } = useTranslation()
  const { linkId } = useParams()
  const therapistLinks = useShareStore((state) => state.therapistLinks)
  const current = therapistLinks.find((item) => item.id === linkId)

  return (
    <>
      <PageHeader
        title={t('cabinet.title')}
        text={linkId || therapistLinks.length <= 1 ? t('invite.asSpecialist') : t('cabinet.listText')}
      />
      {therapistLinks.length === 0 ? (
        <EmptyState>{t('cabinet.empty')}</EmptyState>
      ) : linkId ? (
        current ? (
          <Notebook link={current} />
        ) : (
          <EmptyState>{t('cabinet.noPatient')}</EmptyState>
        )
      ) : therapistLinks.length === 1 ? (
        <Notebook link={therapistLinks[0]} />
      ) : (
        <PatientList links={therapistLinks} />
      )}
    </>
  )
}
