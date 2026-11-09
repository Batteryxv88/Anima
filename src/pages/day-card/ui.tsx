import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useCareStore } from '@/entities/care'
import {
  dayCardCopy,
  dayCardText,
  emptySectionAnswers,
  extraFields,
  firstRepeaterSection,
  repeaterRowCount,
  sectionHasContent,
  skillFieldInSection,
  spotlightFields,
  techniqueIdFromRow,
  practiceNoteFromRow,
  recentDateIds,
  visibleFields,
  type DayCard,
  type DayCardEntry,
  type DayCardRow,
  type DayCardSection,
  type DayCardSectionAnswers,
  useDayCardStore,
} from '@/entities/day-card'
import { DayCardFieldControl, SkillStepsPreview } from '@/widgets/day-card-form'
import { isStaffRole, useUserStore } from '@/entities/user'
import { type Locale } from '@/shared/config'
import { cn, createId, todayId } from '@/shared/lib'
import { Button, Card, Chip, NoticeLayer, PageHeader, RichText, useNotice } from '@/shared/ui'

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function blankAnswers(card: DayCard): DayCardEntry['answers'] {
  return Object.fromEntries(card.sections.map((section) => [section.id, emptySectionAnswers()]))
}

function mergeAnswers(card: DayCard, entry: DayCardEntry | undefined): DayCardEntry['answers'] {
  const base = blankAnswers(card)
  if (!entry) return base
  for (const section of card.sections) {
    const current = entry.answers[section.id]
    if (current) base[section.id] = { values: { ...current.values }, rows: current.rows.map((row) => ({ ...row, values: { ...row.values } })) }
  }
  return base
}

function cloneAnswers(answers: DayCardEntry['answers']): DayCardEntry['answers'] {
  return Object.fromEntries(
    Object.entries(answers).map(([key, value]) => [
      key,
      { values: { ...value.values }, rows: value.rows.map((row) => ({ ...row, values: { ...row.values } })) },
    ]),
  )
}

