import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/entities/user'
import { Button, Card, Field, TextField } from '@/shared/ui'

export function NameStep({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation()
  const setDisplayName = useUserStore((state) => state.setDisplayName)
  const [name, setName] = useState('')

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
      <Button
        className="mt-6 w-full"
        disabled={!name.trim()}
        onClick={() => {
          setDisplayName(name)
          onSaved()
        }}
      >
        {t('common.save')}
      </Button>
    </Card>
  )
}
