import { useUserStore } from '@/entities/user'
import { rememberNext } from './next-path'

export function isSignedIn() {
  return Boolean(useUserStore.getState().uid)
}

export function rememberAuthReturn(path: string) {
  rememberNext(path)
}
