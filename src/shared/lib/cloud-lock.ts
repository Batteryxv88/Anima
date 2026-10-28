let locked = false

export function withCloudLock(fn: () => void) {
  locked = true
  try {
    fn()
  } finally {
    locked = false
  }
}

export function isCloudLocked() {
  return locked
}
