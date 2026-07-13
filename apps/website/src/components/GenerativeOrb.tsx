import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring
} from 'motion/react'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent
} from 'react'

type GenerativeOrbProps = {
  onActivate: () => void
  onShatterComplete: () => void
}

const liquidFilterId = 'gentorial-liquid-warp'
const warpGridOffsets = Array.from({ length: 17 }, (_, index) => (index - 8) * 32)

function createWarpedLine(axis: 'horizontal' | 'vertical', offset: number, strength: number): string {
  const points: string[] = []

  for (let step = -288; step <= 288; step += 8) {
    const x = axis === 'vertical' ? offset : step
    const y = axis === 'vertical' ? step : offset
    const radius = Math.hypot(x, y)
    const influence = Math.exp(-Math.pow((radius - 132) / 92, 2))
    const outerProgress = Math.max(0, Math.min(1, (radius - 190) / 86))
    const outerFade = 1 - outerProgress * outerProgress * (3 - 2 * outerProgress)
    const displacement = strength * influence * outerFade
    const mappedRadius = Math.max(radius - displacement, 0)
    const scale = radius === 0 ? 1 : mappedRadius / radius
    const mappedX = 300 + x * scale
    const mappedY = 300 + y * scale
    points.push(`${points.length === 0 ? 'M' : 'L'}${mappedX.toFixed(2)} ${mappedY.toFixed(2)}`)
  }

  return points.join(' ')
}

const restingWarpPaths = warpGridOffsets.flatMap((offset) => [
  createWarpedLine('vertical', offset, 18),
  createWarpedLine('horizontal', offset, 18)
])

const activeWarpPaths = warpGridOffsets.flatMap((offset) => [
  createWarpedLine('vertical', offset, 34),
  createWarpedLine('horizontal', offset, 34)
])

const flatWarpPaths = warpGridOffsets.flatMap((offset) => [
  createWarpedLine('vertical', offset, 0),
  createWarpedLine('horizontal', offset, 0)
])

function OrbitalGridWarp({
  active,
  reducedMotion,
  shattering
}: {
  active: boolean
  reducedMotion: boolean
  shattering: boolean
}) {
  const targetPaths = shattering
    ? flatWarpPaths
    : active ? activeWarpPaths : restingWarpPaths

  return (
    <span className="orb-grid-warp absolute" aria-hidden="true">
      <svg className="orb-grid-warp-layer" viewBox="0 0 600 600">
        {restingWarpPaths.map((path, index) => (
          <motion.path
            key={index}
            initial={false}
            d={path}
            animate={{ d: targetPaths[index] ?? path }}
            transition={{
              duration: reducedMotion ? 0 : shattering ? 0.52 : 0.9,
              ease: [0.16, 1, 0.3, 1]
            }}
          />
        ))}
      </svg>
    </span>
  )
}

const orbShards = [
  { clipPath: 'polygon(50% 50%, 50% 0%, 75% 7%)', x: 22, y: -86, rotate: 18, delay: 0 },
  { clipPath: 'polygon(50% 50%, 75% 7%, 93% 25%)', x: 66, y: -64, rotate: 38, delay: 0.018 },
  { clipPath: 'polygon(50% 50%, 93% 25%, 100% 50%)', x: 92, y: -22, rotate: 52, delay: 0.032 },
  { clipPath: 'polygon(50% 50%, 100% 50%, 93% 75%)', x: 90, y: 28, rotate: 64, delay: 0.048 },
  { clipPath: 'polygon(50% 50%, 93% 75%, 75% 93%)', x: 62, y: 72, rotate: 42, delay: 0.026 },
  { clipPath: 'polygon(50% 50%, 75% 93%, 50% 100%)', x: 20, y: 92, rotate: 22, delay: 0.056 },
  { clipPath: 'polygon(50% 50%, 50% 100%, 25% 93%)', x: -22, y: 88, rotate: -18, delay: 0.014 },
  { clipPath: 'polygon(50% 50%, 25% 93%, 7% 75%)', x: -66, y: 70, rotate: -42, delay: 0.04 },
  { clipPath: 'polygon(50% 50%, 7% 75%, 0% 50%)', x: -92, y: 24, rotate: -58, delay: 0.022 },
  { clipPath: 'polygon(50% 50%, 0% 50%, 7% 25%)', x: -88, y: -28, rotate: -66, delay: 0.052 },
  { clipPath: 'polygon(50% 50%, 7% 25%, 25% 7%)', x: -62, y: -68, rotate: -38, delay: 0.01 },
  { clipPath: 'polygon(50% 50%, 25% 7%, 50% 0%)', x: -18, y: -92, rotate: -22, delay: 0.044 }
] as const

