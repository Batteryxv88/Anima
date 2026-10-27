import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui'
import { HomeworkBlock } from '@/widgets/homework-block'

export function HomeworkPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('homework.title')} text={t('homework.text')} />
      <HomeworkBlock />
    </>
  )
}
