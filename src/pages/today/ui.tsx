import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCareStore, useShareStore } from '@/entities/care'
import { localeTags, type Locale } from '@/shared/config'
import { formatDay, normalizeScaleValue, SCALE_DEFAULT, scaleWordKey, todayId } from '@/shared/lib'
import { Button, Card, NoticeLayer, PageHeader, ScaleTap, useNotice } from '@/shared/ui'
import { HomeworkBlock } from '@/widgets/homework-block'
import { TodayForYouCard, TodayHubGreeting, TodayQuickTiles } from '@/widgets/today-hub'

export function TodayPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const saved = useCareStore((state) => state.checkIns.find((item) => item.date === todayId()))
  const saveCheckIn = useCareStore((state) => state.saveCheckIn)
  const isSpecialist = useShareStore((state) => state.therapistLinks.length > 0)
  const [mood, setMood] = useState(() => normalizeScaleValue(saved?.mood ?? SCALE_DEFAULT))
  const [anxiety, setAnxiety] = useState(() => normalizeScaleValue(saved?.anxiety ?? SCALE_DEFAULT))
  const [sleep, setSleep] = useState(() => normalizeScaleValue(saved?.sleep ?? SCALE_DEFAULT))
  const { notice, show, hide } = useNotice()

  return (
    <>
      <NoticeLayer notice={notice} onClose={hide} />
      <div className="hidden lg:block">
        <PageHeader title={t('today.title')} text={formatDay(todayId(), localeTags[locale])} />
      </div>
      <TodayHubGreeting dateLabel={formatDay(todayId(), localeTags[locale])} />
      <TodayForYouCard />
      <TodayQuickTiles className="mb-4" />
      <div className="grid gap-4">
        {isSpecialist ? (
          <Link to="/cabinet" className="rounded-2xl border border-plum/35 bg-plum/10 px-5 py-4">
            <p className="text-sm font-medium text-plum">{t('invite.asSpecialist')}</p>
            <p className="mt-1 text-sm text-muted">{t('cabinet.open')}</p>
          </Link>
        ) : null}
        <Card className="anima-sunset-gradient border-peach/25">
          <h2 className="text-base font-medium text-ink">{t('today.checkIn')}</h2>
          <div className="mt-4 grid gap-4">
            <ScaleTap
              label={t('today.mood')}
              minLabel={t('scale.mood.min')}
              maxLabel={t('scale.mood.max')}
              valueLabel={t(scaleWordKey('mood', mood))}
              value={mood}
              accent="coral"
              onChange={setMood}
            />
            <ScaleTap
              label={t('today.anxiety')}
              minLabel={t('scale.anxiety.min')}
              maxLabel={t('scale.anxiety.max')}
              valueLabel={t(scaleWordKey('anxiety', anxiety))}
              value={anxiety}
              accent="plum"
              onChange={setAnxiety}
            />
            <ScaleTap
              label={t('today.sleep')}
              minLabel={t('scale.sleep.min')}
              maxLabel={t('scale.sleep.max')}
              valueLabel={t(scaleWordKey('sleep', sleep))}
              value={sleep}
              accent="lavender"
              onChange={setSleep}
            />
          </div>
          <Button
            className="mt-5 w-full"
            onClick={() => {
              saveCheckIn({
                mood: normalizeScaleValue(mood),
                anxiety: normalizeScaleValue(anxiety),
                sleep: normalizeScaleValue(sleep),
              })
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
        <div className="hidden gap-3 sm:grid-cols-2 lg:grid">
          <Link to="/journal" className="rounded-2xl border border-lavender/40 bg-lavender/10 px-5 py-4 text-sm text-plum">
            {t('journal.open')}
          </Link>
          <Link to="/session" className="rounded-2xl border border-gold/35 bg-gold/10 px-5 py-4 text-sm text-plum">
            {t('today.toSession')}
          </Link>
        </div>
      </div>
    </>
  )
}
