import { useTranslation } from 'react-i18next'
import { useUserStore } from '@/entities/user'
import { themes, type Theme } from '@/shared/config'
import { cn } from '@/shared/lib'
import { Chip } from '@/shared/ui'

export function ThemeSwitch({ size = 'default' }: { size?: 'default' | 'compact' }) {
  const { t } = useTranslation()
  const theme = useUserStore((state) => state.theme)
  const setTheme = useUserStore((state) => state.setTheme)

  return (
    <div className={cn('flex flex-wrap', size === 'compact' ? 'gap-1.5' : 'gap-2')}>
      {themes.map((item) => (
        <Chip key={item} size={size} active={theme === item} onClick={() => setTheme(item as Theme)}>
          {t(`theme.${item}`)}
        </Chip>
      ))}
    </div>
  )
}
