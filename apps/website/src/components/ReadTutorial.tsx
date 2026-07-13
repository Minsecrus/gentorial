import {
  Check,
  Copy,
  FileCode2,
  Maximize2,
  Minimize2,
  RotateCcw,
  ThumbsDown,
  ThumbsUp
} from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type GenerationState = 'idle' | 'generating' | 'success' | 'error'

const generatedText: Record<string, string> = {
  'c-history': `C 并不是从零开始设计的语言。ALGOL 建立了块结构与结构化控制流的表达方式，CPL 和 BCPL 则继续探索如何用更接近机器的形式实现通用编程语言。

B 从 BCPL 中保留了紧凑、面向系统编程的特征。C 在此基础上加入类型系统，并让数组、指针和机器内存模型形成了更直接的对应关系。这些选择使它既能编写操作系统，也能保持相对清晰的程序结构。`,
  'switch-range': `switch 会先计算一个离散值，再判断它与哪个 case 常量相等。成绩区间需要判断的是“是否落在某个范围内”，并不是与单个值相等。

if (score >= 90) grade = 'A';
else if (score >= 80) grade = 'B';`,
  'switch-table': `当每个分支唯一变化的只是数据时，可以把差异提取到表中，让控制流程只保留一份。这样新增选项通常只需要增加数据，而不需要复制一整段分支逻辑。

如果不同分支确实拥有不同的行为、前置条件或副作用，继续使用 switch 反而更清楚。表驱动不是目标，准确表达差异才是。`
}

const generatedMarkdown: Record<string, string> = {
  'c-history': generatedText['c-history'] ?? '',
  'switch-range': `\`switch\` 会先计算一个离散值，再判断它与哪个 \`case\` 常量相等。成绩区间需要判断的是“是否落在某个范围内”，并不是与单个值相等。

\`\`\`c
if (score >= 90) grade = 'A';
else if (score >= 80) grade = 'B';
\`\`\``,
  'switch-table': `当每个分支唯一变化的只是数据时，可以把差异提取到表中，让控制流程只保留一份。这样新增选项通常只需要增加数据，而不需要复制一整段分支逻辑。

如果不同分支确实拥有不同的行为、前置条件或副作用，继续使用 \`switch\` 反而更清楚。表驱动不是目标，准确表达差异才是。`
}

type GeneratedSectionProps = {
  children: ReactNode
  id: string
  open: boolean
  state: GenerationState
  onActivate: () => void
  onCopy: (format: 'text' | 'markdown') => void
  onFeedback: (feedback: 'up' | 'down') => void
  onRegenerate: () => void
  onToggleExpanded: () => void
  copiedFormat: 'text' | 'markdown' | null
  feedback: 'up' | 'down' | null
  title: ReactNode
}

type IconControlProps = {
  active?: boolean
  children: ReactNode
  label: string
  onClick: () => void
}

