import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  claimInvite,
  listenInvite,
  readLink,
  rememberTherapistLink,
  useShareStore,
  type Invite,
} from '@/entities/care'
import { useUserStore } from '@/entities/user'
import { rememberNext } from '@/shared/lib'
import { Button, Card, PageHeader } from '@/shared/ui'

export function JoinPage() {
  const { token } = useParams()
  const { t } = useTranslation()
  const uid = useUserStore((state) => state.uid)
  const email = useUserStore((state) => state.email)
  const authReady = useUserStore((state) => state.authReady)
  const therapistLinks = useShareStore((state) => state.therapistLinks)
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined)
  const [error, setError] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [forceCabinet, setForceCabinet] = useState(false)
  const mine = Boolean(invite?.therapistUid && invite.therapistUid === uid)
  const own = Boolean(invite?.patientUid && invite.patientUid === uid)

  useEffect(() => {
    if (token) rememberNext(`/join/${token}`)
  }, [token])

  useEffect(() => {
    if (!token || !uid) return
    return listenInvite(token, setInvite)
  }, [token, uid])

  useEffect(() => {
    if (!uid || !invite?.linkId || invite.therapistUid !== uid || invite.status !== 'confirmed') return
    void readLink(invite.linkId).then((link) => {
      if (link) rememberTherapistLink(link)
    })
  }, [invite, uid])

  useEffect(() => {
    if (!mine || invite?.status !== 'confirmed') return
    const timer = window.setTimeout(() => setForceCabinet(true), 2500)
    return () => window.clearTimeout(timer)
  }, [mine, invite?.status])

  if (!authReady) return null
  if (!uid) return <Navigate to="/auth" replace />
  if (!token) return <Navigate to="/profile" replace />
  if (invite === undefined) return null

  if (mine && invite?.status === 'confirmed' && (therapistLinks.length > 0 || forceCabinet)) {
    return <Navigate to="/cabinet" replace />
  }

  const expired =
    !invite || invite.expiresAtMs < Date.now() || invite.status === 'confirmed' || (invite.status === 'claimed' && !mine)

  return (
    <>
      <PageHeader title={t('invite.joinTitle')} text={t('invite.joinText')} />
      <Card>
        {own ? (
          <p className="text-sm leading-relaxed text-muted">{t('invite.self')}</p>
        ) : mine && (invite?.status === 'claimed' || invite?.status === 'confirmed') ? (
          <p className="text-sm leading-relaxed">{t('invite.waitConfirm')}</p>
        ) : expired ? (
          <p className="text-sm leading-relaxed text-muted">{t('invite.expired')}</p>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm leading-relaxed">{t('invite.joinAsk')}</p>
            {error ? <p className="text-sm text-terra">{t(error)}</p> : null}
            <Button
              disabled={claiming}
              onClick={() => {
                setError('')
                setClaiming(true)
                void claimInvite(token, uid, email ?? '')
                  .catch((caught: unknown) => {
                    const key =
                      caught instanceof Error && (caught.message === 'invite.self' || caught.message === 'invite.expired')
                        ? caught.message
                        : 'invite.failed'
                    setError(key)
                  })
                  .finally(() => setClaiming(false))
              }}
            >
              {t('invite.claim')}
            </Button>
          </div>
        )}
        <Link to="/profile" className="mt-4 inline-flex min-h-11 items-center text-sm text-sage-deep">
          {t('nav.back')}
        </Link>
      </Card>
    </>
  )
}
