import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { create } from 'zustand'
import {
  confirmInvite,
  createInvite,
  inviteUrl,
  listenInvite,
  revokeLink,
  syncPatientShares,
  updateLinkScope,
  useShareStore,
  type CareLink,
  type Invite,
  type ShareScope,
} from '@/entities/care'
import { useUserStore } from '@/entities/user'
import { isFirebaseConfigured } from '@/shared/firebase'
import { BinaryChoice, Button, NoticeLayer, QrMark, useNotice } from '@/shared/ui'

const useInviteFlow = create<{ invite: Invite | null; setInvite: (invite: Invite | null) => void }>((set) => ({
  invite: null,
  setInvite: (invite) => set({ invite }),
}))

function minutesLeft(expiresAtMs: number, now: number) {
  return Math.max(0, Math.ceil((expiresAtMs - now) / 60000))
}

function ScopeFields({
  scope,
  onChange,
}: {
  scope: ShareScope
  onChange: (scope: ShareScope) => void
}) {
  const { t } = useTranslation()
  const row = (key: keyof ShareScope, label: string) => (
    <BinaryChoice
      label={label}
      value={scope[key]}
      onChange={(next) => onChange({ ...scope, [key]: next })}
      offLabel={t('invite.hidden')}
      onLabel={t('invite.visible')}
      stateOff={t('invite.nowHidden')}
      stateOn={t('invite.nowVisible')}
    />
  )
  return (
    <div className="grid gap-4">
      {row('trend', t('invite.scopeTrend'))}
      {row('assignments', t('invite.scopeHomework'))}
      {row('journal', t('invite.scopeJournal'))}
    </div>
  )
}

export function InvitePanel() {
  const { t } = useTranslation()
  const uid = useUserStore((state) => state.uid)
  const email = useUserStore((state) => state.email)
  const therapistLinks = useShareStore((state) => state.therapistLinks)
  const patientLinks = useShareStore((state) => state.patientLinks)
  const invite = useInviteFlow((state) => state.invite)
  const setInvite = useInviteFlow((state) => state.setInvite)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(Date.now())
  const ready = isFirebaseConfigured()
  const url = invite ? inviteUrl(invite.token) : ''
  const left = invite ? minutesLeft(invite.expiresAtMs, now) : 0
  const isSpecialist = therapistLinks.length > 0
  const hasSpecialist = patientLinks.length > 0
  const claimed = invite?.status === 'claimed' && Boolean(invite.therapistUid)
  const startInvite = () => {
    if (!uid) return
    setError('')
    setCopied(false)
    void createInvite(uid, email ?? '')
      .then(setInvite)
      .catch(() => setError(t('invite.failed')))
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!invite || invite.status === 'confirmed') return
    return listenInvite(invite.token, (next) => {
      if (next) setInvite(next)
    })
  }, [invite?.token, invite?.status, setInvite])

  if (!uid) {
    return <p className="mt-3 text-sm leading-relaxed text-muted">{t('invite.needAccount')}</p>
  }
  if (!ready) {
    return <p className="mt-3 text-sm leading-relaxed text-muted">{t('auth.noFirebase')}</p>
  }

  return (
    <div className="mt-4 grid gap-4">
      {isSpecialist ? (
        <div className="grid gap-2">
          <p className="text-sm text-sage-deep">{t('invite.asSpecialist')}</p>
          <Link
            to="/cabinet"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sage px-4 text-sm font-medium text-white"
          >
            {t('cabinet.open')}
          </Link>
        </div>
      ) : null}
      {claimed ? (
        <p className="text-sm leading-relaxed text-muted">{t('invite.confirmBelow')}</p>
      ) : invite && invite.status === 'open' && left > 0 ? (
        <div className="grid gap-3">
          <QrMark value={url} />
          <p className="text-sm text-muted">{t('invite.ttl', { count: left })}</p>
          <p className="break-all text-xs text-muted">{url}</p>
          <Button
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(url).then(() => setCopied(true))
            }}
          >
            {copied ? t('invite.copied') : t('invite.copy')}
          </Button>
        </div>
      ) : hasSpecialist ? (
        <div className="grid gap-2">
          <p className="text-sm leading-relaxed text-muted">{t('invite.connected')}</p>
          <Button variant="ghost" className="justify-start px-0 text-sage-deep" onClick={startInvite}>
            {t('invite.createAnother')}
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={startInvite}>
          {t('invite.create')}
        </Button>
      )}
      {error ? <p className="text-sm text-terra">{error}</p> : null}
    </div>
  )
}

