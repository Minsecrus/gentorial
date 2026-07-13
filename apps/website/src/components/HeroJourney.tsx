import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type FormEvent } from 'react'

export type JourneyView = 'actions' | 'preferences' | 'complete'

export type TutorialPreferences = {
  depth: string
  narrative: string
  outcome: string
}

type HeroJourneyProps = {
  docsUrl: string
  readUrl: string
  view: JourneyView
  preferences: TutorialPreferences
  onBack: () => void
  onContinue: (preferences: TutorialPreferences) => void
  onExplore: () => void
  onPreferencesChange: (preferences: TutorialPreferences) => void
}

const preferenceGroups = [
  {
    key: 'depth',
    label: 'Depth',
    options: ['Focused', 'Guided', 'Deep']
  },
  {
    key: 'narrative',
    label: 'Narrative',
    options: ['Direct', 'Conversational', 'Story-led']
  },
  {
    key: 'outcome',
    label: 'Outcome',
    options: ['Understand', 'Build', 'Review']
  }
] as const

type ActionWarpOrientation = 'horizontal' | 'vertical'

function createActionWarpPaths(
  orientation: ActionWarpOrientation,
  activeIndex: 0 | 1 | null
): string[] {
  const horizontal = orientation === 'horizontal'
  const halfWidth = horizontal ? 240 : 160
  const halfHeight = horizontal ? 120 : 150
  const masses = horizontal
    ? [{ x: -94, y: 0 }, { x: 94, y: 0 }]
    : [{ x: 0, y: -34 }, { x: 0, y: 34 }]
  const paths: string[] = []

  const warpPoint = (x: number, y: number): [number, number] => {
    let warpedX = x
    let warpedY = y

    masses.forEach((mass, massIndex) => {
      const dx = warpedX - mass.x
      const dy = warpedY - mass.y
      const ellipticalRadius = Math.hypot(dx / 100, dy / 38)
      const influence = Math.exp(-Math.pow((ellipticalRadius - 1.05) / 0.72, 2))
      const strength = activeIndex === massIndex ? 0.13 : 0.06
      const pull = strength * influence
      warpedX = mass.x + dx * (1 - pull)
      warpedY = mass.y + dy * (1 - pull)
    })

    return [warpedX + halfWidth, warpedY + halfHeight]
  }

  for (let x = -Math.floor(halfWidth / 32) * 32; x <= halfWidth; x += 32) {
    const points: string[] = []
    for (let y = -halfHeight; y <= halfHeight; y += 6) {
      const [mappedX, mappedY] = warpPoint(x, y)
      points.push(`${points.length === 0 ? 'M' : 'L'}${mappedX.toFixed(2)} ${mappedY.toFixed(2)}`)
    }
    paths.push(points.join(' '))
  }

  for (let y = -Math.floor(halfHeight / 32) * 32; y <= halfHeight; y += 32) {
    const points: string[] = []
    for (let x = -halfWidth; x <= halfWidth; x += 6) {
      const [mappedX, mappedY] = warpPoint(x, y)
      points.push(`${points.length === 0 ? 'M' : 'L'}${mappedX.toFixed(2)} ${mappedY.toFixed(2)}`)
    }
    paths.push(points.join(' '))
  }

  return paths
}

const horizontalActionWarpPaths = {
  resting: createActionWarpPaths('horizontal', null),
  first: createActionWarpPaths('horizontal', 0),
  second: createActionWarpPaths('horizontal', 1)
}
const verticalActionWarpPaths = {
  resting: createActionWarpPaths('vertical', null),
  first: createActionWarpPaths('vertical', 0),
  second: createActionWarpPaths('vertical', 1)
}

