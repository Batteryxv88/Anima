import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage } from '@/shared/firebase'

const coverExtensions = ['webp', 'png', 'jpg', 'jpeg'] as const

function coverExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (coverExtensions.includes(fromName as (typeof coverExtensions)[number])) {
    return fromName
  }
  if (file.type === 'image/webp') return 'webp'
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/jpeg') return 'jpeg'
  return 'webp'
}

export async function uploadTechniqueCover(techniqueId: string, file: File): Promise<string> {
  const bucket = getFirebaseStorage()
  if (!bucket) throw new Error('auth.noFirebase')
  const id = techniqueId.trim()
  if (!id) throw new Error('auth.noFirebase')

  const ext = coverExtension(file)
  const path = `techniques/${id}/cover.${ext}`
  const storageRef = ref(bucket, path)
  await uploadBytes(storageRef, file, {
    contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  })
  return getDownloadURL(storageRef)
}
