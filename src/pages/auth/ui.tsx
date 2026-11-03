import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  authErrorKey,
  clearGoogleRedirectPending,
  isGoogleRedirectPending,
  isStandalonePwa,
  signInEmail,
  signInGoogle,
  signUpEmail,
  useUserStore,
} from '@/entities/user'
import { APP_NAME } from '@/shared/config'
import { isFirebaseConfigured } from '@/shared/firebase'
import { clearNext, peekNext } from '@/shared/lib'
import { Button, Card, Chip, Field, SunsetBanner, TextField } from '@/shared/ui'

export function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const uid = useUserStore((state) => state.uid)
  const authReady = useUserStore((state) => state.authReady)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const ready = isFirebaseConfigured()
  const returnPath = useMemo(() => peekNext('/profile'), [])
  const standalone = typeof window !== 'undefined' && isStandalonePwa()
  const browserAuthUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth${window.location.search}`
      : '/auth'

  useEffect(() => {
    if (uid) clearNext()
  }, [uid])

  useEffect(() => {
    if (!authReady || uid) return
    if (isGoogleRedirectPending()) {
      setError(t('auth.redirectFailed'))
      clearGoogleRedirectPending()
    }
  }, [authReady, t, uid])

  if (!authReady && !uid) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
        <p className="text-center text-sm text-muted">{t('auth.finishingRedirect')}</p>
      </div>
    )
  }

  if (uid) return <Navigate to={returnPath} replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      if (mode === 'up') await signUpEmail(email.trim(), password)
      else await signInEmail(email.trim(), password)
      navigate(returnPath, { replace: true })
    } catch (caught) {
      const key =
        caught instanceof Error && caught.message === 'auth.noFirebase'
          ? 'auth.noFirebaseError'
          : authErrorKey(caught)
      setError(t(key))
    } finally {
      setPending(false)
    }
  }

  async function google() {
    setError('')
    setPending(true)
    try {
      const outcome = await signInGoogle()
      if (outcome === 'signed-in') navigate(returnPath, { replace: true })
    } catch (caught) {
      setError(t(authErrorKey(caught)))
      setPending(false)
    }
  }

  return (
    <div className="anima-shell-bg mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <p className="mb-4 text-xl font-medium tracking-tight text-ink">{APP_NAME}</p>
      <SunsetBanner className="mb-4" />
      <Card>
        <h1 className="text-2xl font-medium">{t(mode === 'up' ? 'auth.signUpTitle' : 'auth.signInTitle')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t('auth.lead')}</p>
        {sessionStorage.getItem('anima-next') ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('auth.returnHint')}</p>
        ) : null}
        {standalone ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t('auth.googlePwaHint')}{' '}
            <a className="text-plum underline" href={browserAuthUrl}>
              {t('auth.openInBrowser')}
            </a>
          </p>
        ) : null}
        {typeof window !== 'undefined' && window.location.hostname === '127.0.0.1' ? (
          <p className="mt-3 text-sm leading-relaxed text-terra">
            {t('auth.useLocalhost')}{' '}
            <a className="underline" href="http://localhost:5173/auth">
              http://localhost:5173/auth
            </a>
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip active={mode === 'in'} onClick={() => setMode('in')}>
            {t('auth.signIn')}
          </Chip>
          <Chip active={mode === 'up'} onClick={() => setMode('up')}>
            {t('auth.signUp')}
          </Chip>
        </div>
        {ready ? (
          <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
            <Field label={t('auth.email')}>
              <TextField
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label={t('auth.password')}>
              <TextField
                type="password"
                autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            {error ? <p className="text-sm text-terra">{error}</p> : null}
            <Button type="submit" disabled={pending}>
              {mode === 'up' ? t('auth.signUp') : t('auth.signIn')}
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={() => void google()}>
              {t('auth.google')}
            </Button>
          </form>
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-muted">{t('auth.noFirebase')}</p>
        )}
        <Link to="/profile" className="mt-6 inline-flex min-h-11 items-center text-sm text-plum">
          {t('nav.back')}
        </Link>
      </Card>
    </div>
  )
}
