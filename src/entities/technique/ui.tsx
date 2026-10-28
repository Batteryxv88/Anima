import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  fieldLabel,
  fieldOptions,
  filledAnswers,
  techniqueCopy,
  type FieldAnswers,
  type Technique,
  type TechniqueField,
} from './model'
import type { Locale } from '@/shared/config'
import { ChoiceButton, Field, Scale, TextArea, TextField } from '@/shared/ui'

export function TechniqueCard({ technique, note }: { technique: Technique; note?: string }) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const copy = techniqueCopy(technique, i18n.language as Locale)

  return (
    <Link
      to={`/skills/${technique.id}`}
      state={{ from: location.pathname }}
      className="block rounded-2xl border border-line bg-card p-5 hover:border-sage/40"
    >
      <p className="text-xs uppercase tracking-wide text-sand">{t(`school.${technique.school}`)}</p>
      <h2 className="mt-1 text-lg font-medium text-ink">{copy.title}</h2>
      <p className="mt-1 text-sm text-muted">{t('skills.duration', { count: technique.durationMin })}</p>
      {note ? <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p> : null}
    </Link>
  )
}

export function TechniqueFields({
  fields,
  values,
  onChange,
}: {
  fields: TechniqueField[]
  values: FieldAnswers
  onChange: (id: string, value: string) => void
}) {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale
  if (fields.length === 0) return null

  return (
    <div className="grid gap-3">
      {fields.map((field) => {
        const label = fieldLabel(field, locale)
        const value = values[field.id] ?? ''
        if (field.kind === 'textarea') {
          return (
            <Field key={field.id} label={label}>
              <TextArea rows={3} value={value} onChange={(event) => onChange(field.id, event.target.value)} />
            </Field>
          )
        }
        if (field.kind === 'scale') {
          const number = value === '' ? 0 : Number(value)
          return (
            <Scale
              key={field.id}
              label={label}
              minLabel="0"
              maxLabel="10"
              valueLabel={value === '' ? '—' : String(number)}
              value={Number.isFinite(number) ? number : 0}
              onChange={(next) => onChange(field.id, String(next))}
            />
          )
        }
        if (field.kind === 'choice') {
          const options = fieldOptions(field, locale)
          const ruOptions = field.options?.ru ?? []
          return (
            <div key={field.id}>
              <p className="mb-1.5 text-sm text-muted">{label}</p>
              <div className="grid gap-2">
                {options.map((item, index) => {
                  const canonical = ruOptions[index] ?? item
                  return (
                    <ChoiceButton key={`${field.id}-${index}`} active={value === canonical} onClick={() => onChange(field.id, canonical)}>
                      {item}
                    </ChoiceButton>
                  )
                })}
              </div>
            </div>
          )
        }
        return (
          <Field key={field.id} label={label}>
            <TextField value={value} onChange={(event) => onChange(field.id, event.target.value)} />
          </Field>
        )
      })}
    </div>
  )
}

export function AnswerList({
  technique,
  answers,
}: {
  technique: Technique
  answers?: FieldAnswers
}) {
  const { i18n } = useTranslation()
  const lines = filledAnswers(technique, answers, i18n.language as Locale)
  if (lines.length === 0) return null
  return (
    <ul className="mt-2 grid gap-1">
      {lines.map((item) => (
        <li key={item.id} className="text-sm leading-relaxed">
          <span className="text-muted">{item.label}: </span>
          {item.value}
        </li>
      ))}
    </ul>
  )
}
