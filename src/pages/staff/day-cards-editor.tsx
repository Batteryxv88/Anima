import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  dayCardCadences,
  dayCardStaffFieldKinds,
  deleteDayCard,
  emptyDayCard,
  emptyDayCardField,
  emptyDayCardSection,
  fallbackDayCardLocales,
  fillDayCardTranslations,
  saveDayCard,
  schools,
  useDayCardStore,
  type DayCard,
  type DayCardCadence,
  type DayCardSection,
  type School,
} from '@/entities/day-card'
import { techniqueCopy, useTechniqueStore } from '@/entities/technique'
import { isStaffRole, useUserStore } from '@/entities/user'
import { SkillStepChips } from '@/widgets/day-card-form'
import { type Locale } from '@/shared/config'
import { cn, firestoreErrorKey } from '@/shared/lib'
import {
  Button,
  Card,
  Chip,
  ConfirmDialog,
  Field,
  FormatArea,
  IconButton,
  NoticeLayer,
  PageHeader,
  SearchSelect,
  TextField,
  useNotice,
} from '@/shared/ui'

function moveItem<T>(list: T[], index: number, delta: number) {
  const next = index + delta
  if (next < 0 || next >= list.length) return list
  const copy = [...list]
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

const previewLink =
  'inline-flex min-h-9 items-center justify-center rounded-xl border border-line bg-card px-3 text-xs font-medium text-ink hover:border-plum/35'

export function StaffDayCardEditorPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const role = useUserStore((state) => state.role)
  const authReady = useUserStore((state) => state.authReady)
  const list = useDayCardStore((state) => state.list)
  const techniques = useTechniqueStore((state) => state.list)
  const isNew = !id || id === 'new'
  const start = useMemo(() => {
    if (isNew) return emptyDayCard(list.length)
    return list.find((item) => item.id === id) ?? emptyDayCard(list.length)
  }, [id, isNew, list])
  const [draft, setDraft] = useState<DayCard>(start)
  const [openSection, setOpenSection] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pick, setPick] = useState('')
  const { notice, show, hide } = useNotice()

  useEffect(() => {
    setDraft(start)
  }, [start])

  useEffect(() => {
    const flash = location.state as { attachedSkillId?: string; saved?: boolean } | null
    if (!flash?.attachedSkillId && !flash?.saved) return
    if (flash.attachedSkillId) {
      const attached = flash.attachedSkillId
      setDraft((current) =>
        current.techniqueIds.includes(attached)
          ? current
          : { ...current, techniqueIds: [...current.techniqueIds, attached] },
      )
      show(t('common.savedNotice'), t('staff.skillAttached'))
    } else if (flash.saved) {
      show(t('common.savedNotice'), t('staff.dayCardSaved'))
    }
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate, show, t])

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />

  const copy = draft.copy.ru
  const linked = draft.techniqueIds.map((skillId) => ({
    id: skillId,
    technique: techniques.find((item) => item.id === skillId),
  }))
  const skillOptions = techniques
    .filter((item) => !draft.techniqueIds.includes(item.id))
    .map((item) => ({
      id: item.id,
      label: techniqueCopy(item, locale).title,
      hint: t(`school.${item.school}`),
    }))

  const patchCopy = (next: Partial<typeof copy>) => {
    setDraft((current) => ({
      ...current,
      copy: { ...current.copy, ru: { ...current.copy.ru, ...next } },
    }))
  }

  const persist = async (leaveForSkill = false) => {
    setError('')
    if (!draft.copy.ru.title.trim()) {
      setError(t('staff.needTitle'))
      return ''
    }
    if (draft.active && draft.techniqueIds.length === 0) {
      setError(t('staff.dayCardsNeedSkills'))
      return ''
    }
    const cleaned: DayCard = {
      ...draft,
      copy: {
        ...draft.copy,
        ru: { title: draft.copy.ru.title.trim(), about: draft.copy.ru.about.trim() },
      },
      sections: draft.sections,
    }
    setBusy(true)
    try {
      const savedId = await saveDayCard(fallbackDayCardLocales(cleaned))
      const saved = { ...cleaned, id: savedId }
      void fillDayCardTranslations(saved)
        .then((item) => saveDayCard(item))
        .catch(() => undefined)
      if (leaveForSkill) return savedId
      if (isNew) navigate(`/staff/day-cards/${savedId}`, { replace: true, state: { saved: true } })
      else show(t('common.savedNotice'), t('staff.dayCardSaved'))
      return savedId
    } catch (caught) {
      setError(t(firestoreErrorKey(caught)))
      return ''
    } finally {
      setBusy(false)
    }
  }

  const goCreateSkill = () => {
    void persist(true).then((savedId) => {
      if (!savedId) return
      navigate(`/skills/new?returnTo=${encodeURIComponent(`/staff/day-cards/${savedId}`)}`)
    })
  }

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <ConfirmDialog
        open={confirmDelete}
        title={t('staff.confirmDeleteDayCard')}
        confirmLabel={t('staff.deleteDayCard')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!draft.id) return
          setConfirmDelete(false)
          void deleteDayCard(draft.id)
            .then(() => navigate('/staff/day-cards', { state: { deleted: true } }))
            .catch((caught) => setError(t(firestoreErrorKey(caught))))
        }}
      />
      <Link to="/staff/day-cards" className="mb-3 inline-flex min-h-9 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader
        title={isNew ? t('staff.addDayCard') : t('staff.editDayCard')}
        action={
          <div className="flex items-center gap-1">
            {draft.id ? (
              <Link to={`/cards/${draft.id}`} className={previewLink}>
                {t('staff.previewAsPerson')}
              </Link>
            ) : null}
            {!isNew ? (
              <IconButton
                variant="danger"
                disabled={busy}
                aria-label={t('staff.deleteDayCard')}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={18} strokeWidth={1.75} aria-hidden />
              </IconButton>
            ) : null}
          </div>
        }
      />
      <Card>
        <div className="grid gap-3">
          <Field label={t('staff.title')}>
            <TextField value={copy.title} onChange={(event) => patchCopy({ title: event.target.value })} />
          </Field>
          <div>
            <p className="mb-1.5 text-sm text-muted">{t('staff.school')}</p>
            <div className="flex flex-wrap gap-1.5">
              {schools.map((item) => (
                <Chip
                  key={item}
                  size="compact"
                  active={draft.school === item}
                  onClick={() => setDraft((current) => ({ ...current, school: item as School }))}
                >
                  {t(`school.${item}`)}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-sm text-muted">{t('staff.cadence')}</p>
            <div className="flex flex-wrap gap-1.5">
              {dayCardCadences.map((item) => (
                <Chip
                  key={item}
                  size="compact"
                  active={draft.cadence === item}
                  onClick={() => setDraft((current) => ({ ...current, cadence: item as DayCardCadence }))}
                >
                  {t(`staff.cadence${item === 'daily' ? 'Daily' : 'Episode'}`)}
                </Chip>
              ))}
            </div>
          </div>
          <FormatArea
            label={t('skill.about')}
            rows={3}
            value={copy.about}
            onChange={(about) => patchCopy({ about })}
            boldLabel={t('staff.bold')}
            italicLabel={t('staff.italic')}
          />
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-base font-medium">{t('staff.linkedSkills')}</h2>
        <p className="mt-1 text-sm text-muted">{t('staff.linkedSkillsHint')}</p>
        {draft.techniqueIds.length === 0 ? (
          <p className="mt-2 text-sm text-terra">{t('staff.dayCardsBindHint')}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {linked.map(({ id: skillId, technique }) => (
            <Chip
              key={skillId}
              size="compact"
              active
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  techniqueIds: current.techniqueIds.filter((item) => item !== skillId),
                }))
              }
            >
              {technique ? techniqueCopy(technique, locale).title : t('staff.skillGone')}
            </Chip>
          ))}
        </div>
        <div className="mt-3">
          <SearchSelect
            label={t('staff.addLinkedSkill')}
            value={pick}
            onChange={(skillId) => {
              setPick('')
              setDraft((current) =>
                current.techniqueIds.includes(skillId)
                  ? current
                  : { ...current, techniqueIds: [...current.techniqueIds, skillId] },
              )
            }}
            options={skillOptions}
            placeholder={t('cabinet.searchSkill')}
            empty={t('staff.noSkillMatch')}
          />
        </div>
        <p className="mt-3 text-sm text-muted">{t('staff.createSkillLeave')}</p>
        <Button className="mt-2" variant="outline" size="sm" disabled={busy} onClick={goCreateSkill}>
          {t('staff.createSkillForCard')}
        </Button>
      </Card>

      <div className="mt-4 grid gap-3">
        {draft.sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                onClick={() => setOpenSection((current) => (current === sectionIndex ? -1 : sectionIndex))}
              >
                <span className="font-medium text-ink">
                  {section.title.ru.trim() || t('cards.blockN', { n: sectionIndex + 1 })} ·{' '}
                  {t(`staff.section${section.kind === 'repeater' ? 'Repeater' : 'Fields'}`)}
                </span>
                <span className="text-sm text-plum">{openSection === sectionIndex ? '–' : '+'}</span>
              </button>
              <IconButton
                aria-label={t('staff.moveUp')}
                onClick={() =>
                  setDraft((current) => ({ ...current, sections: moveItem(current.sections, sectionIndex, -1) }))
                }
              >
                <ChevronUp size={16} strokeWidth={1.75} aria-hidden />
              </IconButton>
              <IconButton
                aria-label={t('staff.moveDown')}
                onClick={() =>
                  setDraft((current) => ({ ...current, sections: moveItem(current.sections, sectionIndex, 1) }))
                }
              >
                <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
              </IconButton>
              <IconButton
                variant="danger"
                aria-label={t('staff.removeSection')}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    sections: current.sections.filter((_, index) => index !== sectionIndex),
                  }))
                }
              >
                <Trash2 size={16} strokeWidth={1.75} aria-hidden />
              </IconButton>
            </div>
            {openSection === sectionIndex ? (
              <SectionEditor
                section={section}
                linkedIds={draft.techniqueIds}
                locale={locale}
                onChange={(next) =>
                  setDraft((current) => ({
                    ...current,
                    sections: current.sections.map((item, index) => (index === sectionIndex ? next : item)),
                  }))
                }
              />
            ) : null}
          </Card>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpenSection(draft.sections.length)
              setDraft((current) => ({ ...current, sections: [...current.sections, emptyDayCardSection('fields')] }))
            }}
          >
            {t('staff.addSection')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpenSection(draft.sections.length)
              setDraft((current) => ({ ...current, sections: [...current.sections, emptyDayCardSection('repeater')] }))
            }}
          >
            {t('staff.addRepeater')}
          </Button>
        </div>
      </div>

      <Card className="mt-4">
        <Chip
          size="compact"
          active={draft.active}
          className={cn(draft.techniqueIds.length === 0 && 'opacity-60')}
          onClick={() => {
            if (!draft.active && draft.techniqueIds.length === 0) {
              setError(t('staff.dayCardsNeedSkills'))
              return
            }
            setDraft((current) => ({ ...current, active: !current.active }))
          }}
        >
          {t('staff.dayCardActive')}
        </Chip>
        {error ? <p className="mt-3 text-sm text-terra">{error}</p> : null}
        <div className="mt-4">
          <Button disabled={busy} onClick={() => void persist()}>
            {t('common.save')}
          </Button>
        </div>
      </Card>
    </>
  )
}

