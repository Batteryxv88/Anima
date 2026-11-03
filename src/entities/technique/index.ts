export {
  deleteTechnique,
  emptyField,
  emptyTechnique,
  fallbackLocales,
  fillTranslations,
  getTechnique,
  listenTechniques,
  saveTechnique,
  useTechniqueStore,
} from './api'
export {
  averageRating,
  listenTechniqueStats,
  normalizeSkillRating,
  useTechniqueStatsStore,
  type TechniqueStats,
} from './stats'
export { uploadTechniqueCover } from './cover'
export {
  schoolAccent,
  schoolAccentBgSoft,
  schoolAccentBorderLeft,
  schoolAccentText,
  type SchoolAccent,
} from './school-accent'
export {
  fieldKinds,
  fieldLabel,
  filledAnswers,
  catalogSituations,
  situations,
  schools,
  techniqueCopy,
  techniqueMatchesSearch,
  type FieldAnswers,
  type FieldKind,
  type CatalogSituation,
  type School,
  type Situation,
  type Technique,
  type TechniqueField,
} from './model'
export { SkillAverageRating, SkillLikeButton, SkillStarRating, SkillUserRating } from './skill-feedback'
export { AnswerList, TechniqueCard, TechniqueCover, TechniqueFields } from './ui'
