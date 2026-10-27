import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/entities/user'
import { themes, type Theme } from '@/shared/config'
import { Chip } from '@/shared/ui'

export function ThemeSwitch() {
  const { t } = useTranslation()
  const theme = useUserStore((state) => state.theme)
  const setTheme = useUserStore((state) => state.setTheme)

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((item) => (
        <Chip key={item} active={theme === item} onClick={() => setTheme(item as Theme)}>
          {t(`theme.${item}`)}
        </Chip>
      ))}
    </div>
  )
}
