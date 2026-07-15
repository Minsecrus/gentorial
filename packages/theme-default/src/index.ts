import {
  GentorialConcept,
  GentorialGenerate,
  GentorialGeneratedRegion,
  GentorialGenerateTrigger,
  GentorialMarkdownRenderer,
  GentorialPreferences,
  LessonBlockRenderer
} from '@gentorial/runtime-vue'
import type { Theme } from 'vitepress'
import { defineComponent, h } from 'vue'
import { createGentorialCodeBlock, type GentorialCodeBlockOptions } from './code-block.js'
import { GentorialMermaid } from './mermaid.js'

export type GentorialThemeOptions = {
  extends: Theme
  enhanceApp?: NonNullable<Theme['enhanceApp']>
  codeBlock?: GentorialCodeBlockOptions
}

export function createGentorialTheme(options: GentorialThemeOptions): Theme {
  const baseTheme = options.extends
  const BaseLayout = baseTheme.Layout
  if (!BaseLayout) throw new Error('Gentorial base theme must provide a Layout component')
  const Layout = defineComponent({
    name: 'GentorialLayout',
    setup() {
      return () => h(BaseLayout!, null, {
        'nav-bar-content-after': () => h(GentorialPreferences, { presentation: 'nav' })
      })
    }
  })
  const GentorialCodeBlock = createGentorialCodeBlock(options.codeBlock)

  return {
    extends: baseTheme,
    Layout,
    enhanceApp(context) {
      context.app.component('GentorialConcept', GentorialConcept)
      context.app.component('GentorialCodeBlock', GentorialCodeBlock)
      context.app.component('GentorialGenerate', GentorialGenerate)
      context.app.component('GentorialGeneratedRegion', GentorialGeneratedRegion)
      context.app.component('GentorialGenerateTrigger', GentorialGenerateTrigger)
      context.app.component('GentorialMarkdownRenderer', GentorialMarkdownRenderer)
      context.app.component('GentorialPreferences', GentorialPreferences)
      context.app.component('GentorialMermaid', GentorialMermaid)
      context.app.component('LessonBlockRenderer', LessonBlockRenderer)
      return options.enhanceApp?.(context)
    }
  }
}
