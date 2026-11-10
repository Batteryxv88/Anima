import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { forYouText, getForYouGroup, useForYouStore } from '@/entities/for-you'
import { isStaffRole, useUserStore } from '@/entities/user'
import { type Locale } from '@/shared/config'
import { Card, NoticeLayer, PageHeader, useNotice } from '@/shared/ui'

export function StaffForYouGroupPage() {
  const { groupId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const role = useUserStore((s) => s.role)
  const authReady = useUserStore((s) => s.authReady)
  const allGroups = useForYouStore((s) => s.groups)
  const allArticles = useForYouStore((s) => s.articles)
  const group = useMemo(() => allGroups.find((g) => g.id === groupId), [allGroups, groupId])
  const articles = useMemo(
    () => allArticles.filter((a) => a.groupId === groupId),
    [allArticles, groupId],
  )
  const { notice, show, hide } = useNotice()
  const flashHandled = useRef(false)

  useEffect(() => {
    flashHandled.current = false
  }, [groupId])

  useEffect(() => {
    const flash = location.state as { articleDeleted?: boolean; articleSaved?: boolean } | null
    if (!flash?.articleDeleted && !flash?.articleSaved) return
    if (flashHandled.current) return
    flashHandled.current = true
    if (flash.articleDeleted) {
      show(t('staff.forYouArticleDeletedTitle'))
    } else {
      show(t('common.savedNotice'), t('staff.forYouArticleSaved'))
    }
    navigate(location.pathname, { replace: true, state: {} })
  }, [location.pathname, location.state, navigate, show, t])

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />
  const resolved = group ?? (groupId ? getForYouGroup(groupId) : undefined)
  if (!groupId || !resolved) return <Navigate to="/staff/for-you" replace />

  const sorted = [...articles].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <Link to="/staff/for-you" className="mb-3 inline-flex min-h-9 items-center text-sm text-plum">
        {t('nav.back')}
      </Link>
      <PageHeader
        title={forYouText(resolved.title, locale)}
        text={t('staff.forYouGroupText')}
        action={
          <Link
            to={`/staff/for-you/${groupId}/new`}
            className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-plum hover:text-plum-deep"
          >
            <Plus size={16} strokeWidth={2} aria-hidden />
            {t('staff.addArticle')}
          </Link>
        }
      />
      <div className="grid gap-3">
        {sorted.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">{t('staff.forYouNoArticles')}</p>
            <Link
              to={`/staff/for-you/${groupId}/new`}
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-plum hover:text-plum-deep"
            >
              <Plus size={16} strokeWidth={2} aria-hidden />
              {t('staff.addArticle')}
            </Link>
          </Card>
        ) : (
          sorted.map((article) => (
            <Link
              key={article.id}
              to={`/staff/for-you/${groupId}/${article.id}`}
              className="block rounded-2xl border border-line bg-card px-5 py-4 hover:border-plum/35"
            >
              <p className="font-medium text-ink">
                {forYouText(article.title, locale) || forYouText(article.teaser, locale)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{forYouText(article.teaser, locale)}</p>
              {!article.active ? (
                <p className="mt-2 text-xs text-muted">{t('staff.forYouInactive')}</p>
              ) : null}
            </Link>
          ))
        )}
      </div>
    </>
  )
}
