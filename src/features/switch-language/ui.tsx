import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/entities/user'
import { locales, type Locale } from '@/shared/config'
import { Chip } from '@/shared/ui'

export function LanguageSwitch() {
  const { t } = useTranslation()
  const language = useUserStore((state) => state.language)
  const setLanguage = useUserStore((state) => state.setLanguage)

  return (
    <div className="flex flex-wrap gap-2">
      {locales.map((item) => (
        <Chip key={item} active={language === item} onClick={() => setLanguage(item as Locale)}>
          {t(`language.${item}`)}
        </Chip>
      ))}
    </div>
  )
}
