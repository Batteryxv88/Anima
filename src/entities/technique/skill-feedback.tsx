import { Heart, Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { setSkillLike, setSkillRating } from '@/entities/care'
import { useCareStore } from '@/entities/care/model'
import { useUserStore } from '@/entities/user'
import { cn, rememberAuthReturn } from '@/shared/lib'
import { averageRating, backfillSkillRatingStat, useTechniqueStatsStore } from './stats'

const starSteps = [1, 2, 3, 4, 5] as const

function useRequireSignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const uid = useUserStore((state) => state.uid)
  return useCallback(() => {
    if (uid) return true
    rememberAuthReturn(`${location.pathname}${location.search}`)
    navigate('/auth')
    return false
  }, [location.pathname, location.search, navigate, uid])
}

export function SkillAverageRating({
  techniqueId,
  className,
  compact,
}: {
  techniqueId: string
  className?: string
  compact?: boolean
}) {
  const { t } = useTranslation()
  const stats = useTechniqueStatsStore((state) => state.byId[techniqueId])
  const avg = averageRating(stats)
  if (avg == null) return null
  const count = stats?.ratingCount ?? 0
  const avgLabel = avg.toFixed(1)
  const full = t('skills.ratingAvg', { avg: avgLabel, count })
  if (compact) {
    return (
      <span
        className={cn(
          'pointer-events-none inline-flex items-center rounded-full border border-line/80 bg-canvas/95 px-2 py-0.5',
          'text-[11px] tabular-nums leading-none text-muted shadow-sm',
          className,
        )}
        title={full}
      >
        {t('skills.ratingAvgShort', { avg: avgLabel })}
      </span>
    )
  }
  return (
    <p className={cn('text-xs text-muted', className)}>
      {full}
    </p>
  )
}

export function SkillLikeButton({
  techniqueId,
  className,
  compact,
  ghost,
}: {
  techniqueId: string
  className?: string
  compact?: boolean
  ghost?: boolean
}) {
  const { t } = useTranslation()
  const uid = useUserStore((state) => state.uid)
  const requireSignIn = useRequireSignIn()
  const liked = useCareStore((state) =>
    uid ? Boolean(state.skillPrefs[techniqueId]?.liked) : false,
  )

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? t('skills.unlike') : t('skills.like')}
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/60',
        ghost
          ? cn(
              'min-h-8 min-w-8 rounded-lg text-muted hover:bg-line/60 hover:text-sage-deep',
              liked && 'text-sage-deep',
            )
          : cn(
              'rounded-xl border',
              compact ? 'min-h-9 min-w-9' : 'min-h-11 min-w-11',
              liked ? 'border-sage/50 bg-sage/10 text-sage-deep' : 'border-line bg-card text-muted hover:border-sage/40',
            ),
        className,
      )}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!requireSignIn()) return
        setSkillLike(techniqueId, !liked)
      }}
    >
      <Heart
        size={ghost ? 16 : compact ? 17 : 20}
        strokeWidth={1.75}
        fill={liked ? 'currentColor' : 'none'}
      />
    </button>
  )
}

export function SkillStarRating({ techniqueId }: { techniqueId: string }) {
  const { t } = useTranslation()
  const uid = useUserStore((state) => state.uid)
  const requireSignIn = useRequireSignIn()
  const rating = useCareStore((state) => (uid ? state.skillPrefs[techniqueId]?.rating : undefined))
  const hasRating = rating != null && rating >= 1 && rating <= 5
  const [animTick, setAnimTick] = useState(0)

  useEffect(() => {
    if (!uid || rating == null) return
    void backfillSkillRatingStat(techniqueId, rating)
  }, [techniqueId, rating, uid])

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[10px] leading-none text-muted">{t('skills.yourRating')}</p>
      <div
        role="group"
        aria-label={t('skills.yourRating')}
        className={cn('inline-flex gap-0.5', animTick > 0 && 'anima-rating-pop')}
      >
        {starSteps.map((step) => {
          const filled = hasRating && step <= rating
          const selected = hasRating && rating === step
          return (
            <button
              key={step}
              type="button"
              aria-label={`${step}`}
              aria-pressed={selected}
              className={cn(
                'inline-flex min-h-7 min-w-7 items-center justify-center rounded-md transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/60',
                filled ? 'text-sage' : 'text-muted hover:text-sage/80',
              )}
              onClick={() => {
                if (!requireSignIn()) return
                void setSkillRating(techniqueId, step).then((ok) => {
                  if (ok) setAnimTick((value) => value + 1)
                })
              }}
            >
              <Star size={15} strokeWidth={1.75} fill={filled ? 'currentColor' : 'none'} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** @deprecated Use SkillStarRating on skill page */
export function SkillUserRating({ techniqueId }: { techniqueId: string }) {
  return <SkillStarRating techniqueId={techniqueId} />
}
