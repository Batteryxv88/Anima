import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { findUserByEmail, listStaff, setStaffRole, useUserStore, type StaffRecord } from '@/entities/user'
import { FOUNDER_EMAIL, type StaffRole } from '@/shared/config'
import { Navigate } from 'react-router-dom'
import { Button, Card, ChoiceButton, Field, NoticeLayer, PageHeader, TextField, useNotice } from '@/shared/ui'

export function StaffRolesPage() {
  const { t } = useTranslation()
  const myRole = useUserStore((state) => state.role)
  const [staff, setStaff] = useState<StaffRecord[]>([])
  const [email, setEmail] = useState('')
  const [nextRole, setNextRole] = useState<StaffRole>('admin')
  const [error, setError] = useState('')
  const { notice, show, hide } = useNotice()

  const reload = () => {
    void listStaff()
      .then(setStaff)
      .catch(() => setError(t('staff.failed')))
  }

  useEffect(() => {
    reload()
  }, [])

  if (myRole !== 'superadmin') return <Navigate to="/profile" replace />

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <PageHeader title={t('staff.rolesTitle')} text={t('staff.rolesText')} />
      <div className="grid gap-4">
        <Card>
          <Field label={t('auth.email')}>
            <TextField value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" />
          </Field>
          <div className="mt-3 grid gap-2">
            {(['admin', 'superadmin', 'user'] as const).map((item) => (
              <ChoiceButton key={item} active={nextRole === item} onClick={() => setNextRole(item)}>
                {t(`staff.role.${item}`)}
              </ChoiceButton>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              setError('')
              void findUserByEmail(email)
                .then(async (user) => {
                  if (!user) throw new Error('staff.noUser')
                  await setStaffRole(user.uid, user.email, nextRole)
                  show(t('staff.roleNotice'))
                  setEmail('')
                  reload()
                })
                .catch((caught: unknown) => {
                  const key =
                    caught instanceof Error && (caught.message === 'staff.noUser' || caught.message === 'staff.founderLocked')
                      ? caught.message
                      : 'staff.failed'
                  setError(t(key))
                })
            }}
          >
            {t('staff.assign')}
          </Button>
          {error ? <p className="mt-3 text-sm text-terra">{error}</p> : null}
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('staff.current')}</h2>
          <ul className="mt-3 grid gap-2">
            {staff.length === 0 ? (
              <li className="text-sm text-muted">{t('staff.none')}</li>
            ) : (
              staff.map((item) => (
                <li key={item.uid} className="text-sm">
                  {item.email || item.uid}
                  <span className="text-muted"> — {t(`staff.role.${item.role}`)}</span>
                  {item.email === FOUNDER_EMAIL ? <span className="text-muted"> ({t('staff.founder')})</span> : null}
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </>
  )
}
