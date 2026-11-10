import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { create } from 'zustand'
import {
  confirmInvite,
  createInvite,
  defaultScope,
  inviteUrl,
  listenInvite,
  revokeLink,
  sameScope,
  setShareScope,
  syncPatientShares,
  updateLinkScope,
  useShareStore,
  type CareLink,
  type Invite,
  type ShareScope,
  type ShareScopeFlag,
} from '@/entities/care'
import { useUserStore } from '@/entities/user'
import { isFirebaseConfigured } from '@/shared/firebase'
import { Button, Chip, NoticeLayer, QrMark, useNotice } from '@/shared/ui'

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
  const row = (key: ShareScopeFlag, label: string) => (
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-sm text-ink">{label}</span>
      <div className="flex shrink-0 gap-1.5" role="group" aria-label={label}>
        <Chip
          size="compact"
          className="inline-flex min-w-[4.75rem] justify-center"
          active={!scope[key]}
          aria-pressed={!scope[key]}
          onClick={() => onChange(setShareScope(scope, key, false))}
        >
          {t('invite.hidden')}
        </Chip>
        <Chip
          size="compact"
          className="inline-flex min-w-[4.75rem] justify-center"
          active={scope[key]}
          aria-pressed={scope[key]}
          onClick={() => onChange(setShareScope(scope, key, true))}
        >
          {t('invite.visible')}
        </Chip>
      </div>
    </div>
  )
  return (
    <div className="grid gap-1.5">
      {row('trend', t('invite.scopeTrend'))}
      {row('assignments', t('invite.scopeHomework'))}
      {row('journalNotes', t('invite.scopeNotes'))}
      {row('journalThoughts', t('invite.scopeThoughts'))}
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

  if (!uid) return null
  if (!ready) {
    return <p className="text-sm text-muted">{t('auth.noFirebase')}</p>
  }

  return (
    <div className="grid gap-2">
      {isSpecialist ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-plum">{t('invite.asSpecialist')}</p>
          <Link to="/cabinet" className="flex min-h-8 items-center text-sm font-medium text-plum">
            {t('cabinet.open')}
          </Link>
        </div>
      ) : null}
      {claimed ? null : invite && invite.status === 'open' && left > 0 ? (
        <div className="grid gap-2">
          <QrMark value={url} />
          <p className="text-xs text-muted">{t('invite.ttl', { count: left })}</p>
          <p className="break-all text-xs text-muted">{url}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(url).then(() => setCopied(true))
            }}
          >
            {copied ? t('invite.copied') : t('invite.copy')}
          </Button>
        </div>
      ) : hasSpecialist ? (
        <Button variant="ghost" size="sm" className="text-plum" onClick={startInvite}>
          {t('invite.createAnother')}
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={startInvite}>
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
  const [scope, setScope] = useState<ShareScope>(defaultScope)
  const [error, setError] = useState('')
  const claimed = invite?.status === 'claimed' && Boolean(invite.therapistUid)
  const { notice, show, hide } = useNotice()

  if (!uid) return null
  if (patientLinks.length === 0 && !claimed) return null

  return (
    <div className="grid gap-2">
      <NoticeLayer notice={notice} onClose={hide} />
      {patientLinks.length > 0 ? <p className="text-xs text-muted">{t('invite.shareText')}</p> : null}
      {patientLinks.map((link) => (
        <ShareLinkCard key={link.id} link={link} uid={uid} onNotice={show} />
      ))}
      {claimed && invite ? (
        <div className="grid gap-2 rounded-xl border border-line p-3">
          <p className="text-sm leading-snug">
            {t('invite.claimedBy', { email: invite.therapistEmail ?? t('invite.specialist') })}
          </p>
          <p className="text-xs text-muted">{t('invite.scopeHint')}</p>
          <ScopeFields scope={scope} onChange={setScope} />
          <Button
            size="sm"
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
  const pending = useRef<ShareScope | null>(null)

  useEffect(() => {
    if (pending.current) {
      if (sameScope(link.scope, pending.current)) pending.current = null
      return
    }
    setScope((current) => (sameScope(current, link.scope) ? current : link.scope))
  }, [link.scope])

  return (
    <div className="grid gap-2 rounded-xl border border-line p-3">
      <p className="truncate text-sm font-medium">{link.therapistEmail || t('invite.specialist')}</p>
      <ScopeFields
        scope={scope}
        onChange={(next) => {
          const prev = scope
          pending.current = next
          setScope(next)
          setError('')
          void updateLinkScope(link.id, next)
            .then(() => syncPatientShares(uid, useUserStore.getState().displayName.trim()))
            .catch(() => {
              pending.current = null
              setScope(prev)
              setError(t('invite.failed'))
            })
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        className="text-terra"
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
