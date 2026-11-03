export function firestoreErrorKey(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error ? String((error as { code: string }).code) : ''
  if (code === 'permission-denied') return 'staff.forYouPermissionDenied'
  if (code === 'unauthenticated') return 'auth.failed'
  if (code === 'unavailable' || code === 'deadline-exceeded') return 'staff.forYouOffline'
  if (code === 'failed-precondition' || code === 'invalid-argument') return 'staff.forYouInvalid'
  return 'staff.failed'
}
