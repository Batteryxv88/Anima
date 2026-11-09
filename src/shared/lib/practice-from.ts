const lists = new Set(['/skills', '/homework', '/today', '/crisis', '/cards'])

export function practiceFrom(state: unknown) {
  const from =
    state && typeof state === 'object' && 'from' in state ? String((state as { from?: unknown }).from ?? '') : ''
  if (from.startsWith('/cards')) return from
  return lists.has(from) ? from : '/skills'
}
