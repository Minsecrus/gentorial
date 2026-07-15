import {
  createBrowserByokGenerator,
  createGentorialServerGenerator,
  type BrowserByokProvider
} from '@gentorial/ai'
import { createGentorialRuntime } from '@gentorial/runtime-vue'
import { createGentorialTheme } from '@gentorial/theme-default'
import '@gentorial/theme-default/style.css'
import DefaultTheme from 'vitepress/theme'
import course from '../../../course.config.js'

const managedGenerator = createGentorialServerGenerator({
  endpoint: '/api/gentorial/generate'
})

const runtime = createGentorialRuntime({
  allowUnsafeHtml: course.rendering?.allowUnsafeHtml,
  learnerProfile: {
    detail: 'balanced',
    tone: 'conversational',
    narrative: 'direct'
  },
  generate(request, context) {
    const input = {
      course,
      generate: request.generate,
      concepts: request.concepts,
      ...(request.learner ? { learner: request.learner } : {}),
      ...(request.conversation ? { conversation: request.conversation } : {})
    }
    const activeGenerator = context.byok
      ? createBrowserByokGenerator({
          ...context.byok,
          provider: context.byok.provider as BrowserByokProvider
        })
      : managedGenerator
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