function ActionBarGridWarp({
  activeIndex,
  reducedMotion
}: {
  activeIndex: 0 | 1 | null
  reducedMotion: boolean
}) {
  const horizontalTarget = activeIndex === 0
    ? horizontalActionWarpPaths.first
    : activeIndex === 1 ? horizontalActionWarpPaths.second : horizontalActionWarpPaths.resting
  const verticalTarget = activeIndex === 0
    ? verticalActionWarpPaths.first
    : activeIndex === 1 ? verticalActionWarpPaths.second : verticalActionWarpPaths.resting

  return (
    <>
      <span className="action-grid-warp action-grid-warp-horizontal" aria-hidden="true">
        <svg viewBox="0 0 480 240">
          {horizontalActionWarpPaths.resting.map((path, index) => (
            <motion.path
              key={index}
              initial={false}
              d={path}
              animate={{ d: horizontalTarget[index] ?? path }}
              transition={{ duration: reducedMotion ? 0 : 0.68, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </svg>
      </span>
      <span className="action-grid-warp action-grid-warp-vertical" aria-hidden="true">
        <svg viewBox="0 0 320 300">
          {verticalActionWarpPaths.resting.map((path, index) => (
            <motion.path
              key={index}
              initial={false}
              d={path}
              animate={{ d: verticalTarget[index] ?? path }}
              transition={{ duration: reducedMotion ? 0 : 0.68, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
        </svg>
      </span>
    </>
  )
}

export function HeroJourney({
  docsUrl,
  readUrl,
  view,
  preferences,
  onBack,
  onContinue,
  onExplore,
  onPreferencesChange
}: HeroJourneyProps) {
  const reduceMotion = useReducedMotion()
  const [hoveredAction, setHoveredAction] = useState<0 | 1 | null>(null)
  const complete = Object.values(preferences).every(Boolean)
  const duration = reduceMotion ? 0 : 0.56

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (complete) onContinue(preferences)
  }

  return (
    <div id="hero-flow" className="flex w-full items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {view === 'actions' ? (
          <motion.div
            key="actions"
            className="relative isolate flex min-h-40 flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <ActionBarGridWarp
              activeIndex={hoveredAction}
              reducedMotion={Boolean(reduceMotion)}
            />
            <button
              className="group relative z-10 inline-flex h-14 min-w-44 items-center justify-center gap-3 rounded-full bg-black px-7 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-offset-4"
              type="button"
              onClick={onExplore}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'touch') setHoveredAction(0)
              }}
              onPointerLeave={() => setHoveredAction(null)}
              onFocus={() => setHoveredAction(0)}
              onBlur={() => setHoveredAction(null)}
            >
              Explore
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
            <a
              className="group relative z-10 inline-flex h-14 min-w-44 items-center justify-center gap-3 rounded-full border border-black/18 bg-white px-7 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-black/50 focus-visible:outline-offset-4"
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              onPointerEnter={(event) => {
                if (event.pointerType !== 'touch') setHoveredAction(1)
              }}
              onPointerLeave={() => setHoveredAction(null)}
              onFocus={() => setHoveredAction(1)}
              onBlur={() => setHoveredAction(null)}
            >
              Docs
              <BookOpen
                className="size-4 transition-transform duration-300 group-hover:-rotate-3"
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </a>
          </motion.div>
        ) : null}

        {view === 'preferences' ? (
          <motion.form
            key="preferences"
            layoutId="tutorial-preferences"
            className="w-full max-w-4xl border border-black/12 bg-white p-4 text-left shadow-[0_24px_80px_rgb(0_0_0_/_0.06)] sm:p-6"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 1, y: -16, scale: 0.99 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 flex items-center justify-between">
              <button
                className="inline-flex items-center gap-2 text-xs font-medium text-black/55 transition-colors hover:text-black"
                type="button"
                onClick={onBack}
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                Back
              </button>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-black/42">
                Preferences
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {preferenceGroups.map((group, groupIndex) => (
                <motion.fieldset
                  key={group.key}
                  className="min-w-0"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.46,
                    delay: reduceMotion ? 0 : 0.08 + groupIndex * 0.07,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  <legend className="mb-2 text-xs font-medium text-black/55">
                    {group.label}
                  </legend>
                  <div className="grid gap-2">
                    {group.options.map((option) => {
                      const selected = preferences[group.key] === option
                      return (
                        <button
                          key={option}
                          className={`${selected
                            ? 'border-black bg-black text-white'
                            : 'border-black/12 bg-white text-black hover:border-black/40'} flex h-11 items-center justify-between rounded-lg border px-3 text-left text-sm transition-colors`}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            onPreferencesChange({
                              ...preferences,
                              [group.key]: option
                            })
                          }}
                        >
                          {option}
                          <Check
                            className={`${selected ? 'opacity-100' : 'opacity-0'} size-3.5 transition-opacity`}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </button>
                      )
                    })}
                  </div>
                </motion.fieldset>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex h-12 min-w-40 items-center justify-center gap-3 rounded-full bg-black px-6 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-20"
                type="submit"
                disabled={!complete}
              >
                Continue
                <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </motion.form>
        ) : null}

        {view === 'complete' ? (
          <motion.div
            key="complete"
            className="relative isolate flex min-h-40 flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration, delay: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <ActionBarGridWarp
              activeIndex={hoveredAction}
              reducedMotion={Boolean(reduceMotion)}
            />
            <a
              className="group relative z-10 isolate inline-flex h-14 min-w-44 items-center justify-center overflow-hidden rounded-full bg-black px-7 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-offset-4"
              href={readUrl}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'touch') setHoveredAction(0)
              }}
              onPointerLeave={() => setHoveredAction(null)}
              onFocus={() => setHoveredAction(0)}
              onBlur={() => setHoveredAction(null)}
            >
              <span
                className="absolute inset-0 -z-10 origin-left scale-x-0 bg-gentorial-blue transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-3">
                Read
                <BookOpen
                  className="size-4 transition-transform duration-300 group-hover:-rotate-3"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>
            </a>
            <a
              className="group relative z-10 isolate inline-flex h-14 min-w-44 items-center justify-center overflow-hidden rounded-full border border-black/18 bg-white px-7 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:text-white focus-visible:outline-offset-4"
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              onPointerEnter={(event) => {
                if (event.pointerType !== 'touch') setHoveredAction(1)
              }}
              onPointerLeave={() => setHoveredAction(null)}
              onFocus={() => setHoveredAction(1)}
              onBlur={() => setHoveredAction(null)}
            >
              <span
                className="absolute inset-0 -z-10 origin-left scale-x-0 bg-gentorial-magenta transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-3">
                Docs
                <ArrowUpRight
                  className="size-4"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
