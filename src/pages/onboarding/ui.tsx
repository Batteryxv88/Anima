import { useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/entities/user'
import { WelcomeLanguageSwitch } from '@/features/switch-language'
import { ThemeSwitch } from '@/features/toggle-theme'
import { APP_NAME, careModes, countries, type CareMode, type Country } from '@/shared/config'
import { takeNext } from '@/shared/lib'
import { Button, Card, ChoiceButton, ChoiceGroup } from '@/shared/ui'

const welcomeBeads: { className: string; style: CSSProperties }[] = [
  { className: 'bg-sage anima-welcome-bead', style: { top: '6%', left: '2%', animationDelay: '0s' } },
  { className: 'bg-ink anima-welcome-bead', style: { top: '14%', right: '0%', animationDelay: '2.5s' } },
  { className: 'bg-sand anima-welcome-bead', style: { bottom: '10%', left: '10%', animationDelay: '5s' } },
]

function WelcomeHorizon() {
  return (
    <svg
      className="anima-welcome-horizon pointer-events-none absolute inset-x-0 bottom-0 h-[min(30vh,13rem)] w-full"
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillOpacity="0.1"
        d="M0,52 C80,38 120,68 200,50 S320,32 400,48 L400,100 L0,100 Z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.05"
        d="M0,62 C100,48 160,72 260,58 S340,44 400,56 L400,100 L0,100 Z"
      />
    </svg>
  )
}

function WelcomeMark() {
  return (
    <div className="relative mx-auto flex size-[11.5rem] items-center justify-center" aria-hidden="true">
      {welcomeBeads.map((bead) => (
        <span
          key={bead.className}
          className={`absolute size-2.5 rounded-full ${bead.className}`}
          style={bead.style}
        />
      ))}
      <span className="anima-breath-ring absolute size-36 rounded-full bg-sage/15" />
      <span className="anima-breath absolute size-28 rounded-full bg-sage/22" />
      <span className="relative text-xl font-medium tracking-tight">{APP_NAME}</span>
    </div>
  )
}

function WelcomeScene({ language, onNext }: { language: string; onNext: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="anima-welcome-scene relative min-h-dvh overflow-hidden">
      <div className="anima-welcome-bg pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="anima-welcome-grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <WelcomeHorizon />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-8 pt-5 sm:px-6">
        <WelcomeLanguageSwitch />

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <WelcomeMark />
          <p
            className="anima-welcome-line mt-5 max-w-xs text-center text-sm text-muted"
            style={{ animationDelay: '180ms' }}
          >
            {t('onboarding.welcomeBreathHint')}
          </p>

          <div key={language} className="mt-8 w-full">
            <h1
              className="anima-welcome-line text-center text-[1.65rem] font-medium leading-snug tracking-tight sm:text-[1.85rem]"
              style={{ animationDelay: '340ms' }}
            >
              {t('onboarding.welcomeTitle')}
            </h1>
            <p
              className="anima-welcome-line mt-5 text-center text-base leading-relaxed text-ink/90"
              style={{ animationDelay: '560ms' }}
            >
              {t('onboarding.welcomeBody')}
            </p>
            <p
              className="anima-welcome-line mt-4 text-center text-sm leading-relaxed text-muted"
              style={{ animationDelay: '780ms' }}
            >
              {t('onboarding.welcomeNote')}
            </p>
          </div>
        </div>

        <Button className="w-full shrink-0" onClick={onNext}>
          {t('onboarding.next')}
        </Button>
      </div>
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

  const setupSteps = [
    {
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

  if (step === 0) {
    return <WelcomeScene language={language} onNext={() => setStep(1)} />
  }

  const current = setupSteps[step - 1]
  const last = step === setupSteps.length

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-10">
      <p className="mb-6 text-lg font-medium tracking-tight">{APP_NAME}</p>
      <Card className="anima-panel-in">
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
            navigate(takeNext('/today'), { replace: true })
          }}
        >
          {last ? t('onboarding.start') : t('onboarding.next')}
        </Button>
      </Card>
    </div>
  )
}
