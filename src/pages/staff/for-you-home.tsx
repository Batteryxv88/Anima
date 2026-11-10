import { Plus, Trash2 } from 'lucide-react'
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
import { cn, createId, firestoreErrorKey } from '@/shared/lib'
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  IconButton,
  NoticeLayer,
  PageHeader,
  TextField,
  useNotice,
} from '@/shared/ui'

type PendingConfirm = { title: string; text?: string; run: () => void }

const compactTextLink =
  'inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-plum hover:text-plum-deep'

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
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null)
  const { notice, show, hide } = useNotice()

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />

  const countInGroup = (groupId: string) => articles.filter((a) => a.groupId === groupId).length

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ''}
        text={confirm?.text}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.run()
          setConfirm(null)
        }}
      />
      <Link to="/profile" className="mb-3 inline-flex min-h-9 items-center text-sm text-plum">
        {t('nav.back')}
      </Link>
      <PageHeader title={t('staff.forYouTitle')} text={t('staff.forYouText')} />
      <Card className="mb-4">
        <p className="text-sm text-muted">
          {groups.length === 0 ? t('staff.forYouEmpty') : t('staff.forYouHasGroups')}
        </p>
        <Button
          className="mt-3"
          size="sm"
          variant={groups.length === 0 ? 'primary' : 'outline'}
          disabled={busy}
          onClick={() => {
            const run = () => {
              setBusy(true)
              setError('')
              void seedDefaultForYouContent()
                .then(() => show(t('common.savedNotice'), t('staff.forYouSeeded')))
                .catch((caught) => {
                  console.error('[for-you] seed failed', caught)
                  setError(t(firestoreErrorKey(caught)))
                })
                .finally(() => setBusy(false))
            }
            if (groups.length > 0) {
              setConfirm({ title: t('staff.forYouSeedConfirm'), run })
              return
            }
            run()
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
            size="sm"
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
                  show(t('common.savedNotice'), t('staff.forYouGroupSaved'))
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
          <Card key={group.id} className="grid gap-2">
            <div className="flex items-start gap-1">
              <Link to={`/staff/for-you/${group.id}`} className="min-w-0 flex-1 text-left hover:opacity-90">
                <p className="font-medium text-plum">{forYouText(group.title, locale)}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {t('staff.forYouArticleCount', { count: countInGroup(group.id) })}
                </p>
              </Link>
              <IconButton
                variant="danger"
                disabled={busy}
                aria-label={t('staff.deleteGroup')}
                onClick={() =>
                  setConfirm({
                    title: t('staff.forYouConfirmDeleteGroup'),
                    run: () => {
                      setBusy(true)
                      void deleteForYouGroup(group.id)
                        .then(() => show(t('staff.forYouGroupDeletedTitle'), t('staff.forYouGroupDeletedHint')))
                        .catch((caught) => setError(t(firestoreErrorKey(caught))))
                        .finally(() => setBusy(false))
                    },
                  })
                }
              >
                <Trash2 size={18} strokeWidth={1.75} aria-hidden />
              </IconButton>
            </div>
            <Link to={`/staff/for-you/${group.id}/new`} className={cn(compactTextLink, 'w-fit')}>
              <Plus size={16} strokeWidth={2} aria-hidden />
              {t('staff.addArticle')}
            </Link>
          </Card>
        ))}
      </div>
    </>
  )
}
