import { gentorialMarkdown } from '@gentorial/engine-vitepress'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '__COURSE_TITLE__',
  lang: '__COURSE_LANG__',
  srcDir: '../content',
  markdown: {
    math: true,
    config: gentorialMarkdown
  }
})
