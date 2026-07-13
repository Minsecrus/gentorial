import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Copy } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

export type JourneyView = 'actions' | 'preferences' | 'byok' | 'complete'

export type TutorialPreferences = {
  depth: string
  narrative: string
  outcome: string
}

export type TutorialByok = {
  provider: string
  apiKey: string
}

type HeroJourneyProps = {
  docsUrl: string
  readUrl: string
  view: JourneyView
  byok: TutorialByok
  preferences: TutorialPreferences
  onBack: () => void
  onByokChange: (byok: TutorialByok) => void
  onContinue: (preferences: TutorialPreferences) => void
  onExplore: () => void
  onPreferencesChange: (preferences: TutorialPreferences) => void
  onSkipByok: () => void
  onSubmitByok: (byok: TutorialByok) => void
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

const scaffoldCommands = {
  npm: 'npm create @gentorial@latest',
  pnpm: 'pnpm create @gentorial@latest',
  yarn: 'yarn dlx -p @gentorial/create@latest create-gentorial',
  bun: 'bunx -p @gentorial/create@latest create-gentorial'
} as const

type PackageManager = keyof typeof scaffoldCommands

function PackageManagerLogo({ manager }: { manager: PackageManager }) {
  if (manager === 'npm') {
    return (
      <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#CB3837" d="M2 5h20v14H12v-4H9v4H2V5Z" />
        <path fill="#fff" d="M5 8h14v8h-4V9h-3v7H5V8Z" />
      </svg>
    )
  }

  if (manager === 'pnpm') {
    return (
      <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#F9AD00" d="M2 2h5.5v5.5H2V2Zm7.25 0h5.5v5.5h-5.5V2Zm7.25 0H22v5.5h-5.5V2ZM2 9.25h5.5v5.5H2v-5.5Zm7.25 0h5.5v5.5h-5.5v-5.5Z" />
        <path fill="#4A4A4A" d="M16.5 9.25H22v5.5h-5.5v-5.5ZM2 16.5h5.5V22H2v-5.5Zm7.25 0h5.5V22h-5.5v-5.5Zm7.25 0H22V22h-5.5v-5.5Z" />
      </svg>
    )
  }

  if (manager === 'yarn') {
    return (
      <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#2C8EBB" />
        <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45" d="M7.1 15.9c2.6.8 6.8.7 9.4-1.4 1.4-1.1 1.1-2.6-.2-3.1-1.2-.5-2.8.2-3.5 1.4-.7-1.8-.8-4.2.2-5.8.8-1.3.2-2.3-.8-1.2-1.4 1.5-2.1 4.6-1.2 7.2-1.1-.3-2.1-.9-2.8-1.7" />
        <circle cx="15.9" cy="12.8" r=".55" fill="#fff" />
      </svg>
    )
  }

  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FBF0DF" stroke="#1B1B1B" strokeWidth="1.15" d="M3.1 13.1c0-4.4 3.9-8 8.9-8s8.9 3.6 8.9 8c0 3.6-3.1 5.8-8.9 5.8s-8.9-2.2-8.9-5.8Z" />
      <path fill="none" stroke="#1B1B1B" strokeLinecap="round" strokeWidth="1.05" d="M7.3 8.2 8.5 6m2 1.2.3-2.1m2.4 2.2.5-2m2.1 3.3 1.1-1.5" />
      <circle cx="9.3" cy="12.3" r=".75" fill="#1B1B1B" />
      <circle cx="14.7" cy="12.3" r=".75" fill="#1B1B1B" />
      <path fill="none" stroke="#1B1B1B" strokeLinecap="round" strokeWidth="1" d="M10.5 15c.8.55 2.2.55 3 0" />
    </svg>
  )
}

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
  byok,
  preferences,
  onBack,
  onByokChange,
  onContinue,
  onExplore,
  onPreferencesChange,
  onSkipByok,
  onSubmitByok
}: HeroJourneyProps) {
  const reduceMotion = useReducedMotion()
  const [hoveredAction, setHoveredAction] = useState<0 | 1 | null>(null)
  const [commandCopied, setCommandCopied] = useState(false)
  const [packageManager, setPackageManager] = useState<PackageManager>('npm')
  const [packageMenuOpen, setPackageMenuOpen] = useState(false)
  const packageMenuRef = useRef<HTMLDivElement>(null)
  const complete = Object.values(preferences).every(Boolean)
  const duration = reduceMotion ? 0 : 0.56
  const scaffoldCommand = scaffoldCommands[packageManager]

  useEffect(() => {
    if (!packageMenuOpen) return undefined

    function closeOnOutsidePointer(event: PointerEvent): void {
      if (!packageMenuRef.current?.contains(event.target as Node)) setPackageMenuOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') setPackageMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [packageMenuOpen])

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (complete) onContinue(preferences)
  }

  async function copyScaffoldCommand(): Promise<void> {
    await navigator.clipboard.writeText(scaffoldCommand)
    setCommandCopied(true)
    window.setTimeout(() => setCommandCopied(false), 1600)
  }

  return (
    <div id="hero-flow" className="flex w-full items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {view === 'actions' ? (
          <motion.div
            key="actions"
            className="relative isolate flex min-h-48 flex-col items-center justify-center gap-5"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative z-20 flex h-10 w-[22.75rem] max-w-[calc(100vw-2.5rem)] items-center rounded-full border border-black/10 bg-white/82 font-mono text-xs text-black/76 shadow-[0_8px_28px_rgb(0_0_0_/_0.035)] backdrop-blur-sm transition-colors hover:border-black/22 hover:text-black">
              <button
                className="group/copy flex h-full min-w-0 flex-1 cursor-pointer items-center rounded-l-full pl-4 text-left focus-visible:outline-offset-[-3px]"
                type="button"
                onClick={() => void copyScaffoldCommand()}
                aria-label={commandCopied ? 'Scaffold command copied' : 'Copy scaffold command'}
              >
                <span className="mr-2 text-black/28" aria-hidden="true">$</span>
                <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {scaffoldCommand}
                </code>
                <span className="grid size-9 shrink-0 place-items-center text-black/36 transition-colors group-hover/copy:text-black">
                  {commandCopied ? (
                    <Check className="size-3.5 text-emerald-600" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  )}
                </span>
              </button>
              <span className="h-4 w-px shrink-0 bg-black/10" aria-hidden="true" />
              <div ref={packageMenuRef} className="relative flex h-full shrink-0 items-center">
                <button
                  className="flex h-full w-14 cursor-pointer items-center justify-center gap-1.5 rounded-r-full transition-colors hover:bg-black/[0.035] focus-visible:outline-offset-[-3px]"
                  type="button"
                  aria-label={`Package manager: ${packageManager}`}
                  aria-haspopup="listbox"
                  aria-expanded={packageMenuOpen}
                  onClick={() => setPackageMenuOpen((open) => !open)}
                >
                  <PackageManagerLogo manager={packageManager} />
                  <ChevronDown
                    className={`${packageMenuOpen ? 'rotate-180' : ''} size-3 text-black/35 transition-transform duration-200`}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence>
                  {packageMenuOpen ? (
                    <motion.div
                      className="absolute right-0 top-[calc(100%+0.5rem)] grid w-[5.75rem] grid-cols-2 gap-1 rounded-xl border border-black/10 bg-white p-1.5 shadow-[0_16px_44px_rgb(0_0_0_/_0.12)] sm:left-[calc(100%+0.5rem)] sm:right-auto sm:top-1/2 sm:-translate-y-1/2"
                      role="listbox"
                      aria-label="Package manager"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {(Object.keys(scaffoldCommands) as PackageManager[]).map((manager) => (
                        <button
                          key={manager}
                          className={`${manager === packageManager ? 'bg-black/[0.065]' : 'hover:bg-black/[0.035]'} grid size-9 cursor-pointer place-items-center rounded-lg transition-colors focus-visible:outline-offset-[-2px]`}
                          type="button"
                          role="option"
                          aria-selected={manager === packageManager}
                          aria-label={manager}
                          title={manager}
                          onClick={() => {
                            setPackageManager(manager)
                            setCommandCopied(false)
                            setPackageMenuOpen(false)
                          }}
                        >
                          <PackageManagerLogo manager={manager} />
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <div className="relative isolate flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ActionBarGridWarp
                activeIndex={hoveredAction}
                reducedMotion={Boolean(reduceMotion)}
              />
              <button
                className="group relative z-10 isolate inline-flex h-14 min-w-44 items-center justify-center overflow-hidden rounded-full bg-black px-7 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-offset-4"
                type="button"
                onClick={onExplore}
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
                  Explore
                  <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden="true" />
                </span>
              </button>
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
                  <BookOpen className="size-4" strokeWidth={1.7} aria-hidden="true" />
                </span>
              </a>
            </div>
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
                1 / 2 · Preferences
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

        {view === 'byok' ? (
          <motion.form
            key="byok"
            layoutId="tutorial-preferences"
            className="w-full max-w-4xl border border-black/12 bg-white p-4 text-left shadow-[0_24px_80px_rgb(0_0_0_/_0.06)] sm:p-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (byok.apiKey.trim()) onSubmitByok(byok)
            }}
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 1, y: -16, scale: 0.99 }}
            transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                className="inline-flex items-center gap-2 text-xs font-medium text-black/55 transition-colors hover:text-black"
                type="button"
                onClick={onBack}
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                Back
              </button>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-black/42">
                2 / 2 · BYOK
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-[0.75fr_1.25fr]">
              <label className="grid gap-2 text-xs font-medium text-black/55">
                Provider
                <select
                  className="h-12 rounded-lg border border-black/12 bg-white px-3 text-sm font-normal text-black outline-none transition-colors focus:border-black/45"
                  value={byok.provider}
                  onChange={(event) => onByokChange({ ...byok, provider: event.currentTarget.value })}
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="custom">OpenAI-compatible</option>
                </select>
              </label>
              <label className="grid gap-2 text-xs font-medium text-black/55">
                API key
                <input
                  className="h-12 rounded-lg border border-black/12 bg-white px-3 font-mono text-sm font-normal text-black outline-none transition-colors placeholder:text-black/25 focus:border-black/45"
                  type="password"
                  value={byok.apiKey}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Stored in memory for this session only"
                  onChange={(event) => onByokChange({ ...byok, apiKey: event.currentTarget.value })}
                />
              </label>
            </div>

            <p className="mt-4 text-xs leading-5 text-black/42">
              Optional. Direct browser credentials stay in this session only and are never written to the site bundle or local storage.
            </p>

            <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
              <button
                className="inline-flex h-12 min-w-32 items-center justify-center rounded-full border border-black/14 px-5 text-sm font-medium text-black transition-colors hover:border-black/40"
                type="button"
                onClick={onSkipByok}
              >
                Skip
              </button>
              <button
                className="inline-flex h-12 min-w-40 items-center justify-center gap-3 rounded-full bg-black px-6 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-20"
                type="submit"
                disabled={!byok.apiKey.trim()}
              >
                Save & continue
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
