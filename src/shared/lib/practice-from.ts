const lists = new Set(['/skills', '/homework', '/paths', '/today', '/crisis'])

export function practiceFrom(state: unknown) {
  const from =
    state && typeof state === 'object' && 'from' in state ? String((state as { from?: unknown }).from ?? '') : ''
  return lists.has(from) ? from : '/skills'
}
