import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import {
  deleteForYouGroup,
  fillForYouGroupTranslations,
  forYouText,
  saveForYouGroup,
  seedDefaultForYouContent,
  useForYouStore,
} from '@/entities/for-you'
import { isStaffRole, useUserStore } from '@/entities/user'
import { type Locale } from '@/shared/config'
import { createId, firestoreErrorKey } from '@/shared/lib'
import { Button, Card, Field, NoticeLayer, PageHeader, TextField, useNotice } from '@/shared/ui'

export function StaffForYouHomePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const role = useUserStore((s) => s.role)
  const authReady = useUserStore((s) => s.authReady)
  const groups = useForYouStore((s) => s.groups)
  const articles = useForYouStore((s) => s.articles)
  const [titleRu, setTitleRu] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { notice, show, hide } = useNotice()

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />

  const countInGroup = (groupId: string) => articles.filter((a) => a.groupId === groupId).length

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <Link to="/profile" className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader title={t('staff.forYouTitle')} text={t('staff.forYouText')} />
      <Card className="mb-4">
        <p className="text-sm text-muted">
          {groups.length === 0 ? t('staff.forYouEmpty') : t('staff.forYouHasGroups')}
        </p>
        <Button
          className="mt-4"
          variant={groups.length === 0 ? 'primary' : 'outline'}
          disabled={busy}
          onClick={() => {
            if (groups.length > 0 && !window.confirm(t('staff.forYouSeedConfirm'))) return
            setBusy(true)
            setError('')
            void seedDefaultForYouContent()
              .then(() => show(t('staff.savedNotice'), t('staff.forYouSeeded')))
              .catch((caught) => {
                console.error('[for-you] seed failed', caught)
                setError(t(firestoreErrorKey(caught)))
              })
              .finally(() => setBusy(false))
          }}
        >
          {t('staff.forYouSeed')}
        </Button>
      </Card>
      <Card className="mb-4">
        <h2 className="text-base font-medium">{t('staff.addGroup')}</h2>
        <div className="mt-3 grid gap-3">
          <Field label={t('staff.title')}>
            <TextField value={titleRu} onChange={(e) => setTitleRu(e.target.value)} />
          </Field>
          {error ? <p className="text-sm text-terra">{error}</p> : null}
          <Button
            disabled={busy || !titleRu.trim()}
            onClick={() => {
              setBusy(true)
              setError('')
              const draft = {
                id: createId(),
                title: { ru: titleRu.trim(), en: '', sl: '' },
                order: groups.length,
              }
              void fillForYouGroupTranslations(draft)
                .then((filled) => saveForYouGroup(filled))
                .then(() => {
                  setTitleRu('')
                  show(t('staff.savedNotice'), t('staff.saved'))
                })
                .catch((caught) => setError(t(firestoreErrorKey(caught))))
                .finally(() => setBusy(false))
            }}
          >
            {t('staff.addGroup')}
          </Button>
        </div>
      </Card>
      <div className="grid gap-3">
        {groups.map((group) => (
          <Card key={group.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link to={`/staff/for-you/${group.id}`} className="font-medium text-plum">
                {forYouText(group.title, locale)}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {t('staff.forYouArticleCount', { count: countInGroup(group.id) })}
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 text-terra"
              disabled={busy}
              onClick={() => {
                if (!window.confirm(t('staff.forYouConfirmDeleteGroup'))) return
                setBusy(true)
                void deleteForYouGroup(group.id)
                  .then(() => show(t('staff.deletedNotice'), t('staff.forYouGroupDeleted')))
                  .catch((caught) => setError(t(firestoreErrorKey(caught))))
                  .finally(() => setBusy(false))
              }}
            >
              {t('staff.deleteGroup')}
            </Button>
          </Card>
        ))}
      </div>
    </>
  )
}