function SectionEditor({
  section,
  linkedIds,
  locale,
  onChange,
}: {
  section: DayCardSection
  linkedIds: string[]
  locale: Locale
  onChange: (next: DayCardSection) => void
}) {
  const { t } = useTranslation()
  const techniques = useTechniqueStore((state) => state.list)
  const patchRu = (key: 'title' | 'hint', value: string) => {
    onChange({ ...section, [key]: { ...section[key], ru: value } })
  }
  const patchField = (fieldIndex: number, next: DayCardSection['fields'][number]) => {
    onChange({
      ...section,
      fields: section.fields.map((item, index) => (index === fieldIndex ? next : item)),
    })
  }
  return (
    <div className="mt-4 grid gap-3">
      <p className="text-sm text-muted">{t('staff.sectionOptional')}</p>
      <Field label={t('staff.sectionTitle')}>
        <TextField value={section.title.ru} onChange={(event) => patchRu('title', event.target.value)} />
      </Field>
      <FormatArea
        label={t('staff.helpText')}
        rows={2}
        value={section.hint.ru}
        onChange={(value) => patchRu('hint', value)}
        boldLabel={t('staff.bold')}
        italicLabel={t('staff.italic')}
      />
      {section.fields.map((field, fieldIndex) => (
        <div key={field.id} className="grid gap-3 rounded-xl border border-line p-3">
          <div className="flex items-center gap-1">
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {dayCardStaffFieldKinds.map((kind) => (
                <Chip
                  key={kind}
                  size="compact"
                  active={field.kind === kind}
                  onClick={() =>
                    patchField(fieldIndex, {
                      ...field,
                      kind,
                      min: kind === 'scale' ? field.min ?? 0 : undefined,
                      max: kind === 'scale' ? field.max ?? 10 : undefined,
                      options: kind === 'choice' ? field.options ?? { ru: [''], en: [], sl: [] } : undefined,
                    })
                  }
                >
                  {t(`staff.dayCardFieldKind.${kind}`)}
                </Chip>
              ))}
            </div>
            <IconButton
              variant="danger"
              aria-label={t('staff.removeDayField')}
              onClick={() =>
                onChange({ ...section, fields: section.fields.filter((_, index) => index !== fieldIndex) })
              }
            >
              <Trash2 size={16} strokeWidth={1.75} aria-hidden />
            </IconButton>
          </div>
          <Field label={t('staff.fieldLabel')}>
            <TextField
              value={field.label.ru}
              onChange={(event) =>
                patchField(fieldIndex, { ...field, label: { ...field.label, ru: event.target.value } })
              }
            />
          </Field>
          <FormatArea
            label={t('staff.helpText')}
            rows={2}
            value={field.example?.ru ?? ''}
            onChange={(value) =>
              patchField(fieldIndex, {
                ...field,
                example: { ru: value, en: field.example?.en ?? '', sl: field.example?.sl ?? '' },
              })
            }
            boldLabel={t('staff.bold')}
            italicLabel={t('staff.italic')}
          />
          {field.kind === 'choice' ? (
            <Field label={t('staff.fieldOptions')}>
              <TextField
                value={(field.options?.ru ?? []).join(' / ')}
                onChange={(event) =>
                  patchField(fieldIndex, {
                    ...field,
                    options: { ru: event.target.value.split('/').map((part) => part.trim()), en: [], sl: [] },
                  })
                }
              />
            </Field>
          ) : null}
          {field.kind === 'skill' && linkedIds.length > 0 ? (
            <div>
              <p className="mb-1.5 text-sm text-muted">{t('staff.bindFieldSkills')}</p>
              <div className="flex flex-wrap gap-1.5">
                {linkedIds.map((skillId) => {
                  const technique = techniques.find((item) => item.id === skillId)
                  const selected = (field.techniqueIds ?? []).includes(skillId)
                  return (
                    <Chip
                      key={skillId}
                      size="compact"
                      active={selected}
                      onClick={() => {
                        const current = field.techniqueIds ?? []
                        const next = selected ? current.filter((item) => item !== skillId) : [...current, skillId]
                        patchField(fieldIndex, { ...field, techniqueIds: next })
                      }}
                    >
                      {technique ? techniqueCopy(technique, locale).title : skillId}
                    </Chip>
                  )
                })}
              </div>
              <div className="pointer-events-none mt-2">
                {(field.techniqueIds?.length ? field.techniqueIds : linkedIds).map((id) => (
                  <SkillStepChips key={id} techniqueId={id} value="" onChange={() => undefined} />
                ))}
              </div>
            </div>
          ) : null}
          {section.kind === 'repeater' ? (
            <Chip
              size="compact"
              className="w-fit"
              active={Boolean(field.spotlight)}
              onClick={() => patchField(fieldIndex, { ...field, spotlight: !field.spotlight })}
            >
              {t('staff.spotlight')}
            </Chip>
          ) : null}
          <Chip
            size="compact"
            className="w-fit"
            active={field.revealWhen === 'repeaterEmpty'}
            onClick={() =>
              patchField(fieldIndex, {
                ...field,
                revealWhen: field.revealWhen === 'repeaterEmpty' ? undefined : 'repeaterEmpty',
              })
            }
          >
            {t('staff.revealEmpty')}
          </Chip>
        </div>
      ))}
      <Button
        className="w-fit"
        variant="outline"
        onClick={() => onChange({ ...section, fields: [...section.fields, emptyDayCardField()] })}
      >
        {t('staff.addDayField')}
      </Button>
    </div>
  )
}
