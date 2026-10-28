export type MarkupPart = {
  kind: 'text' | 'bold' | 'italic'
  text: string
}

export function parseMarkup(source: string): MarkupPart[] {
  const token = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  const parts: MarkupPart[] = []
  let last = 0
  for (const match of source.matchAll(token)) {
    const index = match.index ?? 0
    if (index > last) parts.push({ kind: 'text', text: source.slice(last, index) })
    parts.push(match[1] != null ? { kind: 'bold', text: match[1] } : { kind: 'italic', text: match[2] ?? '' })
    last = index + match[0].length
  }
  if (last < source.length) parts.push({ kind: 'text', text: source.slice(last) })
  return parts.length > 0 ? parts : [{ kind: 'text', text: source }]
}

export function wrapMarkup(value: string, start: number, end: number, marker: '**' | '*') {
  const selected = value.slice(start, end)
  const next = `${value.slice(0, start)}${marker}${selected}${marker}${value.slice(end)}`
  const inner = start + marker.length
  return { next, start: inner, end: inner + selected.length }
}
