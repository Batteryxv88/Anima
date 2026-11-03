import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { forYouText, getForYouGroup, useForYouStore } from '@/entities/for-you'
import { isStaffRole, useUserStore } from '@/entities/user'
import { type Locale } from '@/shared/config'
import { Card, PageHeader } from '@/shared/ui'

export function StaffForYouGroupPage() {
  const { groupId } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const role = useUserStore((s) => s.role)
  const authReady = useUserStore((s) => s.authReady)
  const group = useForYouStore((s) => s.groups.find((g) => g.id === groupId))
  const articles = useForYouStore((s) => s.articles.filter((a) => a.groupId === groupId))

  if (!authReady) return null
  if (!isStaffRole(role)) return <Navigate to="/profile" replace />
  const resolved = group ?? (groupId ? getForYouGroup(groupId) : undefined)
  if (!groupId || !resolved) return <Navigate to="/staff/for-you" replace />

  const sorted = [...articles].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))

  return (
    <>
      <Link to="/staff/for-you" className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader title={forYouText(resolved.title, locale)} text={t('staff.forYouGroupText')} />
      <Link
        to={`/staff/for-you/${groupId}/new`}
        className="mb-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-plum px-4 text-sm font-medium text-white dark:text-ink sm:w-auto"
      >
        {t('staff.addArticle')}
      </Link>
      <div className="grid gap-3">
        {sorted.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">{t('staff.forYouNoArticles')}</p>
          </Card>
        ) : (
          sorted.map((article) => (
            <Link
              key={article.id}
              to={`/staff/for-you/${groupId}/${article.id}`}
              className="block rounded-2xl border border-line bg-card px-5 py-4 hover:border-plum/35"
            >
              <p className="font-medium text-ink">{forYouText(article.title, locale) || forYouText(article.teaser, locale)}</p>
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