export function GenerativeOrb({ onActivate, onShatterComplete }: GenerativeOrbProps) {
  const reducedMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [shattering, setShattering] = useState(false)
  const [pulseToken, setPulseToken] = useState(0)
  const active = (hovered || focused) && !shattering
  const activeRef = useRef(active)
  const shatteringRef = useRef(false)
  const completionRef = useRef(onShatterComplete)
  const speedRef = useRef(16)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const followX = useSpring(pointerX, { stiffness: 140, damping: 22, mass: 0.65 })
  const followY = useSpring(pointerY, { stiffness: 140, damping: 22, mass: 0.65 })
  const primaryRotation = useMotionValue(18)
  const secondaryRotation = useMotionValue(-12)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    completionRef.current = onShatterComplete
  }, [onShatterComplete])

  useEffect(() => {
    if (!shattering) return
    const timeout = window.setTimeout(
      () => completionRef.current(),
      reducedMotion ? 0 : 940
    )
    return () => window.clearTimeout(timeout)
  }, [reducedMotion, shattering])

  useAnimationFrame((_, frameDelta) => {
    if (reducedMotion || shatteringRef.current) return

    const delta = Math.min(frameDelta / 1000, 0.05)
    const targetSpeed = activeRef.current ? 72 : 16
    const easing = 1 - Math.exp(-delta * 4.8)

    speedRef.current += (targetSpeed - speedRef.current) * easing
    primaryRotation.set(primaryRotation.get() + speedRef.current * delta)
    secondaryRotation.set(secondaryRotation.get() - speedRef.current * 0.68 * delta)
  })

  function resetPointer(): void {
    pointerX.set(0)
    pointerY.set(0)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>): void {
    if (reducedMotion || shattering || event.pointerType === 'touch') return

    const rect = event.currentTarget.getBoundingClientRect()
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5

    pointerX.set(normalizedX * 12)
    pointerY.set(normalizedY * 10)
  }

  function handleClick(): void {
    if (shattering) return
    setPulseToken((token) => token + 1)
    setHovered(false)
    resetPointer()
    shatteringRef.current = true
    setShattering(true)
    onActivate()
  }

  const interactionTransition = {
    duration: reducedMotion ? 0 : 0.76,
    ease: [0.22, 1, 0.36, 1] as const
  }

  return (
    <div
      className="orb-float-shell relative"
      data-active={active ? 'true' : 'false'}
      data-shattering={shattering ? 'true' : 'false'}
    >
      <OrbitalGridWarp
        active={active}
        reducedMotion={Boolean(reducedMotion)}
        shattering={shattering}
      />
      <motion.button
        className="orb-button relative z-10 grid size-[min(58vw,13.5rem)] place-items-center rounded-full sm:size-[15.5rem] lg:size-[18rem]"
        type="button"
        aria-label="展开生成式界面"
        aria-controls="hero-flow"
        data-active={active ? 'true' : 'false'}
        data-shattering={shattering ? 'true' : 'false'}
        disabled={shattering}
        animate={{ scale: shattering ? 0.985 : active ? 1.035 : 1 }}
        whileTap={{ scale: reducedMotion ? 1 : 0.97 }}
        transition={reducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 190, damping: 21, mass: 0.7 }}
        onClick={handleClick}
        onFocus={(event) => {
          setFocused(event.currentTarget.matches(':focus-visible'))
        }}
        onBlur={() => setFocused(false)}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') setHovered(true)
        }}
        onPointerLeave={() => {
          setHovered(false)
          resetPointer()
        }}
        onPointerMove={handlePointerMove}
      >
        <motion.span
          className="orb-pointer-follow absolute inset-0"
          style={{ x: followX, y: followY }}
          aria-hidden="true"
        >
          <motion.span
            className="orb-aura-stack absolute inset-0"
            animate={{
              opacity: shattering ? 0 : 1,
              scale: shattering ? 1.28 : 1
            }}
            transition={{ duration: reducedMotion ? 0 : 0.52, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="orb-aura-rotation absolute inset-0"
              style={{ rotate: secondaryRotation }}
            >
              <span className="orb-aura-base absolute rounded-full" />
              <motion.span
                className="orb-aura-boost absolute rounded-full"
                initial={false}
                animate={{
                  opacity: active ? 0.48 : 0,
                  scale: active ? 1 : 0.88
                }}
                transition={interactionTransition}
              />
            </motion.span>
          </motion.span>

          <motion.span
            className="orb-surface absolute overflow-hidden rounded-full"
            initial={false}
            animate={{
              opacity: shattering ? 0 : active ? 1 : 0.76,
              scale: shattering ? 0.96 : 1
            }}
            transition={shattering
              ? { duration: reducedMotion ? 0 : 0.08 }
              : interactionTransition}
          >
            <motion.span
              className="orb-liquid-primary absolute rounded-full"
              style={{ rotate: primaryRotation }}
            />
            <motion.span
              className="orb-liquid-secondary absolute rounded-full"
              style={{ rotate: secondaryRotation }}
            />
            <span className="orb-sheen absolute rounded-full" />
          </motion.span>

          {shattering ? (
            <span className="orb-shatter-layer absolute" aria-hidden="true">
              {orbShards.map((shard) => (
                <span
                  key={shard.clipPath}
                  className="orb-shard absolute inset-0 rounded-full"
                  style={{
                    clipPath: shard.clipPath,
                    animationDelay: `${shard.delay}s`,
                    '--shard-x': `${shard.x}px`,
                    '--shard-y': `${shard.y}px`,
                    '--shard-rotate': `${shard.rotate}deg`
                  } as CSSProperties}
                />
              ))}
              <span className="orb-shatter-flash absolute rounded-full" />
            </span>
          ) : null}

          {pulseToken > 0 ? (
            <span
              key={pulseToken}
              className="orb-click-wave absolute rounded-full"
            />
          ) : null}
        </motion.span>
      </motion.button>

      <svg
        className="orb-filter-defs"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={liquidFilterId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.021"
              numOctaves="3"
              seed="19"
              result="noise"
            >
              {!reducedMotion && !shattering ? (
                <animate
                  attributeName="baseFrequency"
                  dur="9s"
                  values="0.014 0.021;0.023 0.011;0.014 0.021"
                  repeatCount="indefinite"
                />
              ) : null}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="58"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
