import { create } from 'zustand'

const storageKey = 'anima-shell-mode'

export type ShellMode = 'self' | 'practice'

function readMode(): ShellMode {
  if (typeof window === 'undefined') return 'self'
  try {
    return localStorage.getItem(storageKey) === 'practice' ? 'practice' : 'self'
  } catch {
    return 'self'
  }
}

type ShellModeState = {
  mode: ShellMode
  setMode: (mode: ShellMode) => void
}

export const useShellMode = create<ShellModeState>((set) => ({
  mode: readMode(),
  setMode: (mode) =>
    set((state) => {
      if (state.mode === mode) return state
      try {
        localStorage.setItem(storageKey, mode)
      } catch {
        /* keep the choice for this visit */
      }
      return { mode }
    }),
}))

const selfRoots = ['/today', '/skills', '/homework', '/session', '/journal', '/cards']

export function shellModeForPath(pathname: string): ShellMode | null {
  if (pathname === '/cabinet' || pathname.startsWith('/cabinet/')) return 'practice'
  if (selfRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`))) return 'self'
  return null
}
