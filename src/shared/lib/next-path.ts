const KEY = 'anima-next'

export function rememberNext(path: string) {
  sessionStorage.setItem(KEY, path)
}

export function takeNext(fallback: string) {
  const value = sessionStorage.getItem(KEY)
  sessionStorage.removeItem(KEY)
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
