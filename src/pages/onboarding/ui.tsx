import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
import { LanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { APP_NAME, careModes, countries, type CareMode, type Country } from '@/shared/config'
import { cn, takeNext } from '@/shared/lib'
import { Button, Card, ChoiceButton, ChoiceGroup } from '@/shared/ui'

function WelcomeMark() {
  return (
    <div className="relative mx-auto mb-5 flex size-28 items-center justify-center" aria-hidden="true">
      <span className="anima-breath-ring absolute size-28 rounded-full bg-sage/15" />
      <span className="anima-breath absolute size-20 rounded-full bg-sage/25" />
      <span className="relative text-lg font-medium tracking-tight">{APP_NAME}</span>
    </div>
  )
}

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [ageOk, setAgeOk] = useState(false)
  const language = useUserStore((state) => state.language)
  const mode = useUserStore((state) => state.mode)
  const country = useUserStore((state) => state.country)
  const setMode = useUserStore((state) => state.setMode)
  const setCountry = useUserStore((state) => state.setCountry)
  const completeOnboarding = useUserStore((state) => state.completeOnboarding)

  const steps = [
    {
      welcome: true,
      title: '',
      text: '',
      body: null,
    },
    {
      welcome: false,
      title: t('onboarding.themeTitle'),
      text: t('onboarding.themeText'),
      body: <ThemeSwitch />,
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
    <div
      className={cn(
        'mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4',
        current.welcome ? 'py-6' : 'py-10',
      )}
    >
      {current.welcome ? <WelcomeMark /> : <p className="mb-6 text-lg font-medium tracking-tight">{APP_NAME}</p>}
      <Card>
        {current.welcome ? (
          <>
            <p className="mb-2 text-sm text-muted">{t('onboarding.languageTitle')}</p>
            <LanguageSwitch />
            <p className="mt-2 text-sm text-muted">{t('onboarding.languageText')}</p>
            <div key={language} className="mt-6">
              <h1
                className="anima-welcome-line text-2xl font-medium leading-snug"
                style={{ animationDelay: '80ms' }}
              >
                {t('onboarding.welcomeTitle')}
              </h1>
              <p
                className="anima-welcome-line mt-4 text-base leading-relaxed"
                style={{ animationDelay: '360ms' }}
              >
                {t('onboarding.welcomeBody')}
              </p>
              <p
                className="anima-welcome-line mt-3 text-base leading-relaxed"
                style={{ animationDelay: '640ms' }}
              >
                {t('onboarding.welcomeNote')}
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-medium">{current.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">{current.text}</p>
            <div className="mt-6">{current.body}</div>
          </>
        )}
        <Button
          className={current.welcome ? 'mt-6 w-full' : 'mt-8 w-full'}
          disabled={last && !ageOk}
          onClick={() => {
            if (!last) {
              setStep((value) => value + 1)
              return
            }
            completeOnboarding()
            navigate(takeNext('/today'), { replace: true })
          }}
        >
          {last ? t('onboarding.start') : t('onboarding.next')}
        </Button>
      </Card>
    </div>
  )
}
