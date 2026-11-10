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

const lastPayload = new Map<string, string>()

export function rememberPayload(key: string, payload: unknown) {
  lastPayload.set(key, JSON.stringify(payload))
}

export async function ifPayloadChanged(key: string, payload: unknown, write: () => Promise<void>) {
  const encoded = JSON.stringify(payload)
  if (lastPayload.get(key) === encoded) return
  await write()
  lastPayload.set(key, encoded)
}
