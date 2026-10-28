import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { authErrorKey, signInEmail, signInGoogle, signUpEmail, useUserStore } from '@/entities/user'
import { APP_NAME } from '@/shared/config'
import { isFirebaseConfigured } from '@/shared/firebase'
import { takeNext } from '@/shared/lib'
import { Button, Card, Chip, Field, TextField } from '@/shared/ui'

export function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const uid = useUserStore((state) => state.uid)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const ready = isFirebaseConfigured()
  const nextRef = useRef(takeNext('/profile'))

  if (uid) return <Navigate to={nextRef.current} replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      if (mode === 'up') await signUpEmail(email.trim(), password)
      else await signInEmail(email.trim(), password)
      navigate(nextRef.current, { replace: true })
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
    try {
      await signInGoogle()
      navigate(nextRef.current, { replace: true })
    } catch (caught) {
      setError(t(authErrorKey(caught)))
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <p className="mb-6 text-lg font-medium tracking-tight">{APP_NAME}</p>
      <Card>
        <h1 className="text-2xl font-medium">{t(mode === 'up' ? 'auth.signUpTitle' : 'auth.signInTitle')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t('auth.lead')}</p>
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
        <Link to="/profile" className="mt-6 inline-flex min-h-11 items-center text-sm text-sage-deep">
          {t('nav.back')}
        </Link>
      </Card>
    </div>
  )
}
