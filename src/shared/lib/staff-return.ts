export function staffReturnTo(raw: string | null | undefined) {
  if (!raw) return ''
  if (!raw.startsWith('/staff/day-cards')) return ''
  if (raw.includes('://')) return ''
  return raw
}
