import { gentorialMarkdown } from '@gentorial/engine-vitepress'
import { defineConfig } from 'vitepress'
import serverConfig from '../../gentorial.server.config.js'

export default defineConfig({
  title: '__COURSE_TITLE__',
  lang: '__COURSE_LANG__',
  srcDir: '../content',
  markdown: {
    math: true,
    config: gentorialMarkdown
  },
  vite: {
    server: {
      proxy: {
        '/api/gentorial': `http://127.0.0.1:${serverConfig.port}`
      }
    }
  }
})
