import type { Locale } from '@/shared/config'

export const schools = ['cbt', 'dbt', 'act', 'cft', 'mindfulness', 'behavioral'] as const
export type School = (typeof schools)[number]

export const situations = [
  'panic',
  'rumination',
  'anger',
  'shame',
  'insomnia',
  'conflict',
  'urge',
  'numb',
  'crisis',
] as const
export type Situation = (typeof situations)[number]

export type TechniqueCopy = {
  title: string
  when: string
  caution: string
  steps: string[]
}

export type Technique = {
  id: string
  school: School
  situations: Situation[]
  durationMin: number
  intensity: 'calm' | 'mid' | 'crisis'
  copy: Record<Locale, TechniqueCopy>
}

export function techniqueCopy(technique: Technique, locale: Locale) {
  return technique.copy[locale] ?? technique.copy.ru
}
