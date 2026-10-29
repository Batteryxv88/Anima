import { useTranslation } from 'react-i18next'
import type { CheckIn } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { scaleWordKey, weekDates, type ScaleKind } from '@/shared/lib'

const rows: { kind: ScaleKind; label: string; tone: string; bead: string }[] = [
  { kind: 'mood', label: 'today.mood', tone: 'text-sage', bead: 'bg-sage' },
  { kind: 'anxiety', label: 'today.anxiety', tone: 'text-ink', bead: 'bg-ink' },
  { kind: 'sleep', label: 'today.sleep', tone: 'text-sand', bead: 'bg-sand' },
]

const paintOrder: ScaleKind[] = ['sleep', 'anxiety', 'mood']

function plotted(kind: ScaleKind, value: number) {
  const clamped = Math.min(10, Math.max(0, value))
  return kind === 'anxiety' ? 10 - clamped : clamped
}

function markY(value: number) {
  return 16 + (1 - value / 10) * 68
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ''
  const low = markY(0)
  const high = markY(10)
  const clamp = (y: number) => Math.min(low, Math.max(high, y))
  let path = `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) return `${path} L ${points[1].x} ${points[1].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index]
    const current = points[index]
    const next = points[index + 1]
    const after = points[index + 2] ?? next
    const c1x = current.x + (next.x - previous.x) / 6
    const c1y = clamp(current.y + (next.y - previous.y) / 6)
    const c2x = next.x - (after.x - current.x) / 6
    const c2y = clamp(next.y - (after.y - current.y) / 6)
    path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${next.x} ${next.y}`
  }
  return path
}

function curve(kind: ScaleKind, slots: (number | null)[]) {
  const segments: { x: number; y: number }[][] = []
  let current: { x: number; y: number }[] = []
  slots.forEach((value, index) => {
    if (value == null) {
      if (current.length > 0) segments.push(current)
      current = []
      return
    }
    current.push({ x: ((index + 0.5) / 7) * 100, y: markY(plotted(kind, value)) })
  })
  if (current.length > 0) segments.push(current)
  return segments.map(smoothPath).filter(Boolean).join(' ')
}

export function WeekMarks({ checkIns }: { checkIns: CheckIn[] }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const tag = localeTags[locale]
  const dates = weekDates()
  const byDate = new Map(checkIns.map((item) => [item.date, item]))
  const latest = [...checkIns].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
  if (!latest) return null

  if (checkIns.length < 2) {
    return (
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:text-center">
        {rows.map((row) => (
          <div key={row.kind} className="flex min-w-0 items-baseline justify-between gap-3 sm:block">
            <dt className="text-xs text-muted">{t(row.label)}</dt>
            <dd className="min-w-0 break-words text-right text-base font-medium sm:text-center">
              {t(scaleWordKey(row.kind, latest[row.kind]))}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  const weekday = new Intl.DateTimeFormat(tag, { weekday: 'short' })
  const weekdayLong = new Intl.DateTimeFormat(tag, { weekday: 'long' })
  const slots = Object.fromEntries(
    rows.map((row) => [row.kind, dates.map((iso) => byDate.get(iso)?.[row.kind] ?? null)]),
  ) as Record<ScaleKind, (number | null)[]>
  const summary = rows
    .map((row) => {
      const days = dates.flatMap((iso, index) => {
        const value = slots[row.kind][index]
        if (value == null) return []
        const day = weekdayLong.format(new Date(`${iso}T12:00:00`))
        return [`${day}: ${t(scaleWordKey(row.kind, value))}`]
      })
      return `${t(row.label)}. ${days.join(', ')}`
    })
    .join('. ')

  return (
    <div className="mt-4 grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-2 sm:gap-x-3">
      <div className="flex h-32 flex-col justify-between text-[10px] leading-tight text-muted sm:text-xs">
        <span>{t('session.axisHigh')}</span>
        <span>{t('session.axisLow')}</span>
      </div>
      <div className="relative h-32 min-w-0" role="img" aria-label={summary}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {paintOrder.map((kind) => {
            const row = rows.find((item) => item.kind === kind)
            const d = curve(kind, slots[kind])
            if (!row || !d) return null
            return (
              <path
                key={kind}
                d={d}
                className={row.tone}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 grid grid-cols-7" aria-hidden>
          {dates.map((iso, index) => (
            <div key={iso} className="relative">
              {paintOrder.map((kind) => {
                const value = slots[kind][index]
                const row = rows.find((item) => item.kind === kind)
                if (value == null || !row) return null
                return (
                  <span
                    key={kind}
                    className={`absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current/20 sm:size-3.5 ${row.tone}`}
                    style={{ top: `${markY(plotted(kind, value))}%` }}
                  >
                    <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current sm:size-2" />
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="col-start-2 mt-1 grid min-w-0 grid-cols-7 text-center text-[10px] leading-tight text-muted sm:text-xs">
        {dates.map((iso) => (
          <span key={iso} className="min-w-0 truncate">
            {weekday.format(new Date(`${iso}T12:00:00`))}
          </span>
        ))}
      </div>
      <p className="col-span-2 mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {rows.map((row) => (
          <span key={row.kind} className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className={`size-2 rounded-full ${row.bead}`} />
            {t(row.label)}
          </span>
        ))}
      </p>
    </div>
  )
}