export function SharePanel() {
  const { t } = useTranslation()
  const uid = useUserStore((state) => state.uid)
  const patientLinks = useShareStore((state) => state.patientLinks)
  const invite = useInviteFlow((state) => state.invite)
  const setInvite = useInviteFlow((state) => state.setInvite)
  const [scope, setScope] = useState<ShareScope>({ assignments: true, trend: true, journal: true })
  const [error, setError] = useState('')
  const claimed = invite?.status === 'claimed' && Boolean(invite.therapistUid)
  const { notice, show, hide } = useNotice()

  if (!uid) {
    return <p className="mt-3 text-sm leading-relaxed text-muted">{t('invite.needAccount')}</p>
  }

  return (
    <div className="mt-4 grid gap-4">
      <NoticeLayer notice={notice} onClose={hide} />
      <p className="text-sm leading-relaxed text-muted">{t('invite.shareText')}</p>
      {patientLinks.map((link) => (
        <ShareLinkCard key={link.id} link={link} uid={uid} onNotice={show} />
      ))}
      {claimed && invite ? (
        <div className="grid gap-3 rounded-xl border border-line px-4 py-3">
          <p className="text-sm leading-relaxed">
            {t('invite.claimedBy', { email: invite.therapistEmail ?? t('invite.specialist') })}
          </p>
          <p className="text-sm text-muted">{t('invite.scopeHint')}</p>
          <ScopeFields scope={scope} onChange={setScope} />
          <Button
            onClick={() => {
              setError('')
              void confirmInvite(invite, scope)
                .then(() => {
                  setInvite(null)
                  show(t('invite.confirmedNotice'))
                  return syncPatientShares(uid, useUserStore.getState().displayName.trim())
                })
                .catch(() => setError(t('invite.failed')))
            }}
          >
            {t('invite.confirm')}
          </Button>
        </div>
      ) : null}
      {patientLinks.length === 0 && !claimed ? (
        <p className="text-sm leading-relaxed text-muted">{t('invite.shareEmpty')}</p>
      ) : null}
      {error ? <p className="text-sm text-terra">{error}</p> : null}
    </div>
  )
}

function ShareLinkCard({
  link,
  uid,
  onNotice,
}: {
  link: CareLink
  uid: string
  onNotice: (title: string, text?: string) => void
}) {
  const { t } = useTranslation()
  const [scope, setScope] = useState(link.scope)
  const [error, setError] = useState('')

  useEffect(() => {
    setScope(link.scope)
  }, [link.scope])

  return (
    <div className="grid gap-4 rounded-xl border border-line px-4 py-3">
      <p className="text-sm font-medium">{link.therapistEmail || t('invite.specialist')}</p>
      <ScopeFields
        scope={scope}
        onChange={(next) => {
          setScope(next)
          setError('')
          void updateLinkScope(link.id, next)
            .then(() => syncPatientShares(uid, useUserStore.getState().displayName.trim()))
            .catch(() => setError(t('invite.failed')))
        }}
      />
      <Button
        variant="outline"
        onClick={() => {
          void revokeLink(link.id).then(() => {
            onNotice(t('invite.revokedNotice'))
            return syncPatientShares(uid, useUserStore.getState().displayName.trim())
          })
        }}
      >
        {t('invite.revoke')}
      </Button>
      {error ? <p className="text-sm text-terra">{error}</p> : null}
    </div>
  )
}
