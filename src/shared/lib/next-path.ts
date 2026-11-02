const KEY = 'anima-next'

export function rememberNext(path: string) {
  sessionStorage.setItem(KEY, path)
}

export function peekNext(fallback: string) {
  const value = sessionStorage.getItem(KEY)
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export function clearNext() {
  sessionStorage.removeItem(KEY)
}

export function takeNext(fallback: string) {
  const value = peekNext(fallback)
  clearNext()
  return value
}
