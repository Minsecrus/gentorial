import { gentorialMarkdown } from '@gentorial/engine-vitepress'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Gentorial',
  description: '概念明文、叙事生成。',
  lang: 'zh-CN',
  srcDir: '../content',
  cleanUrls: true,
  markdown: {
    math: true,
    config: gentorialMarkdown
  },
  themeConfig: {
    nav: [{ text: '首页', link: '/' }],
    outline: { level: [2, 3] }
  }
})
