import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import {
  fieldLabel,
  fieldOptions,
  filledAnswers,
  parseChoiceValues,
  serializeChoiceValues,
  techniqueCopy,
  type FieldAnswers,
  type Technique,
  type TechniqueField,
} from './model'
import type { Locale } from '@/shared/config'
import { cn, normalizeScaleValue, SCALE_MAX, SCALE_MIN } from '@/shared/lib'
import { SkillAverageRating, SkillLikeButton } from './skill-feedback'
import { Chip, Field, Scale, TextArea, TextField } from '@/shared/ui'
export function TechniqueCover({
  coverUrl,
  className,
  compact,
}: {
  coverUrl?: string
  className?: string
  compact?: boolean
}) {
  if (!coverUrl?.trim()) return null
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-card',
        compact ? 'mb-3' : 'mb-4',
        className,
      )}
    >
      <img
        src={coverUrl}
        alt=""
        className={cn('w-full object-contain', compact ? 'max-h-28' : 'aspect-[4/3] max-h-56')}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

export function TechniqueCard({ technique, note }: { technique: Technique; note?: string }) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const copy = techniqueCopy(technique, i18n.language as Locale)

  return (
    <div className="relative rounded-2xl border border-line bg-card hover:border-sage/40">
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
        <SkillAverageRating techniqueId={technique.id} compact />
        <SkillLikeButton techniqueId={technique.id} ghost />
      </div>
      <Link
        to={`/skills/${technique.id}`}
        state={{ from: location.pathname }}
        className="block p-5 pr-24"
      >
        <TechniqueCover coverUrl={technique.coverUrl} compact />
        <p className="text-xs uppercase tracking-wide text-sand">{t(`school.${technique.school}`)}</p>
        <h2 className="mt-1 text-lg font-medium text-ink">{copy.title}</h2>
        <p className="mt-1 text-sm text-muted">{t('skills.duration', { count: technique.durationMin })}</p>
        {note ? <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p> : null}
      </Link>
    </div>
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
          const number = value === '' ? SCALE_MIN : normalizeScaleValue(Number(value))
          return (
            <Scale
              key={field.id}
              label={label}
              minLabel={String(SCALE_MIN)}
              maxLabel={String(SCALE_MAX)}
              valueLabel={value === '' ? '—' : String(number)}
              value={Number.isFinite(number) ? number : SCALE_MIN}
              onChange={(next) => onChange(field.id, String(next))}
            />
          )
        }
        if (field.kind === 'choice') {
          const options = fieldOptions(field, locale)
          const ruOptions = field.options?.ru ?? []
          const selected = parseChoiceValues(value)
          return (
            <div key={field.id}>
              <p className="mb-1.5 text-sm text-muted">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map((item, index) => {
                  const canonical = ruOptions[index] ?? item
                  const active = selected.includes(canonical)
                  return (
                    <Chip
                      key={`${field.id}-${index}`}
                      active={active}
                      onClick={() => {
                        const next = active
                          ? selected.filter((entry) => entry !== canonical)
                          : [...selected, canonical]
                        onChange(field.id, serializeChoiceValues(next))
                      }}
                    >
                      {item}
                    </Chip>
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
        <li key={item.id} className="break-words text-sm leading-relaxed">
          <span className="text-muted">{item.label}: </span>
          {item.value}
        </li>
      ))}
    </ul>
  )
}
