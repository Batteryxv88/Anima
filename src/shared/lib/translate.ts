import type { Locale } from '@/shared/config'

const cache = new Map<string, string>()

async function translateOne(text: string, to: Exclude<Locale, 'ru'>) {
  const key = `${to}:${text}`
  const hit = cache.get(key)
  if (hit) return hit
  const ctrl = new AbortController()
  const timer = globalThis.setTimeout(() => ctrl.abort(), 3500)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=ru|${to}`
    const response = await fetch(url, { signal: ctrl.signal })
    if (!response.ok) return text
    const data = (await response.json()) as { responseData?: { translatedText?: string } }
    const out = String(data.responseData?.translatedText ?? '').trim()
    const failed = !out || /query length limit|invalid|my?memory warning/i.test(out)
    const result = failed ? text : out
    cache.set(key, result)
    return result
  } finally {
    globalThis.clearTimeout(timer)
  }
}

export async function translateFromRu(text: string, to: Exclude<Locale, 'ru'>) {
  const trimmed = text.trim()
  if (!trimmed) return ''
  try {
    return await translateOne(trimmed, to)
  } catch {
    return trimmed
  }
}
