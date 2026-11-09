import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { type Locale } from '@/shared/config'
import { cn } from '@/shared/lib'
import { dayCardCopy, scaleSteps, type DayCard, type DayCardField } from './model'

export function DayScale({
  label,
  caption,
  field,
  value,
  onChange,
}: {
  label: string
  caption?: ReactNode
  field: DayCardField
  value: string
  onChange: (next: string) => void
}) {
  const steps = scaleSteps(field)
  const current = value === '' ? null : Number(value)
  return (
    <div>
      {caption ?? (label ? <p className="mb-2 text-sm text-ink">{label}</p> : null)}
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {steps.map((step) => {
          const active = current === step
          return (
            <button
              key={step}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(String(step))}
              className={cn(
                'flex min-h-10 min-w-10 items-center justify-center rounded-full border text-sm tabular-nums transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/50',
                active
                  ? 'border-plum bg-plum text-white dark:text-ink'
                  : 'border-line bg-card text-ink hover:border-plum/35',
              )}
            >
              {step}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DayCardTile({
  card,
  hint,
  to,
}: {
  card: DayCard
  hint?: string
  to: string
}) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const copy = dayCardCopy(card, locale)
  return (
    <Link
      to={to}
      className="block rounded-2xl border border-line border-l-4 border-l-plum bg-card p-5 shadow-sm shadow-plum/5 hover:border-plum/30"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-plum">{t(`school.${card.school}`)}</p>
      <h2 className="mt-1 text-lg font-medium text-ink">{copy.title}</h2>
      {hint ? <p className="mt-2 text-sm leading-relaxed text-muted">{hint}</p> : null}
    </Link>
  )
}
