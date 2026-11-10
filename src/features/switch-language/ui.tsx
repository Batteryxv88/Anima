import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/entities/user'
import { locales, type Locale } from '@/shared/config'
import { cn } from '@/shared/lib'
import { Chip } from '@/shared/ui'

const welcomeLanguageLabel: Record<Locale, string> = {
  ru: 'Ru',
  en: 'En',
  sl: 'Sl',
}

export function WelcomeLanguageSwitch() {
  const { t } = useTranslation()
  const language = useUserStore((state) => state.language)
  const setLanguage = useUserStore((state) => state.setLanguage)

  return (
    <div
      className="flex justify-center gap-1"
      role="group"
      aria-label={t('onboarding.languageTitle')}
    >
      {locales.map((item) => {
        const active = language === item
        return (
          <button
            key={item}
            type="button"
            aria-label={t(`language.${item}`)}
            aria-pressed={active}
            onClick={() => setLanguage(item as Locale)}
            className={cn(
              'min-h-9 rounded-full border px-3 text-xs font-medium tracking-wide transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/50',
              active
                ? 'border-plum/35 bg-plum/10 text-plum'
                : 'border-transparent text-muted hover:border-line/80 hover:bg-card/60 hover:text-ink',
            )}
          >
            {welcomeLanguageLabel[item as Locale]}
          </button>
        )
      })}
    </div>
  )
}

export function LanguageSwitch({ size = 'default' }: { size?: 'default' | 'compact' }) {
  const { t } = useTranslation()
  const language = useUserStore((state) => state.language)
  const setLanguage = useUserStore((state) => state.setLanguage)

  return (
    <div className={cn('flex flex-wrap', size === 'compact' ? 'gap-1.5' : 'gap-2')}>
      {locales.map((item) => (
        <Chip
          key={item}
          size={size}
          active={language === item}
          onClick={() => setLanguage(item as Locale)}
        >
          {t(`language.${item}`)}
        </Chip>
      ))}
    </div>
  )
}
