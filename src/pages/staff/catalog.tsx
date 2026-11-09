import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { isStaffRole, useUserStore } from '@/entities/user'
import {
  deleteTechnique,
  emptyField,
  emptySkill,
  emptyTechnique,
  fallbackLocales,
  fieldKinds,
  fillTranslations,
  saveTechnique,
  catalogSituations,
  schoolAccentBgSoft,
  schoolAccentText,
  schools,
  TechniqueCover,
  useTechniqueStore,
  type FieldKind,
  type School,
  type Situation,
  type Technique,
} from '@/entities/technique'
import { cn, staffReturnTo } from '@/shared/lib'
import {
  Button,
  Card,
  Chip,
  ConfirmDialog,
  Field,
  FormatArea,
  IconButton,
  PageHeader,
  TextArea,
  TextField,
} from '@/shared/ui'

function toggleSituation(list: Situation[], item: Situation, active: boolean) {
  return active ? list.filter((value) => value !== item) : [...list, item]
}

export function StaffTechniquePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = staffReturnTo(params.get('returnTo'))
  const { t } = useTranslation()
  const role = useUserStore((state) => state.role)
  const authReady = useUserStore((state) => state.authReady)
  const list = useTechniqueStore((state) => state.list)
  const isNew = !id || id === 'new'
  const start = useMemo(() => {
    if (isNew) return emptyTechnique()
    return list.find((item) => item.id === id) ?? emptyTechnique()
  }, [id, isNew, list])
  const [draft, setDraft] = useState<Technique>(start)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setDraft(start)
  }, [start])

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/skills" replace />
  const copy = draft.copy.ru

  const patchCopy = (next: Partial<typeof copy>) => {
    setDraft((current) => ({
      ...current,
      copy: { ...current.copy, ru: { ...current.copy.ru, ...next } },
    }))
  }

  const patchField = (index: number, next: Technique['fields'][number]) => {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((item, itemIndex) => (itemIndex === index ? next : item)),
    }))
  }

  const patchSkill = (index: number, next: Technique['skills'][number]) => {
    setDraft((current) => ({
      ...current,
      skills: current.skills.map((item, itemIndex) => (itemIndex === index ? next : item)),
    }))
  }

  return (
    <>
      <ConfirmDialog
        open={confirmDelete}
        title={t('staff.confirmDelete')}
        confirmLabel={t('staff.deleteSkill')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (!id || isNew) return
          setConfirmDelete(false)
          void deleteTechnique(id)
            .then(() => navigate('/skills', { replace: true, state: { deleted: true } }))
            .catch(() => setError(t('staff.failed')))
        }}
      />
      <Link to={returnTo || '/skills'} className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader
        title={isNew ? t('staff.addSkill') : t('staff.editTitle')}
        action={
          !isNew ? (
            <IconButton
              variant="danger"
              disabled={busy}
              aria-label={t('staff.deleteSkill')}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={18} strokeWidth={1.75} aria-hidden />
            </IconButton>
          ) : null
        }
      />
      <Card>
        <div className="grid gap-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Field label={t('staff.title')}>
              <TextField value={copy.title} onChange={(event) => patchCopy({ title: event.target.value })} />
            </Field>
            <Field label={t('staff.duration')}>
              <TextField
                type="number"
                min={1}
                value={draft.durationMin}
                onChange={(event) => setDraft((current) => ({ ...current, durationMin: Number(event.target.value) || 1 }))}
              />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-sm text-muted">{t('staff.school')}</p>
            <div className="flex flex-wrap gap-1.5">
              {schools.map((item) => {
                const active = draft.school === item
                return (
                  <Chip
                    key={item}
                    size="compact"
                    active={active}
                    className={cn(active && schoolAccentBgSoft(item), active && schoolAccentText(item))}
                    onClick={() => setDraft((current) => ({ ...current, school: item as School }))}
                  >
                    {t(`school.${item}`)}
                  </Chip>
                )
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{t('staff.situations')}</p>
            <p className="mt-1 text-sm text-muted">{t('staff.situationsHint')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {catalogSituations.map((item) => {
                const active = draft.situations.includes(item)
                return (
                  <Chip
                    key={item}
                    size="compact"
                    active={active}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        situations: toggleSituation(current.situations, item, active),
                      }))
                    }
                  >
                    {t(`situation.${item}`)}
                  </Chip>
                )
              })}
            </div>
            <p className="mt-3 text-sm text-muted">{t('staff.situationCrisis')}</p>
            <div className="mt-1.5">
              <Chip
                size="compact"
                active={draft.situations.includes('crisis')}
                onClick={() => {
                  const active = draft.situations.includes('crisis')
                  setDraft((current) => ({
                    ...current,
                    situations: toggleSituation(current.situations, 'crisis', active),
                  }))
                }}
              >
                {t('situation.crisis')}
              </Chip>
            </div>
          </div>
          <div className="grid gap-2">
            <Field label={t('staff.coverUrl')}>
              <TextField
                value={draft.coverUrl ?? ''}
                placeholder="https://…"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    coverUrl: event.target.value.trim() || undefined,
                  }))
                }
              />
            </Field>
            {draft.coverUrl?.trim() ? <TechniqueCover coverUrl={draft.coverUrl} compact className="mb-0 max-w-xs" /> : null}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <FormatArea
              label={t('skill.about')}
              rows={3}
              value={copy.about}
              onChange={(value) => patchCopy({ about: value })}
              boldLabel={t('staff.bold')}
              italicLabel={t('staff.italic')}
            />
            <FormatArea
              label={t('skill.when')}
              rows={3}
              value={copy.when}
              onChange={(value) => patchCopy({ when: value })}
              boldLabel={t('staff.bold')}
              italicLabel={t('staff.italic')}
            />
          </div>
          <FormatArea
            label={t('skill.steps')}
            rows={3}
            value={copy.steps.join('\n')}
            onChange={(value) => patchCopy({ steps: value.split('\n') })}
            boldLabel={t('staff.bold')}
            italicLabel={t('staff.italic')}
          />
          <div>
            <p className="text-sm font-medium text-ink">{t('staff.innerSkills')}</p>
            <p className="mt-1 text-sm text-muted">{t('staff.innerSkillsHint')}</p>
            <div className="mt-2 grid gap-2">
              {(draft.skills ?? []).map((skill, index) => (
                <div key={skill.id} className="grid gap-3 rounded-xl border border-line p-3">
                  <div className="flex items-center gap-1">
                    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                      {fieldKinds.map((kind) => (
                        <Chip
                          key={kind}
                          size="compact"
                          active={skill.kind === kind}
                          onClick={() =>
                            patchSkill(index, {
                              ...skill,
                              kind: kind as FieldKind,
                              options: kind === 'choice' ? skill.options ?? { ru: [''], en: [''], sl: [''] } : undefined,
                            })
                          }
                        >
                          {t(`staff.fieldKind.${kind}`)}
                        </Chip>
                      ))}
                    </div>
                    <IconButton
                      variant="danger"
                      aria-label={t('staff.removeInnerSkill')}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          skills: current.skills.filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                    </IconButton>
                  </div>
                  <Field label={t('staff.skillTitle')}>
                    <TextField
                      value={skill.title.ru}
                      onChange={(event) =>
                        patchSkill(index, { ...skill, title: { ...skill.title, ru: event.target.value } })
                      }
                    />
                  </Field>
                  <FormatArea
                    label={t('staff.helpText')}
                    rows={2}
                    value={skill.hint.ru}
                    onChange={(value) => patchSkill(index, { ...skill, hint: { ...skill.hint, ru: value } })}
                    boldLabel={t('staff.bold')}
                    italicLabel={t('staff.italic')}
                  />
                  {skill.kind === 'choice' ? (
                    <Field label={t('staff.fieldOptions')}>
                      <TextArea
                        rows={2}
                        value={(skill.options?.ru ?? []).join('\n')}
                        onChange={(event) =>
                          patchSkill(index, {
                            ...skill,
                            options: { ru: event.target.value.split('\n'), en: [], sl: [] },
                          })
                        }
                      />
                    </Field>
                  ) : null}
                </div>
              ))}
            </div>
            <Button
              className="mt-2 w-fit"
              variant="outline"
              onClick={() => setDraft((current) => ({ ...current, skills: [...current.skills, emptySkill()] }))}
            >
              {t('staff.addInnerSkill')}
            </Button>
          </div>
          <h2 className="pt-1 text-sm font-medium">{t('staff.fields')}</h2>
          <p className="text-sm text-muted">{t('staff.fieldsText')}</p>
          {draft.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-xl border border-line p-3">
              <div className="flex items-center gap-1">
                <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                  {fieldKinds.map((kind) => (
                    <Chip
                      key={kind}
                      size="compact"
                      active={field.kind === kind}
                      onClick={() =>
                        patchField(index, {
                          ...field,
                          kind: kind as FieldKind,
                          options: kind === 'choice' ? field.options ?? { ru: [''], en: [''], sl: [''] } : undefined,
                        })
                      }
                    >
                      {t(`staff.fieldKind.${kind}`)}
                    </Chip>
                  ))}
                </div>
                <IconButton
                  variant="danger"
                  aria-label={t('staff.removeField')}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      fields: current.fields.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                </IconButton>
              </div>
              <Field label={t('staff.fieldLabel')}>
                <TextField
                  value={field.label.ru}
                  onChange={(event) =>
                    patchField(index, { ...field, label: { ...field.label, ru: event.target.value } })
                  }
                />
              </Field>
              <FormatArea
                label={t('staff.helpText')}
                rows={2}
                value={field.hint?.ru ?? ''}
                onChange={(value) =>
                  patchField(index, { ...field, hint: { ...(field.hint ?? { ru: '', en: '', sl: '' }), ru: value } })
                }
                boldLabel={t('staff.bold')}
                italicLabel={t('staff.italic')}
              />
              {field.kind === 'choice' ? (
                <Field label={t('staff.fieldOptions')}>
                  <TextArea
                    rows={2}
                    value={(field.options?.ru ?? []).join('\n')}
                    onChange={(event) =>
                      patchField(index, {
                        ...field,
                        options: { ru: event.target.value.split('\n'), en: [], sl: [] },
                      })
                    }
                  />
                </Field>
              ) : null}
            </div>
          ))}
          <Button
            className="w-fit"
            variant="outline"
            onClick={() => setDraft((current) => ({ ...current, fields: [...current.fields, emptyField()] }))}
          >
            {t('staff.addField')}
          </Button>
          {error ? <p className="text-sm text-terra">{error}</p> : null}
          <Button
            className="w-full"
            disabled={busy}
            onClick={() => {
              setError('')
              if (!draft.copy.ru.title.trim()) {
                setError(t('staff.needTitle'))
                return
              }
              const next: Technique = {
                ...draft,
                copy: {
                  ...draft.copy,
                  ru: {
                    ...draft.copy.ru,
                    title: draft.copy.ru.title.trim(),
                    about: draft.copy.ru.about.trim(),
                    when: draft.copy.ru.when.trim(),
                    steps: draft.copy.ru.steps.map((item) => item.trim()).filter(Boolean),
                  },
                },
                fields: draft.fields
                  .map((field) => ({
                    ...field,
                    hint: {
                      ru: (field.hint?.ru ?? '').trim(),
                      en: field.hint?.en ?? '',
                      sl: field.hint?.sl ?? '',
                    },
                    options:
                      field.kind === 'choice'
                        ? { ru: (field.options?.ru ?? []).map((item) => item.trim()).filter(Boolean), en: [], sl: [] }
                        : undefined,
                  }))
                  .filter((field) => field.label.ru.trim()),
                skills: (draft.skills ?? [])
                  .map((skill) => ({
                    ...skill,
                    title: { ...skill.title, ru: skill.title.ru.trim() },
                    hint: { ...skill.hint, ru: skill.hint.ru.trim() },
                    options:
                      skill.kind === 'choice'
                        ? { ru: (skill.options?.ru ?? []).map((item) => item.trim()).filter(Boolean), en: [], sl: [] }
                        : undefined,
                  }))
                  .filter((skill) => skill.title.ru),
              }
              setBusy(true)
              void saveTechnique(fallbackLocales(next))
                .then((savedId) => {
                  const saved = { ...next, id: savedId }
                  void fillTranslations(saved)
                    .then((item) => saveTechnique(item))
                    .catch(() => undefined)
                  navigate(returnTo || `/skills/${savedId}`, {
                    replace: true,
                    state: returnTo ? { attachedSkillId: savedId, saved: true } : { saved: true },
                  })
                })
                .catch(() => setError(t('staff.failed')))
                .finally(() => setBusy(false))
            }}
          >
            {t('common.save')}
          </Button>
        </div>
      </Card>
    </>
  )
}
