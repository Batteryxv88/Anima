import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/entities/user'
import { LanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { countries, type Country } from '@/shared/config'
import { Card, ChoiceButton, ChoiceGroup, PageHeader } from '@/shared/ui'

export function ProfilePage() {
  const { t } = useTranslation()
  const largeText = useUserStore((state) => state.largeText)
  const setLargeText = useUserStore((state) => state.setLargeText)
  const country = useUserStore((state) => state.country)
  const setCountry = useUserStore((state) => state.setCountry)
  const mode = useUserStore((state) => state.mode)
  const setMode = useUserStore((state) => state.setMode)

  return (
    <>
      <PageHeader title={t('profile.title')} />
      <div className="grid gap-4">
        <Card>
          <h2 className="text-base font-medium">{t('profile.appearance')}</h2>
          <div className="mt-4 grid gap-4">
            <LanguageSwitch />
            <ThemeSwitch />
            <ChoiceButton active={largeText} onClick={() => setLargeText(!largeText)}>
              {t('profile.largeText')}
            </ChoiceButton>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('profile.care')}</h2>
          <div className="mt-4 grid gap-2">
            <ChoiceButton active={mode === 'self'} onClick={() => setMode('self')}>
              {t('onboarding.self')}
            </ChoiceButton>
            <ChoiceButton active={mode === 'with-therapist'} onClick={() => setMode('with-therapist')}>
              {t('onboarding.withTherapist')}
            </ChoiceButton>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('profile.therapistSoon')}</p>
          <p className="mt-4 text-sm font-medium">{t('onboarding.countryTitle')}</p>
          <ChoiceGroup>
            {countries.map((item) => (
              <ChoiceButton key={item} active={country === item} onClick={() => setCountry(item as Country)}>
                {t(`country.${item}`)}
              </ChoiceButton>
            ))}
          </ChoiceGroup>
        </Card>
        <Card>
          <h2 className="text-base font-medium">{t('profile.about')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('profile.disclaimer')}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t('profile.data')}</p>
        </Card>
      </div>
    </>
  )
}