export function DayCardFillPage() {
  const { id } = useParams()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const role = useUserStore((state) => state.role)
  const staff = isStaffRole(role)
  const ready = useDayCardStore((state) => state.ready)
  const card = useDayCardStore((state) => state.list.find((item) => item.id === id))
  const entries = useCareStore((state) => state.dayCardEntries)
  const upsertDayCardEntry = useCareStore((state) => state.upsertDayCardEntry)
  const upsertPractice = useCareStore((state) => state.upsertPractice)
  const { notice, show, hide } = useNotice()
  const dateParam = params.get('date')
  const date = dateParam && isIsoDate(dateParam) ? dateParam : todayId()
  const fromToday = params.get('from') === 'today'
  const backTo = fromToday ? '/today' : '/cards'
  const fromPath = `${location.pathname}?${params.toString()}`
  const stored = useMemo(
    () => (card ? entries.find((item) => item.dayCardId === card.id && item.date === date) : undefined),
    [card, date, entries],
  )
  const [answers, setAnswers] = useState<DayCardEntry['answers']>({})
  const skipQuiet = useRef(true)
  const autoRow = useRef(false)
  const days = recentDateIds(7)
  const repeater = card ? firstRepeaterSection(card) : undefined

  useEffect(() => {
    if (!card) return
    skipQuiet.current = true
    autoRow.current = false
    setAnswers(mergeAnswers(card, stored))
  }, [card, stored, date])

  useEffect(() => {
    if (!card) return
    if (skipQuiet.current) {
      skipQuiet.current = false
      return
    }
    const timer = window.setTimeout(() => {
      upsertDayCardEntry({ dayCardId: card.id, date, answers })
    }, 450)
    return () => window.clearTimeout(timer)
  }, [answers, card, date, upsertDayCardEntry])

  useEffect(() => {
    if (!card || !repeater) return
    const wantDay = params.get('section') === repeater.id || params.get('focus') === 'day'
    if (!wantDay || autoRow.current) return
    const current = answers[repeater.id]
    if (!current || current.rows.length > 0) return
    autoRow.current = true
    const row: DayCardRow = { id: createId(), values: {} }
    setAnswers((prev) => ({
      ...cloneAnswers(prev),
      [repeater.id]: { ...(prev[repeater.id] ?? emptySectionAnswers()), rows: [row] },
    }))
  }, [answers, card, params, repeater])

  if (!ready) return null
  if (!id) return <Navigate to="/cards" replace />
  if (!card) return <Navigate to="/cards" replace />
  if (!card.active && !staff) return <Navigate to="/cards" replace />

  const copy = dayCardCopy(card, locale)
  const sectionParam = params.get('section')
  const activeSection =
    card.sections.find((item) => item.id === sectionParam) ??
    (params.get('focus') === 'day' ? repeater : undefined) ??
    card.sections[0]
  const entryForMeta: DayCardEntry = {
    id: stored?.id ?? '',
    dayCardId: card.id,
    date,
    answers,
    createdAt: stored?.createdAt ?? '',
    updatedAt: stored?.updatedAt ?? '',
  }
  const repeaterEmpty = repeaterRowCount(card, entryForMeta) === 0

  const setSection = (sectionId: string) => {
    const next = new URLSearchParams(params)
    next.set('section', sectionId)
    setParams(next, { replace: true })
  }

  const setDate = (nextDate: string) => {
    const next = new URLSearchParams(params)
    if (nextDate === todayId()) next.delete('date')
    else next.set('date', nextDate)
    setParams(next, { replace: true })
  }

  const persist = (next: DayCardEntry['answers']) => {
    setAnswers(next)
  }

  const patchValues = (sectionId: string, fieldId: string, value: string) => {
    setAnswers((currentAnswers) => {
      const current = currentAnswers[sectionId] ?? emptySectionAnswers()
      return {
        ...cloneAnswers(currentAnswers),
        [sectionId]: { ...current, values: { ...current.values, [fieldId]: value } },
      }
    })
  }

  const patchRow = (sectionId: string, rowId: string, fieldId: string, value: string) => {
    setAnswers((currentAnswers) => {
      const current = currentAnswers[sectionId] ?? emptySectionAnswers()
      return {
        ...cloneAnswers(currentAnswers),
        [sectionId]: {
          ...current,
          rows: current.rows.map((row) =>
            row.id === rowId ? { ...row, values: { ...row.values, [fieldId]: value } } : row,
          ),
        },
      }
    })
  }

  const addRow = (section: DayCardSection) => {
    const current = answers[section.id] ?? emptySectionAnswers()
    const row: DayCardRow = { id: createId(), values: {} }
    persist({
      ...cloneAnswers(answers),
      [section.id]: { ...current, rows: [...current.rows, row] },
    })
    return row.id
  }

  const saveFields = () => {
    upsertDayCardEntry({ dayCardId: card.id, date, answers })
    show(t('common.savedNotice'), t('cards.savedCard'))
  }

  const saveRow = (section: DayCardSection, row: DayCardRow) => {
    const techniqueId = techniqueIdFromRow(section, row)
    let practiceId = row.practiceId
    if (techniqueId) {
      practiceId = upsertPractice({
        id: practiceId,
        techniqueId,
        note: practiceNoteFromRow(section, row),
        answers: row.values,
      })
    }
    const current = answers[section.id] ?? emptySectionAnswers()
    const nextAnswers: DayCardEntry['answers'] = {
      ...cloneAnswers(answers),
      [section.id]: {
        ...current,
        rows: current.rows.map((item) => (item.id === row.id ? { ...item, practiceId } : item)),
      },
    }
    persist(nextAnswers)
    upsertDayCardEntry({ dayCardId: card.id, date, answers: nextAnswers })
    show(t('common.savedNotice'), t('cards.savedRow'))
  }

  const renderFields = (
    fields: DayCardSection['fields'],
    values: Record<string, string>,
    onChange: (fieldId: string, value: string) => void,
  ) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.id}
          className={
            field.kind === 'textarea' || field.kind === 'scale' || field.kind === 'skill' ? 'sm:col-span-2' : ''
          }
        >
          <DayCardFieldControl
            card={card}
            field={field}
            value={values[field.id] ?? ''}
            values={values}
            locale={locale}
            from={fromPath}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  )

  const renderSection = (section: DayCardSection) => {
    const data = answers[section.id] ?? emptySectionAnswers()
    const title = dayCardText(section.title, locale)
    const body = dayCardText(section.hint, locale)
    const shown = visibleFields(section, repeaterEmpty)
    const skillId = skillFieldInSection(section)
      ? data.values[skillFieldInSection(section)!.id]
      : ''
    const hasLead = Boolean(title || body)

    return (
      <Card key={section.id}>
        {title ? <h2 className="text-base font-medium text-ink">{title}</h2> : null}
        {body ? (
          <p className={cn('text-sm leading-relaxed text-muted', title && 'mt-2')}>
            <RichText text={body} />
          </p>
        ) : null}
        {section.kind === 'fields' ? (
          <div className={cn('grid gap-4', hasLead && 'mt-4')}>
            {renderFields(shown, data.values, (fieldId, value) => patchValues(section.id, fieldId, value))}
            {skillId ? <SkillStepsPreview techniqueId={skillId} /> : null}
            <Button className="w-full sm:w-auto" onClick={() => saveFields()}>
              {t('common.save')}
            </Button>
          </div>
        ) : (
          <RepeaterBlock
            section={section}
            data={data}
            locale={locale}
            card={card}
            fromPath={fromPath}
            spaced={hasLead}
            onAdd={() => addRow(section)}
            onPatch={(rowId, fieldId, value) => patchRow(section.id, rowId, fieldId, value)}
            onSave={(row) => saveRow(section, row)}
          />
        )}
      </Card>
    )
  }

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <Link to={backTo} className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader
        title={copy.title}
        text={copy.about}
        action={
          staff ? (
            <Link
              to={`/staff/day-cards/${card.id}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink hover:border-plum/35"
            >
              {t('staff.editDayCard')}
            </Link>
          ) : null
        }
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {days.map((item) => {
          const active = item === date
          const marked = entries.some((entry) => entry.dayCardId === card.id && entry.date === item)
          return (
            <Chip key={item} size="compact" active={active} onClick={() => setDate(item)}>
              {item.slice(8)}
              {marked && !active ? ' ·' : ''}
            </Chip>
          )
        })}
      </div>
      <div className="sticky top-0 z-[5] -mx-4 mb-4 border-b border-line bg-canvas/95 px-4 py-2 backdrop-blur-sm lg:hidden">
        <div className="flex flex-wrap gap-1.5">
          {card.sections.map((section, index) => {
            const filled = sectionHasContent(answers[section.id])
            return (
              <Chip
                key={section.id}
                size="compact"
                active={activeSection?.id === section.id}
                onClick={() => setSection(section.id)}
              >
                {dayCardText(section.title, locale) || t('cards.blockN', { n: index + 1 })}
                {filled ? ' ·' : ''}
              </Chip>
            )
          })}
        </div>
      </div>
      <div className="grid gap-4">
        {card.sections.map((section) => (
          <div
            key={section.id}
            className={cn(section.id === activeSection?.id ? 'block' : 'hidden', 'lg:block')}
          >
            {renderSection(section)}
          </div>
        ))}
      </div>
    </>
  )
}

function RepeaterBlock({
  section,
  data,
  locale,
  card,
  fromPath,
  spaced,
  onAdd,
  onPatch,
  onSave,
}: {
  section: DayCardSection
  data: DayCardSectionAnswers
  locale: Locale
  card: DayCard
  fromPath: string
  spaced: boolean
  onAdd: () => void
  onPatch: (rowId: string, fieldId: string, value: string) => void
  onSave: (row: DayCardRow) => void
}) {
  const { t } = useTranslation()
  const quick = spotlightFields(section)
  const extra = extraFields(section)
  return (
    <div className={cn('grid gap-3', spaced && 'mt-4')}>
      {data.rows.map((row) => (
        <EpisodeRow
          key={row.id}
          card={card}
          section={section}
          row={row}
          locale={locale}
          fromPath={fromPath}
          quick={quick}
          extra={extra}
          onPatch={onPatch}
          onSave={onSave}
        />
      ))}
      <Button variant="outline" onClick={onAdd}>
        {t('cards.addRow')}
      </Button>
    </div>
  )
}

function EpisodeRow({
  card,
  section,
  row,
  locale,
  fromPath,
  quick,
  extra,
  onPatch,
  onSave,
}: {
  card: DayCard
  section: DayCardSection
  row: DayCardRow
  locale: Locale
  fromPath: string
  quick: DayCardSection['fields']
  extra: DayCardSection['fields']
  onPatch: (rowId: string, fieldId: string, value: string) => void
  onSave: (row: DayCardRow) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const skillId = techniqueIdFromRow(section, row)
  return (
    <div className="grid gap-3 rounded-xl border border-line p-3 sm:p-4">
      <div className="grid gap-3 lg:grid-cols-2">
        {quick.map((field) => (
          <div
            key={field.id}
            className={
              field.kind === 'textarea' || field.kind === 'scale' || field.kind === 'skill' ? 'lg:col-span-2' : ''
            }
          >
            <DayCardFieldControl
              card={card}
              field={field}
              value={row.values[field.id] ?? ''}
              values={row.values}
              locale={locale}
              from={fromPath}
              onChange={(fieldId, next) => onPatch(row.id, fieldId, next)}
            />
          </div>
        ))}
      </div>
      {skillId ? <SkillStepsPreview techniqueId={skillId} /> : null}
      {extra.length > 0 ? (
        <>
          <button type="button" className="w-fit text-sm font-medium text-plum" onClick={() => setOpen((current) => !current)}>
            {open ? t('cards.hideMore') : t('cards.more')}
          </button>
          {open ? (
            <div className="grid gap-3">
              {extra.map((field) => (
                <DayCardFieldControl
                  key={field.id}
                  card={card}
                  field={field}
                  value={row.values[field.id] ?? ''}
                  values={row.values}
                  locale={locale}
                  from={fromPath}
                  onChange={(fieldId, next) => onPatch(row.id, fieldId, next)}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      <Button onClick={() => onSave(row)}>{t('cards.saveRow')}</Button>
    </div>
  )
}
