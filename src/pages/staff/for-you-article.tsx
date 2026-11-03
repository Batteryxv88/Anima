import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  deleteForYouArticle,
  emptyForYouArticle,
  fillForYouTranslations,
  getForYouGroup,
  saveForYouArticle,
  useForYouStore,
} from '@/entities/for-you'
import { isStaffRole, useUserStore } from '@/entities/user'
import { Button, Card, ChoiceButton, Field, FormatArea, NoticeLayer, PageHeader, TextField, useNotice } from '@/shared/ui'

export function StaffForYouArticlePage() {
  const { groupId, articleId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const role = useUserStore((s) => s.role)
  const authReady = useUserStore((s) => s.authReady)
  const articles = useForYouStore((s) => s.articles)
  const group = useForYouStore((s) => s.groups.find((g) => g.id === groupId))
  const isNew = !articleId || articleId === 'new'
  const start = useMemo(() => {
    if (!groupId) return emptyForYouArticle('')
    if (isNew) {
      const inGroup = articles.filter((a) => a.groupId === groupId)
      return emptyForYouArticle(groupId, inGroup.length)
    }
    return articles.find((a) => a.id === articleId) ?? emptyForYouArticle(groupId)
  }, [articleId, articles, groupId, isNew])
  const [draft, setDraft] = useState(start)
  const [busy, setBusy] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState('')
  const { notice, show, hide } = useNotice()

  useEffect(() => {
    setDraft(start)
  }, [start])

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />
  const resolvedGroup = group ?? (groupId ? getForYouGroup(groupId) : undefined)
  if (!groupId || !resolvedGroup) return <Navigate to="/staff/for-you" replace />

  const patchRu = (patch: Partial<{ title: string; teaser: string; body: string }>) => {
    setDraft((current) => ({
      ...current,
      title: { ...current.title, ru: patch.title ?? current.title.ru },
      teaser: { ...current.teaser, ru: patch.teaser ?? current.teaser.ru },
      body: { ...current.body, ru: patch.body ?? current.body.ru },
    }))
  }

  const save = async (withTranslate: boolean) => {
    if (!draft.title.ru.trim() && !draft.teaser.ru.trim()) {
      setError(t('staff.forYouNeedTeaser'))
      return
    }
    setBusy(true)
    setError('')
    try {
      let next = draft
      if (withTranslate) {
        setTranslating(true)
        next = await fillForYouTranslations(draft)
        setDraft(next)
      }
      const id = await saveForYouArticle(next)
      show(t('staff.savedNotice'), t('staff.saved'))
      if (isNew) navigate(`/staff/for-you/${groupId}/${id}`, { replace: true })
    } catch {
      setError(t('staff.failed'))
    } finally {
      setBusy(false)
      setTranslating(false)
    }
  }

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <Link
        to={`/staff/for-you/${groupId}`}
        className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden"
      >
        {t('nav.back')}
      </Link>
      <PageHeader title={isNew ? t('staff.addArticle') : t('staff.forYouEditArticle')} />
      <Card>
        <div className="grid gap-3">
          <Field label={t('staff.title')}>
            <TextField value={draft.title.ru} onChange={(e) => patchRu({ title: e.target.value })} />
          </Field>
          <Field label={t('staff.forYouTeaser')}>
            <TextField value={draft.teaser.ru} onChange={(e) => patchRu({ teaser: e.target.value })} />
          </Field>
          <Field label={t('staff.forYouBody')}>
            <FormatArea
              label={t('staff.forYouBody')}
              value={draft.body.ru}
              onChange={(body) => patchRu({ body })}
              boldLabel={t('staff.bold')}
              italicLabel={t('staff.italic')}
              rows={12}
            />
          </Field>
          <ChoiceButton active={draft.active} onClick={() => setDraft((c) => ({ ...c, active: !c.active }))}>
            {t('staff.forYouActive')}
          </ChoiceButton>
          {error ? <p className="text-sm text-terra">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void save(false)}>
              {t('staff.saved')}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => void save(true)}>
              {translating ? t('staff.translating') : t('staff.forYouSaveTranslate')}
            </Button>
          </div>
          {!isNew && articleId ? (
            <Button
              variant="outline"
              className="text-terra"
              disabled={busy}
              onClick={() => {
                if (!window.confirm(t('staff.forYouConfirmDeleteArticle'))) return
                setBusy(true)
                void deleteForYouArticle(articleId)
                  .then(() => navigate(`/staff/for-you/${groupId}`))
                  .catch(() => setError(t('staff.failed')))
                  .finally(() => setBusy(false))
              }}
            >
              {t('staff.deleteArticle')}
            </Button>
          ) : null}
        </div>
      </Card>
    </>
  )
}
