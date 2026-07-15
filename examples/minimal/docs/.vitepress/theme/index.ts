import {
  createBrowserByokGenerator,
  type BrowserByokProvider
} from '@gentorial/ai'
import { createGentorialRuntime } from '@gentorial/runtime-vue'
import { createGentorialTheme } from '@gentorial/theme-default'
import '@gentorial/theme-default/style.css'
import DefaultTheme from 'vitepress/theme'
import course from '../../../course.config.js'

const runtime = createGentorialRuntime({
  allowUnsafeHtml: course.rendering?.allowUnsafeHtml,
  learnerProfile: {
    detail: 'balanced',
    tone: 'conversational',
    narrative: 'timeline'
  },
  generate(request, context) {
    const input = {
      course,
      generate: request.generate,
      concepts: request.concepts,
      ...(request.learner ? { learner: request.learner } : {}),
      ...(request.conversation ? { conversation: request.conversation } : {})
    }
    if (!context.byok) {
      throw new Error('尚未配置生成服务。请先在 Preferences 中配置 BYOK。')
    }
    const activeGenerator = createBrowserByokGenerator({
      ...context.byok,
      provider: context.byok.provider as BrowserByokProvider
    })
    return activeGenerator.stream?.(input, { signal: context.signal })
      ?? activeGenerator.generate(input, { signal: context.signal })
  }
})

export default createGentorialTheme({
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.use(runtime)
  }
})
