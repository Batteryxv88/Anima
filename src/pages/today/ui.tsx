import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore, useShareStore } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { formatDay, scaleWordKey, todayId } from '@/shared/lib'
import { Button, Card, NoticeLayer, PageHeader, Scale, useNotice } from '@/shared/ui'
import { HomeworkBlock } from '@/widgets/homework-block'

export function TodayPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const saved = useCareStore((state) => state.checkIns.find((item) => item.date === todayId()))
  const saveCheckIn = useCareStore((state) => state.saveCheckIn)
  const isSpecialist = useShareStore((state) => state.therapistLinks.length > 0)
  const [mood, setMood] = useState(saved?.mood ?? 5)
  const [anxiety, setAnxiety] = useState(saved?.anxiety ?? 5)
  const [sleep, setSleep] = useState(saved?.sleep ?? 5)
  const { notice, show, hide } = useNotice()

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <PageHeader title={t('today.title')} text={formatDay(todayId(), localeTags[locale])} />
      <div className="grid gap-4">
        {isSpecialist ? (
          <Link to="/cabinet" className="rounded-2xl border border-sage/40 bg-sage/10 px-5 py-4">
            <p className="text-sm font-medium text-sage-deep">{t('invite.asSpecialist')}</p>
            <p className="mt-1 text-sm text-muted">{t('cabinet.open')}</p>
          </Link>
        ) : null}
        <Card>
          <h2 className="text-base font-medium text-ink">{t('today.checkIn')}</h2>
          <div className="mt-4 grid gap-4">
            <Scale
              label={t('today.mood')}
              minLabel={t('scale.mood.min')}
              maxLabel={t('scale.mood.max')}
              valueLabel={t(scaleWordKey('mood', mood))}
              value={mood}
              onChange={setMood}
            />
            <Scale
              label={t('today.anxiety')}
              minLabel={t('scale.anxiety.min')}
              maxLabel={t('scale.anxiety.max')}
              valueLabel={t(scaleWordKey('anxiety', anxiety))}
              value={anxiety}
              onChange={setAnxiety}
            />
            <Scale
              label={t('today.sleep')}
              minLabel={t('scale.sleep.min')}
              maxLabel={t('scale.sleep.max')}
              valueLabel={t(scaleWordKey('sleep', sleep))}
              value={sleep}
              onChange={setSleep}
            />
          </div>
          <Button
            className="mt-5 w-full"
            onClick={() => {
              saveCheckIn({ mood, anxiety, sleep })
              show(t('common.savedNotice'), t('today.saved'))
            }}
          >
            {t('today.save')}
          </Button>
        </Card>
        <div>
          <h2 className="mb-3 text-base font-medium">{t('today.weekTitle')}</h2>
          <HomeworkBlock />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/journal" className="rounded-2xl border border-line bg-card px-5 py-4 text-sm text-sage-deep">
            {t('journal.open')}
          </Link>
          <Link to="/session" className="rounded-2xl border border-line bg-card px-5 py-4 text-sm text-sage-deep">
            {t('today.toSession')}
          </Link>
          <Link to="/paths" className="rounded-2xl border border-line bg-card px-5 py-4 text-sm text-sage-deep sm:col-span-2">
            {t('paths.open')}
          </Link>
        </div>
      </div>
    </>
  )
}