function IconControl({ active = false, children, label, onClick }: IconControlProps) {
  return (
    <button
      className={`${active ? 'text-black' : 'text-black/32 hover:text-black'} inline-flex size-6 items-center justify-center transition-colors focus-visible:text-black focus-visible:outline-offset-2 sm:size-7`}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function MiniOrbVisual({ state }: { state: GenerationState }) {
  const reduceMotion = useReducedMotion()
  const primaryRotation = useMotionValue(0)
  const secondaryRotation = useMotionValue(0)
  const primarySpeed = useRef(62)
  const secondarySpeed = useRef(-43)
  const speedTransition = useRef({
    elapsed: 1000,
    primaryStart: 62,
    primaryTarget: 62,
    secondaryStart: -43,
    secondaryTarget: -43
  })

  useEffect(() => {
    const generating = state === 'generating'
    speedTransition.current = {
      elapsed: 0,
      primaryStart: primarySpeed.current,
      primaryTarget: generating ? 620 : 62,
      secondaryStart: secondarySpeed.current,
      secondaryTarget: generating ? -430 : -43
    }
  }, [state])

  useAnimationFrame((_time, delta) => {
    if (reduceMotion) return

    const transition = speedTransition.current
    transition.elapsed = Math.min(transition.elapsed + delta, 1000)
    const progress = transition.elapsed / 1000
    const eased = 1 - Math.pow(1 - progress, 3)

    primarySpeed.current = transition.primaryStart
      + (transition.primaryTarget - transition.primaryStart) * eased
    secondarySpeed.current = transition.secondaryStart
      + (transition.secondaryTarget - transition.secondaryStart) * eased
    primaryRotation.set((primaryRotation.get() + primarySpeed.current * delta / 1000) % 360)
    secondaryRotation.set((secondaryRotation.get() + secondarySpeed.current * delta / 1000) % 360)
  })

  return (
    <span className="mini-orb" aria-hidden="true">
      <span className="mini-orb-base" />
      <motion.span className="mini-orb-liquid-primary" style={{ rotate: primaryRotation }} />
      <motion.span className="mini-orb-liquid-secondary" style={{ rotate: secondaryRotation }} />
      <span className="mini-orb-sheen" />
    </span>
  )
}

function GeneratedSection({
  children,
  id,
  open,
  state,
  onActivate,
  onCopy,
  onFeedback,
  onRegenerate,
  onToggleExpanded,
  copiedFormat,
  feedback,
  title
}: GeneratedSectionProps) {
  const reduceMotion = useReducedMotion()
  const triggerLabel = state === 'generating'
    ? '正在生成'
    : state === 'error'
      ? '重新生成'
      : state === 'success'
        ? '显示结果操作'
        : '按需展开'

  return (
    <section id={id} className="scroll-mt-28 border-t border-black/10 py-10 sm:py-14">
      <h2 className="group/generation-controls flex items-baseline gap-2 text-[clamp(1.55rem,3vw,2.25rem)] font-semibold tracking-[-0.035em]">
        <span>{title}</span>
        <span className="relative inline-flex shrink-0 items-center">
          <button
            className="mini-orb-trigger inline-flex size-8 shrink-0 items-center justify-center focus-visible:outline-offset-2"
            type="button"
            data-state={state}
            aria-label={triggerLabel}
            aria-expanded={open}
            aria-busy={state === 'generating'}
            aria-disabled={state === 'generating'}
            aria-controls={`${id}-generated`}
            onClick={onActivate}
          >
            <MiniOrbVisual state={state} />
          </button>

          {state === 'success' ? (
            <span className="generation-toolbar pointer-events-none absolute left-full top-1/2 z-20 flex -translate-y-1/2 items-center whitespace-nowrap pl-1 opacity-0 transition-opacity duration-200 group-hover/generation-controls:pointer-events-auto group-hover/generation-controls:opacity-100 group-focus-within/generation-controls:pointer-events-auto group-focus-within/generation-controls:opacity-100">
              <IconControl label="重新生成" onClick={onRegenerate}>
                <RotateCcw className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
              </IconControl>
              <IconControl label="复制文字" onClick={() => onCopy('text')}>
                {copiedFormat === 'text'
                  ? <Check className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  : <Copy className="size-3.5" strokeWidth={1.7} aria-hidden="true" />}
              </IconControl>
              <IconControl label="复制 Markdown" onClick={() => onCopy('markdown')}>
                {copiedFormat === 'markdown'
                  ? <Check className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
                  : <FileCode2 className="size-3.5" strokeWidth={1.7} aria-hidden="true" />}
              </IconControl>
              <IconControl active={feedback === 'up'} label="赞同" onClick={() => onFeedback('up')}>
                <ThumbsUp className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
              </IconControl>
              <IconControl active={feedback === 'down'} label="反对" onClick={() => onFeedback('down')}>
                <ThumbsDown className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
              </IconControl>
              <IconControl label={open ? '收起讲解' : '展开讲解'} onClick={onToggleExpanded}>
                {open
                  ? <Minimize2 className="size-3.5" strokeWidth={1.7} aria-hidden="true" />
                  : <Maximize2 className="size-3.5" strokeWidth={1.7} aria-hidden="true" />}
              </IconControl>
            </span>
          ) : null}
        </span>
      </h2>

      {children}

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-generated`}
            className="mt-7 space-y-5 text-[1.02rem] leading-8 text-black/72"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
            transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {id === 'c-history' ? (
              <>
                <p>
                  C 并不是从零开始设计的语言。ALGOL 建立了块结构与结构化控制流的表达方式，CPL
                  和 BCPL 则继续探索如何用更接近机器的形式实现通用编程语言。
                </p>
                <p>
                  B 从 BCPL 中保留了紧凑、面向系统编程的特征。C 在此基础上加入类型系统，并让数组、指针和机器内存模型形成了更直接的对应关系。这些选择使它既能编写操作系统，也能保持相对清晰的程序结构。
                </p>
              </>
            ) : id === 'switch-range' ? (
              <>
                <p>
                  <code className="font-mono text-[0.92em]">switch</code>{' '}
                  会先计算一个离散值，再判断它与哪个{' '}
                  <code className="font-mono text-[0.92em]">case</code> 常量相等。成绩区间需要判断的是
                  “是否落在某个范围内”，并不是与单个值相等。
                </p>
                <pre className="overflow-x-auto border-l-2 border-gentorial-blue bg-black/[0.025] px-5 py-4 font-mono text-sm leading-6 text-black/72">
                  <code>{`if (score >= 90) grade = 'A';\nelse if (score >= 80) grade = 'B';`}</code>
                </pre>
              </>
            ) : (
              <>
                <p>
                  当每个分支唯一变化的只是数据时，可以把差异提取到表中，让控制流程只保留一份。这样新增选项通常只需要增加数据，而不需要复制一整段分支逻辑。
                </p>
                <p>
                  如果不同分支确实拥有不同的行为、前置条件或副作用，继续使用{' '}
                  <code className="font-mono text-[0.92em]">switch</code> 反而更清楚。表驱动不是目标，准确表达差异才是。
                </p>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

export function ReadTutorial() {
  const reduceMotion = useReducedMotion()
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set())
  const [generationStates, setGenerationStates] = useState<Record<string, GenerationState>>({})
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down' | null>>({})
  const [copiedSection, setCopiedSection] = useState<{ id: string; format: 'text' | 'markdown' } | null>(null)
  const generationTimers = useRef<number[]>([])

  useEffect(() => () => {
    generationTimers.current.forEach((timer) => window.clearTimeout(timer))
  }, [])

  function activateSection(id: string): void {
    const state = generationStates[id] ?? 'idle'
    if (state === 'generating') return

    if (state === 'success') return

    startGeneration(id)
  }

  function startGeneration(id: string): void {
    setGenerationStates((current) => ({ ...current, [id]: 'generating' }))
    setFeedback((current) => ({ ...current, [id]: null }))
    setCopiedSection((current) => current?.id === id ? null : current)
    const timer = window.setTimeout(() => {
      setGenerationStates((current) => ({ ...current, [id]: 'success' }))
      setOpenSections((current) => new Set(current).add(id))
    }, 1800)
    generationTimers.current.push(timer)
  }

  function toggleExpanded(id: string): void {
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateFeedback(id: string, value: 'up' | 'down'): void {
    setFeedback((current) => ({
      ...current,
      [id]: current[id] === value ? null : value
    }))
  }

  async function copyGenerated(id: string, format: 'text' | 'markdown'): Promise<void> {
    const content = format === 'markdown' ? generatedMarkdown[id] : generatedText[id]
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setCopiedSection({ id, format })
      const timer = window.setTimeout(() => setCopiedSection(null), 1200)
      generationTimers.current.push(timer)
    } catch {
      setCopiedSection(null)
    }
  }

  function scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div id="top" className="min-h-svh bg-white px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-32 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[13rem_minmax(0,48rem)] lg:justify-center lg:gap-20">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 border-l border-black/12 pl-5 text-sm" aria-label="本页目录">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-black/35">
              Contents
            </p>
            <div className="grid gap-3 text-black/48">
              <button className="text-left transition-colors hover:text-black" type="button" onClick={() => scrollToSection('c-history')}>C 的历史</button>
              <button className="text-left transition-colors hover:text-black" type="button" onClick={() => scrollToSection('switch-boundary')}>switch 的适用边界</button>
              <button className="text-left transition-colors hover:text-black" type="button" onClick={() => scrollToSection('switch-range')}>连续范围</button>
              <button className="text-left transition-colors hover:text-black" type="button" onClick={() => scrollToSection('switch-table')}>相似分支</button>
            </div>
          </nav>
        </aside>

        <article className="min-w-0">
          <header className="pb-12 sm:pb-16">
            <h1 className="max-w-3xl text-[clamp(2.8rem,7vw,5.7rem)] font-bold leading-[0.92] tracking-[-0.055em]">
              在开始编程之前
            </h1>
            <p className="mt-7 max-w-2xl text-[clamp(1rem,1.8vw,1.2rem)] font-light leading-8 text-black/52">
              从语言的形成过程出发，理解 C 如何表达离散选择，以及什么时候不应该使用{' '}
              <code className="font-mono text-[0.9em]">switch</code>。
            </p>
          </header>

          <GeneratedSection
            id="c-history"
            title="C 的历史"
            open={openSections.has('c-history')}
            state={generationStates['c-history'] ?? 'idle'}
            onActivate={() => activateSection('c-history')}
            onRegenerate={() => startGeneration('c-history')}
            onCopy={(format) => void copyGenerated('c-history', format)}
            onFeedback={(value) => updateFeedback('c-history', value)}
            onToggleExpanded={() => toggleExpanded('c-history')}
            copiedFormat={copiedSection?.id === 'c-history' ? copiedSection.format : null}
            feedback={feedback['c-history'] ?? null}
          >
            <ol className="mt-7 grid gap-px border border-black/12 sm:grid-cols-3">
              {['ALGOL、CPL、BCPL', 'B', 'C'].map((item, index) => (
                <li key={item} className="flex min-h-24 items-end bg-white p-5">
                  <span className="mr-3 font-mono text-xs text-black/28">0{index + 1}</span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ol>
          </GeneratedSection>

          <section id="switch-boundary" className="scroll-mt-28 border-t border-black/10 pt-10 sm:pt-14">
            <div className="border-l-2 border-gentorial-magenta pl-5 sm:pl-7">
              <h2 className="text-[clamp(1.55rem,3vw,2.25rem)] font-semibold tracking-[-0.035em]">
                <code className="font-mono text-[0.9em]">switch</code> 的适用边界
              </h2>
              <p className="mt-5 text-[1.02rem] leading-8 text-black/68">
                <code className="font-mono text-[0.92em]">switch</code>{' '}
                根据整数类型表达式经整数提升后的离散结果选择分支。
              </p>
            </div>
          </section>

          <GeneratedSection
            id="switch-range"
            title="连续范围"
            open={openSections.has('switch-range')}
            state={generationStates['switch-range'] ?? 'idle'}
            onActivate={() => activateSection('switch-range')}
            onRegenerate={() => startGeneration('switch-range')}
            onCopy={(format) => void copyGenerated('switch-range', format)}
            onFeedback={(value) => updateFeedback('switch-range', value)}
            onToggleExpanded={() => toggleExpanded('switch-range')}
            copiedFormat={copiedSection?.id === 'switch-range' ? copiedSection.format : null}
            feedback={feedback['switch-range'] ?? null}
          >
            <p className="mt-6 text-[1.02rem] leading-8 text-black/68">
              成绩区间一类问题描述的是连续范围，而{' '}
              <code className="font-mono text-[0.92em]">switch</code> 面向的是离散分支值。
            </p>
          </GeneratedSection>

          <GeneratedSection
            id="switch-table"
            title="相似分支"
            open={openSections.has('switch-table')}
            state={generationStates['switch-table'] ?? 'idle'}
            onActivate={() => activateSection('switch-table')}
            onRegenerate={() => startGeneration('switch-table')}
            onCopy={(format) => void copyGenerated('switch-table', format)}
            onFeedback={(value) => updateFeedback('switch-table', value)}
            onToggleExpanded={() => toggleExpanded('switch-table')}
            copiedFormat={copiedSection?.id === 'switch-table' ? copiedSection.format : null}
            feedback={feedback['switch-table'] ?? null}
          >
            <p className="mt-6 text-[1.02rem] leading-8 text-black/68">
              如果多个选项只对应不同数据，而执行步骤保持相同，重复分支可能掩盖真正的数据结构。
            </p>
          </GeneratedSection>
        </article>
      </div>
      <svg
        className="orb-filter-defs"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id="gentorial-mini-liquid-warp"
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.075 0.11"
              numOctaves="2"
              seed="19"
              result="noise"
            >
              {!reduceMotion ? (
                <animate
                  attributeName="baseFrequency"
                  dur="6.8s"
                  values="0.075 0.11;0.12 0.065;0.075 0.11"
                  repeatCount="indefinite"
                />
              ) : null}
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
