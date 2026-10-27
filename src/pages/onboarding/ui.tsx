import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
import { LanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { APP_NAME, careModes, countries, type CareMode, type Country } from '@/shared/config'
import { Button, Card, ChoiceButton, ChoiceGroup } from '@/shared/ui'

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [ageOk, setAgeOk] = useState(false)
  const mode = useUserStore((state) => state.mode)
  const country = useUserStore((state) => state.country)
  const setMode = useUserStore((state) => state.setMode)
  const setCountry = useUserStore((state) => state.setCountry)
  const completeOnboarding = useUserStore((state) => state.completeOnboarding)

  const steps = [
    {
      title: t('onboarding.languageTitle'),
      text: t('onboarding.languageText'),
      body: (
        <div className="grid gap-6">
          <LanguageSwitch />
          <div>
            <p className="mb-2 text-sm text-muted">{t('onboarding.themeTitle')}</p>
            <p className="mb-3 text-sm text-muted">{t('onboarding.themeText')}</p>
            <ThemeSwitch />
          </div>
        </div>
      ),
    },
    {
      title: t('onboarding.pathTitle'),
      text: t('onboarding.countryText'),
      body: (
        <div className="grid gap-6">
          <ChoiceGroup>
            {careModes.map((item) => (
              <ChoiceButton key={item} active={mode === item} onClick={() => setMode(item as CareMode)}>
                {t(item === 'self' ? 'onboarding.self' : 'onboarding.withTherapist')}
              </ChoiceButton>
            ))}
          </ChoiceGroup>
          <div>
            <p className="mb-2 text-sm font-medium">{t('onboarding.countryTitle')}</p>
            <ChoiceGroup>
              {countries.map((item) => (
                <ChoiceButton key={item} active={country === item} onClick={() => setCountry(item as Country)}>
                  {t(`country.${item}`)}
                </ChoiceButton>
              ))}
            </ChoiceGroup>
          </div>
        </div>
      ),
    },
    {
      title: t('onboarding.disclaimerTitle'),
      text: t('onboarding.disclaimer'),
      body: (
        <ChoiceButton active={ageOk} onClick={() => setAgeOk((value) => !value)}>
          {t('onboarding.age')}
        </ChoiceButton>
      ),
    },
  ]

  const current = steps[step]
  const last = step === steps.length - 1

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <p className="mb-6 text-lg font-medium tracking-tight">{APP_NAME}</p>
      <Card>
        <h1 className="text-2xl font-medium">{current.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{current.text}</p>
        <div className="mt-6">{current.body}</div>
        <Button
          className="mt-8 w-full"
          disabled={last && !ageOk}
          onClick={() => {
            if (!last) {
              setStep((value) => value + 1)
              return
            }
            completeOnboarding()
            navigate('/today', { replace: true })
          }}
        >
          {last ? t('onboarding.start') : t('onboarding.next')}
        </Button>
      </Card>
    </div>
  )
}
