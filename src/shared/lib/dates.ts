export function todayId(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfWeek(date = new Date()) {
  const copy = new Date(date)
  const day = (copy.getDay() + 6) % 7
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - day)
  return copy
}

export function isThisWeek(isoDate: string, date = new Date()) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  const value = new Date(`${isoDate}T12:00:00`)
  return value >= start && value < end
}

export function formatDay(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${isoDate}T12:00:00`))
}

export function weekRangeLabel(locale: string, date = new Date()) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}
