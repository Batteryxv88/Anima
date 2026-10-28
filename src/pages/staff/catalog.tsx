import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteTechnique,
  emptyField,
  emptyTechnique,
  fallbackLocales,
  fieldKinds,
  fillTranslations,
  saveTechnique,
  schools,
  situations,
  techniqueCopy,
  useTechniqueStore,
  type FieldKind,
  type School,
  type Situation,
  type Technique,
} from '@/entities/technique'
import type { Locale } from '@/shared/config'
import { Button, Card, ChoiceButton, EmptyState, Field, FormatArea, NoticeLayer, PageHeader, TextArea, TextField, useNotice } from '@/shared/ui'

export function StaffCatalogPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const list = useTechniqueStore((state) => state.list)
  const location = useLocation()
  const navigate = useNavigate()
  const { notice, show, hide } = useNotice()

  useEffect(() => {
    const flash = location.state as { saved?: boolean; deleted?: boolean } | null
    if (flash?.saved) show(t('staff.savedNotice'), t('staff.savedHint'))
    else if (flash?.deleted) show(t('staff.deletedNotice'))
    else return
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.state, navigate, show, t])

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <PageHeader title={t('staff.catalogTitle')} text={t('staff.catalogText')} />
      <Link
        to="/staff/techniques/new"
        className="mb-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-sage px-4 text-sm font-medium text-white"
      >
        {t('staff.addSkill')}
      </Link>
      {list.length === 0 ? (
        <EmptyState>{t('skills.empty')}</EmptyState>
      ) : (
        <div className="grid gap-3">
          {list.map((item) => (
            <Link key={item.id} to={`/staff/techniques/${item.id}`} className="rounded-2xl border border-line bg-card px-5 py-4">
              <p className="text-sm font-medium">{techniqueCopy(item, locale).title}</p>
              <p className="mt-1 text-xs text-muted">{t(`school.${item.school}`)}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export function StaffTechniquePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
  const copy = draft.copy.ru

  const patchCopy = (next: Partial<typeof copy>) => {
    setDraft((current) => ({
      ...current,
      copy: { ...current.copy, ru: { ...current.copy.ru, ...next } },
    }))
  }

  return (
    <>
      <PageHeader title={id === 'new' ? t('staff.addSkill') : t('staff.editSkill')} />
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
          <p className="text-sm text-muted">{t('staff.school')}</p>
          <div className="flex flex-wrap gap-2">
            {schools.map((item) => (
              <ChoiceButton key={item} active={draft.school === item} onClick={() => setDraft((current) => ({ ...current, school: item as School }))}>
                {t(`school.${item}`)}
              </ChoiceButton>
            ))}
          </div>
          <p className="text-sm text-muted">{t('staff.situations')}</p>
          <div className="flex flex-wrap gap-2">
            {situations.map((item) => {
              const active = draft.situations.includes(item)
              return (
                <ChoiceButton
                  key={item}
                  active={active}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      situations: active
                        ? current.situations.filter((value) => value !== item)
                        : [...current.situations, item as Situation],
                    }))
                  }
                >
                  {t(`situation.${item}`)}
                </ChoiceButton>
              )
            })}
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
                  void fillTranslations({ ...next, id: savedId })
                    .then((item) => saveTechnique(item))
                    .catch(() => undefined)
                  navigate('/staff/techniques', { replace: true, state: { saved: true } })
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
                  .then(() => navigate('/staff/techniques', { replace: true, state: { deleted: true } }))
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
