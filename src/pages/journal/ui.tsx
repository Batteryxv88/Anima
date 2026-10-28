import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useCareStore, type JournalKind } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { formatStamp } from '@/shared/lib'
import { BinaryChoice, Button, Card, Chip, EmptyState, Field, NoticeLayer, PageHeader, TextArea, TextField, useNotice } from '@/shared/ui'

function preview(kind: JournalKind, entry: { body: string; thought: string; situation: string; feeling: string }) {
  if (kind === 'thought') return entry.thought || entry.situation || entry.feeling
  return entry.body
}

export function JournalPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [params] = useSearchParams()
  const journal = useCareStore((state) => state.journal)
  const addJournalEntry = useCareStore((state) => state.addJournalEntry)
  const setJournalShare = useCareStore((state) => state.setJournalShare)
  const removeJournalEntry = useCareStore((state) => state.removeJournalEntry)
  const [kind, setKind] = useState<JournalKind>(params.get('kind') === 'thought' ? 'thought' : 'note')
  const [share, setShare] = useState(false)
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
      shareWithSpecialist: share,
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
      <PageHeader title={t('journal.title')} text={t('journal.text')} />
      <div className="grid gap-4">
        <Card>
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
          <p className="mt-4 text-sm text-muted">{t('journal.shareHint')}</p>
          <div className="mt-3">
            <BinaryChoice
              label={t('journal.shareLabel')}
              value={share}
              onChange={setShare}
              offLabel={t('journal.private')}
              onLabel={t('journal.share')}
              stateOff={t('journal.nowPrivate')}
              stateOn={t('journal.nowShared')}
            />
          </div>
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
                <p className="mt-1 text-xs text-sand">
                  {entry.kind === 'thought' ? t('journal.kindThought') : t('journal.kindNote')}
                </p>
                <p className="mt-2 text-sm leading-relaxed">{preview(entry.kind, entry)}</p>
                {entry.kind === 'thought' && entry.otherLook ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{entry.otherLook}</p>
                ) : null}
                <div className="mt-4 grid gap-3">
                  <BinaryChoice
                    label={t('journal.shareLabel')}
                    value={entry.shareWithSpecialist}
                    onChange={(next) => setJournalShare(entry.id, next)}
                    offLabel={t('journal.private')}
                    onLabel={t('journal.share')}
                    stateOff={t('journal.nowPrivate')}
                    stateOn={t('journal.nowShared')}
                  />
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
