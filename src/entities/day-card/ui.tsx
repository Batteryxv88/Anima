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
  const picked = current != null && Number.isFinite(current)
  const rangeInLabel = /\d+\s*[-–—/]\s*\d+/.test(label)
  return (
    <div>
      {caption ? <div className="mb-1.5">{caption}</div> : label ? <p className="mb-1.5 text-sm text-ink">{label}</p> : null}
      <div
        className="grid overflow-hidden rounded-lg border border-line"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        role="group"
        aria-label={label}
      >
        {steps.map((step) => {
          const active = current === step
          const filled = picked && step <= current
          return (
            <button
              key={step}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(String(step))}
              className={cn(
                '-mb-px -mr-px flex min-h-8 items-center justify-center border-b border-r border-line text-xs tabular-nums transition-colors duration-150',
                'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-plum/50',
                active
                  ? 'bg-plum text-white dark:text-ink'
                  : filled
                    ? 'bg-plum/15 text-ink hover:bg-plum/25'
                    : 'bg-card text-ink hover:bg-plum/10',
              )}
            >
              {step}
            </button>
          )
        })}
      </div>
      {!rangeInLabel && steps.length > 1 ? (
        <span className="mt-1 flex justify-between text-xs text-muted">
          <span>{steps[0]}</span>
          <span>{steps[steps.length - 1]}</span>
        </span>
      ) : null}
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
