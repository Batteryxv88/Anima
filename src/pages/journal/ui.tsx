import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CloudRain, Moon, Smile } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCareStore, type JournalKind } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { formatStamp, normalizeScaleValue, SCALE_DEFAULT, scaleWordKey, todayId } from '@/shared/lib'
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  NoticeLayer,
  PageHeader,
  ScaleTap,
  TextArea,
  TextField,
  useNotice,
} from '@/shared/ui'

function preview(kind: JournalKind, entry: { body: string; thought: string; situation: string; feeling: string }) {
  if (kind === 'thought') return entry.thought || entry.situation || entry.feeling
  return entry.body
}

export function JournalPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [params] = useSearchParams()
  const journal = useCareStore((state) => state.journal)
  const saved = useCareStore((state) => state.checkIns.find((item) => item.date === todayId()))
  const saveCheckIn = useCareStore((state) => state.saveCheckIn)
  const addJournalEntry = useCareStore((state) => state.addJournalEntry)
  const removeJournalEntry = useCareStore((state) => state.removeJournalEntry)
  const [mood, setMood] = useState(() => normalizeScaleValue(saved?.mood ?? SCALE_DEFAULT))
  const [anxiety, setAnxiety] = useState(() => normalizeScaleValue(saved?.anxiety ?? SCALE_DEFAULT))
  const [sleep, setSleep] = useState(() => normalizeScaleValue(saved?.sleep ?? SCALE_DEFAULT))
  useEffect(() => {
    setMood(normalizeScaleValue(saved?.mood ?? SCALE_DEFAULT))
    setAnxiety(normalizeScaleValue(saved?.anxiety ?? SCALE_DEFAULT))
    setSleep(normalizeScaleValue(saved?.sleep ?? SCALE_DEFAULT))
  }, [saved?.mood, saved?.anxiety, saved?.sleep])
  const [kind, setKind] = useState<JournalKind>(params.get('kind') === 'thought' ? 'thought' : 'note')
  const [body, setBody] = useState('')
  const [situation, setSituation] = useState('')
  const [feeling, setFeeling] = useState('')
  const [thought, setThought] = useState('')
  const [otherLook, setOtherLook] = useState('')
  const { notice, show, hide } = useNotice()
  const canSave = kind === 'note' ? Boolean(body.trim()) : Boolean(thought.trim())

  const save = () => {
    if (!canSave) return
    addJournalEntry({
      kind,
      shareWithSpecialist: false,
      body: body.trim(),
      situation: situation.trim(),
      feeling: feeling.trim(),
      thought: thought.trim(),
      otherLook: otherLook.trim(),
    })
    setBody('')
    setSituation('')
    setFeeling('')
    setThought('')
    setOtherLook('')
    show(t('common.savedNotice'), t('journal.saved'))
  }

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <Link to="/today" className="mb-3 inline-flex min-h-11 items-center text-sm text-plum">
        {t('nav.back')}
      </Link>
      <PageHeader title={t('journal.title')} text={t('journal.text')} />
      <div className="grid gap-4">
        <Card className="anima-sunset-gradient border-peach/25">
          <h2 className="text-base font-medium text-ink">{t('today.checkIn')}</h2>
          <div className="mt-3 grid gap-2.5">
            <ScaleTap
              label={t('today.mood')}
              icon={<Smile size={16} strokeWidth={1.75} />}
              valueLabel={t(scaleWordKey('mood', mood))}
              value={mood}
              accent="coral"
              onChange={setMood}
            />
            <ScaleTap
              label={t('today.anxiety')}
              icon={<CloudRain size={16} strokeWidth={1.75} />}
              valueLabel={t(scaleWordKey('anxiety', anxiety))}
              value={anxiety}
              accent="plum"
              onChange={setAnxiety}
            />
            <ScaleTap
              label={t('today.sleep')}
              icon={<Moon size={16} strokeWidth={1.75} />}
              valueLabel={t(scaleWordKey('sleep', sleep))}
              value={sleep}
              accent="lavender"
              onChange={setSleep}
            />
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              saveCheckIn({
                mood: normalizeScaleValue(mood),
                anxiety: normalizeScaleValue(anxiety),
                sleep: normalizeScaleValue(sleep),
              })
              show(t('common.savedNotice'), t('today.saved'))
            }}
          >
            {t('today.save')}
          </Button>
        </Card>
        <Card className="border-lavender/30 bg-lavender/8">
          <div className="flex flex-wrap gap-2">
            <Chip
              active={kind === 'note'}
              onClick={() => setKind('note')}
            >
              {t('journal.kindNote')}
            </Chip>
            <Chip
              active={kind === 'thought'}
              onClick={() => setKind('thought')}
            >
              {t('journal.kindThought')}
            </Chip>
          </div>
          <div className="mt-4 grid gap-3">
            {kind === 'note' ? (
              <Field label={t('journal.body')}>
                <TextArea value={body} onChange={(event) => setBody(event.target.value)} />
              </Field>
            ) : (
              <>
                <Field label={t('journal.situation')}>
                  <TextField value={situation} onChange={(event) => setSituation(event.target.value)} />
                </Field>
                <Field label={t('journal.feeling')}>
                  <TextField value={feeling} onChange={(event) => setFeeling(event.target.value)} />
                </Field>
                <Field label={t('journal.thoughtLine')}>
                  <TextArea rows={3} value={thought} onChange={(event) => setThought(event.target.value)} />
                </Field>
                <Field label={t('journal.otherLook')}>
                  <p className="mb-1.5 text-sm text-muted">{t('journal.otherLookHint')}</p>
                  <TextArea rows={3} value={otherLook} onChange={(event) => setOtherLook(event.target.value)} />
                </Field>
              </>
            )}
          </div>
          <p className="mt-4 text-sm text-muted">
            {t('journal.shareHint')}{' '}
            <Link to="/profile" className="text-plum">
              {t('profile.privacy')}
            </Link>
          </p>
          <Button className="mt-5 w-full" disabled={!canSave} onClick={save}>
            {t('journal.save')}
          </Button>
        </Card>
        {journal.length === 0 ? (
          <EmptyState>{t('journal.empty')}</EmptyState>
        ) : (
          <div className="grid gap-3">
            {journal.map((entry) => (
              <Card key={entry.id}>
                <p className="text-xs text-muted">{formatStamp(entry.at, localeTags[locale])}</p>
                <p className="mt-1 text-xs text-muted">
                  {entry.kind === 'thought' ? t('journal.kindThought') : t('journal.kindNote')}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{preview(entry.kind, entry)}</p>
                {entry.kind === 'thought' && entry.otherLook ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{entry.otherLook}</p>
                ) : null}
                <div className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      removeJournalEntry(entry.id)
                      show(t('journal.removedNotice'))
                    }}
                  >
                    {t('journal.remove')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
