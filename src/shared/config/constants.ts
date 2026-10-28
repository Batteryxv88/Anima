export const APP_NAME = 'Anima'
export const FOUNDER_EMAIL = 'waterviewme@gmail.com'

export const staffRoles = ['user', 'admin', 'superadmin'] as const
export type StaffRole = (typeof staffRoles)[number]

export const locales = ['ru', 'en', 'sl'] as const
export type Locale = (typeof locales)[number]

export const themes = ['light', 'dark', 'system'] as const
export type Theme = (typeof themes)[number]

export const countries = ['si', 'ru', 'other'] as const
export type Country = (typeof countries)[number]

export const careModes = ['self', 'with-therapist'] as const
export type CareMode = (typeof careModes)[number]

export const navItems = [
  { to: '/today', key: 'nav.today', icon: 'today' },
  { to: '/skills', key: 'nav.skills', icon: 'skills' },
  { to: '/homework', key: 'nav.homework', icon: 'homework' },
  { to: '/session', key: 'nav.session', icon: 'session' },
] as const

export const localeTags: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-GB',
  sl: 'sl-SI',
}
