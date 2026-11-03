import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { isStaffRole, useUserStore } from '@/entities/user'
import {
  deleteTechnique,
  emptyField,
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
import { cn } from '@/shared/lib'
import { Button, Card, Chip, ChoiceButton, Field, FormatArea, PageHeader, TextArea, TextField } from '@/shared/ui'

function toggleSituation(list: Situation[], item: Situation, active: boolean) {
  return active ? list.filter((value) => value !== item) : [...list, item]
}

export function StaffTechniquePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const role = useUserStore((state) => state.role)
  const authReady = useUserStore((state) => state.authReady)
  const list = useTechniqueStore((state) => state.list)
  const start = useMemo(() => {
    if (!id || id === 'new') return emptyTechnique()
    return list.find((item) => item.id === id) ?? emptyTechnique()
  }, [id, list])
  const [draft, setDraft] = useState<Technique>(start)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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

  return (
    <>
      <Link to="/skills" className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader title={!id || id === 'new' ? t('staff.addSkill') : t('staff.editTitle')} />
      <Card>
        <div className="grid gap-3">
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
          <div className="grid gap-2">
            <p className="text-sm font-medium">{t('staff.cover')}</p>
            {draft.coverUrl?.trim() ? (
              <TechniqueCover coverUrl={draft.coverUrl} className="mb-0" />
            ) : null}
            <p className="text-sm text-muted">{t('staff.coverUrlHint')}</p>
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
          </div>
          <p className="text-sm text-muted">{t('staff.school')}</p>
          <div className="flex flex-wrap gap-2">
            {schools.map((item) => {
              const active = draft.school === item
              return (
                <ChoiceButton
                  key={item}
                  active={active}
                  className={cn(active && schoolAccentBgSoft(item), active && schoolAccentText(item))}
                  onClick={() => setDraft((current) => ({ ...current, school: item as School }))}
                >
                  {t(`school.${item}`)}
                </ChoiceButton>
              )
            })}
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
          <FormatArea
            label={t('skill.about')}
            rows={5}
            value={copy.about}
            onChange={(value) => patchCopy({ about: value })}
            boldLabel={t('staff.bold')}
            italicLabel={t('staff.italic')}
          />
          <FormatArea
            label={t('skill.when')}
            rows={2}
            value={copy.when}
            onChange={(value) => patchCopy({ when: value })}
            boldLabel={t('staff.bold')}
            italicLabel={t('staff.italic')}
          />
          <FormatArea
            label={t('skill.steps')}
            rows={5}
            value={copy.steps.join('\n')}
            onChange={(value) => patchCopy({ steps: value.split('\n') })}
            boldLabel={t('staff.bold')}
            italicLabel={t('staff.italic')}
          />
          <h2 className="pt-2 text-sm font-medium">{t('staff.fields')}</h2>
          <p className="text-sm text-muted">{t('staff.fieldsText')}</p>
          {draft.fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 rounded-xl border border-line p-3">
              <div className="flex flex-wrap gap-2">
                {fieldKinds.map((kind) => (
                  <ChoiceButton
                    key={kind}
                    active={field.kind === kind}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        fields: current.fields.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, kind: kind as FieldKind, options: kind === 'choice' ? item.options ?? { ru: [''], en: [''], sl: [''] } : undefined }
                            : item,
                        ),
                      }))
                    }
                  >
                    {t(`staff.fieldKind.${kind}`)}
                  </ChoiceButton>
                ))}
              </div>
              <Field label={t('staff.fieldLabel')}>
                <TextField
                  value={field.label.ru}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      fields: current.fields.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, label: { ...item.label, ru: event.target.value } } : item,
                      ),
                    }))
                  }
                />
              </Field>
              {field.kind === 'choice' ? (
                <Field label={t('staff.fieldOptions')}>
                  <TextArea
                    rows={3}
                    value={(field.options?.ru ?? []).join('\n')}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        fields: current.fields.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, options: { ru: event.target.value.split('\n'), en: [], sl: [] } }
                            : item,
                        ),
                      }))
                    }
                  />
                </Field>
              ) : null}
              <Button
                variant="ghost"
                className="justify-start px-0"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    fields: current.fields.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
              >
                {t('staff.removeField')}
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setDraft((current) => ({ ...current, fields: [...current.fields, emptyField()] }))}>
            {t('staff.addField')}
          </Button>
          {error ? <p className="text-sm text-terra">{error}</p> : null}
          <Button
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
                    options:
                      field.kind === 'choice'
                        ? { ru: (field.options?.ru ?? []).map((item) => item.trim()).filter(Boolean), en: [], sl: [] }
                        : undefined,
                  }))
                  .filter((field) => field.label.ru.trim()),
              }
              setBusy(true)
              void saveTechnique(fallbackLocales(next))
                .then((savedId) => {
                  const saved = { ...next, id: savedId }
                  void fillTranslations(saved)
                    .then((item) => saveTechnique(item))
                    .catch(() => undefined)
                  navigate(`/skills/${savedId}`, { replace: true, state: { saved: true } })
                })
                .catch(() => setError(t('staff.failed')))
                .finally(() => setBusy(false))
            }}
          >
            {t('common.save')}
          </Button>
          {id && id !== 'new' ? (
            <Button
              variant="outline"
              onClick={() => {
                if (!window.confirm(t('staff.confirmDelete'))) return
                void deleteTechnique(id)
                  .then(() => navigate('/skills', { replace: true, state: { deleted: true } }))
                  .catch(() => setError(t('staff.failed')))
              }}
            >
              {t('staff.deleteSkill')}
            </Button>
          ) : null}
        </div>
      </Card>
    </>
  )
}
