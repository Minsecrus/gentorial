import type { UserConfig } from 'vitepress'
import { installGentorialMarkdown } from './markdown.js'

/** @deprecated Use VitePress defineConfig with markdown.config: gentorialMarkdown. */
export function defineGentorialConfig<ThemeConfig = unknown>(
  config: UserConfig<ThemeConfig>
): UserConfig<ThemeConfig> {
  const configureMarkdown = config.markdown?.config

  return {
    ...config,
    markdown: {
      ...config.markdown,
      config(markdown) {
        installGentorialMarkdown(markdown)
        configureMarkdown?.(markdown)
      }
    }
  }
}
