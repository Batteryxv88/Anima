import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'
import { forYouText, useForYouStore } from '@/entities/for-you'
import { type Locale } from '@/shared/config'
import { Chip, PageHeader, RichText } from '@/shared/ui'

export function ForYouArticlePage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const article = useForYouStore((s) => (id ? s.articles.find((a) => a.id === id) : undefined))
  const group = useForYouStore((s) =>
    article ? s.groups.find((g) => g.id === article.groupId) : undefined,
  )

  if (!id || !article) return <Navigate to="/today" replace />

  return (
    <>
      <Link to="/today" className="mb-3 inline-flex min-h-11 items-center text-sm text-plum lg:hidden">
        {t('nav.back')}
      </Link>
      <PageHeader title={forYouText(article.title, locale)} />
      {group ? (
        <Chip className="mb-4 w-fit bg-plum/10 text-plum">{forYouText(group.title, locale)}</Chip>
      ) : null}
      <RichText text={forYouText(article.body, locale)} className="text-base leading-relaxed text-ink" />
    </>
  )
}
