import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { pushShareSnapshots } from '@/entities/care'
import { pushProfile, useUserStore } from '@/entities/user'
import { Button, Card, Field, TextField } from '@/shared/ui'

export function NameStep({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation()
  const uid = useUserStore((state) => state.uid)
  const setDisplayName = useUserStore((state) => state.setDisplayName)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  return (
    <Card>
      <h1 className="text-2xl font-medium">{t('name.title')}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t('name.text')}</p>
      <div className="mt-6">
        <Field label={t('name.label')}>
          <TextField
            value={name}
            maxLength={80}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
      </div>
      {error ? <p className="mt-3 text-sm text-terra">{error}</p> : null}
      <Button
        className="mt-6 w-full"
        disabled={!name.trim() || busy}
        onClick={() => {
          const trimmed = name.trim()
          if (!uid || !trimmed) return
          setError('')
          setBusy(true)
          setDisplayName(trimmed)
          void pushProfile(uid, { includeDisplayName: true })
            .then(() => pushShareSnapshots(uid, trimmed))
            .then(() => onSaved())
            .catch(() => setError(t('auth.failed')))
            .finally(() => setBusy(false))
        }}
      >
        {t('common.save')}
      </Button>
    </Card>
  )
}
